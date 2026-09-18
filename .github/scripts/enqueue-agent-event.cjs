const path = require("path");

function cleanId(value) {
  const id = String(value || "")
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!id) throw new Error("event id is empty");
  return id.slice(0, 120);
}

function decodeContent(data) {
  if (!data || Array.isArray(data) || data.type !== "file") {
    throw new Error("expected a file response");
  }
  return Buffer.from(data.content, data.encoding || "base64").toString("utf8");
}

async function readWake(github, owner, repo, branch) {
  const res = await github.rest.repos.getContent({
    owner,
    repo,
    path: ".agent/wake.json",
    ref: branch,
  });
  const wake = JSON.parse(decodeContent(res.data));
  if (
    wake.schema_version !== 1 ||
    typeof wake.pending !== "boolean" ||
    !Number.isInteger(wake.generation) ||
    wake.generation < 0
  ) {
    throw new Error("invalid .agent/wake.json");
  }
  return wake;
}

async function eventExists(github, owner, repo, branch, eventPath) {
  try {
    await github.rest.repos.getContent({
      owner,
      repo,
      path: eventPath,
      ref: branch,
    });
    return true;
  } catch (error) {
    if (error.status === 404) return false;
    throw error;
  }
}

async function buildAtomicCommit({ github, owner, repo, branch, event }) {
  const ref = await github.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`,
  });
  const parentSha = ref.data.object.sha;

  const parent = await github.rest.git.getCommit({
    owner,
    repo,
    commit_sha: parentSha,
  });

  const wake = await readWake(github, owner, repo, branch);
  const eventPath = `.agent/queue/pending/${event.id}.json`;

  if (await eventExists(github, owner, repo, branch, eventPath)) {
    return { duplicate: true, eventPath, parentSha };
  }

  const nextWake = {
    schema_version: 1,
    pending: true,
    generation: wake.generation + 1,
    last_event: event.id,
    updated_at: event.created_at,
  };

  const eventBlob = await github.rest.git.createBlob({
    owner,
    repo,
    content: JSON.stringify(event, null, 2) + "\n",
    encoding: "utf-8",
  });

  const wakeBlob = await github.rest.git.createBlob({
    owner,
    repo,
    content: JSON.stringify(nextWake, null, 2) + "\n",
    encoding: "utf-8",
  });

  const tree = await github.rest.git.createTree({
    owner,
    repo,
    base_tree: parent.data.tree.sha,
    tree: [
      {
        path: eventPath,
        mode: "100644",
        type: "blob",
        sha: eventBlob.data.sha,
      },
      {
        path: ".agent/wake.json",
        mode: "100644",
        type: "blob",
        sha: wakeBlob.data.sha,
      },
    ],
  });

  const commit = await github.rest.git.createCommit({
    owner,
    repo,
    message: `agent: enqueue ${event.id}`,
    tree: tree.data.sha,
    parents: [parentSha],
  });

  await github.rest.git.updateRef({
    owner,
    repo,
    ref: `heads/${branch}`,
    sha: commit.data.sha,
    force: false,
  });

  return {
    duplicate: false,
    eventPath,
    generation: nextWake.generation,
    commitSha: commit.data.sha,
  };
}

module.exports = async function enqueueAgentEvent({
  github,
  context,
  core,
  branch,
  rawEvent,
}) {
  const { owner, repo } = context.repo;
  const now = new Date().toISOString();

  const event = {
    schema_version: 1,
    id: cleanId(rawEvent.id),
    created_at: rawEvent.created_at || now,
    type: String(rawEvent.type || "task"),
    priority: Number.isInteger(rawEvent.priority) ? rawEvent.priority : 50,
    status: "pending",
    source: rawEvent.source || { kind: context.eventName },
    target: {
      repository:
        rawEvent.target?.repository || `${owner}/${repo}`,
      ref: rawEvent.target?.ref || branch,
    },
    goal: String(rawEvent.goal || "").trim(),
    files: Array.isArray(rawEvent.files) ? rawEvent.files : [],
    constraints: Array.isArray(rawEvent.constraints)
      ? rawEvent.constraints
      : [],
  };

  if (!event.goal) throw new Error("event goal is empty");
  if (event.priority < 0 || event.priority > 100) {
    throw new Error("priority must be between 0 and 100");
  }

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const result = await buildAtomicCommit({
        github,
        owner,
        repo,
        branch,
        event,
      });

      if (result.duplicate) {
        core.notice(`Event ${event.id} already exists; intake is idempotent.`);
      } else {
        core.notice(
          `Queued ${event.id}; wake generation=${result.generation}; commit=${result.commitSha}`
        );
      }
      return result;
    } catch (error) {
      lastError = error;
      if (![409, 422].includes(error.status) || attempt === 3) throw error;
      core.warning(
        `Branch changed during atomic enqueue; retrying (${attempt}/3).`
      );
    }
  }

  throw lastError;
};

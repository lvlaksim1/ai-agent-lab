"use strict";

const { commitAtomicPlan } = require("./lib/atomic-plan.cjs");
const { planEnqueueEvent, serializePlan } = require("./lib/runtime-transition.cjs");

function cleanId(value) {
  const id = String(value || "").trim().replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  if (!id) throw new Error("event id is empty");
  return id.slice(0, 120);
}

function decodeContent(data) {
  if (!data || Array.isArray(data) || data.type !== "file") throw new Error("expected a file response");
  return Buffer.from(data.content, data.encoding || "base64").toString("utf8");
}

async function readJson(github, owner, repo, snapshotRef, filePath) {
  const res = await github.rest.repos.getContent({ owner, repo, path: filePath, ref: snapshotRef });
  return JSON.parse(decodeContent(res.data));
}

async function readWake(github, owner, repo, snapshotRef) {
  const wake = await readJson(github, owner, repo, snapshotRef, ".agent/wake.json");
  if (wake.schema_version !== 1 || typeof wake.pending !== "boolean" || !Number.isInteger(wake.generation) || wake.generation < 0) {
    throw new Error("invalid .agent/wake.json");
  }
  return wake;
}

async function readAssignment(github, owner, repo, snapshotRef) {
  const assignment = await readJson(github, owner, repo, snapshotRef, ".agent/assignment.json");
  if (assignment.schema_version !== 1 || typeof assignment.active_object !== "string" || typeof assignment.transfer_state !== "string") {
    throw new Error("invalid .agent/assignment.json");
  }
  return assignment;
}

async function readObjectIndex(github, owner, repo, snapshotRef) {
  const index = await readJson(github, owner, repo, snapshotRef, ".agent/objects/index.json");
  if (index.schema_version !== 1 || !Array.isArray(index.objects)) throw new Error("invalid .agent/objects/index.json");
  return index;
}

function resolveObjectId({ rawObjectId, targetRepository, index, assignment, controlRepository }) {
  if (rawObjectId) {
    const requested = cleanId(rawObjectId);
    if (!index.objects.some((item) => item.id === requested)) throw new Error("unknown object_id: " + requested);
    return requested;
  }
  const matches = index.objects.filter((item) => item.repository === targetRepository);
  if (matches.length === 1) return matches[0].id;
  if (matches.length > 1) throw new Error("target repository maps to multiple objects: " + targetRepository);
  if (targetRepository === controlRepository) return assignment.active_object;
  throw new Error("target repository is not registered as an object: " + targetRepository);
}

async function eventExists(github, owner, repo, snapshotRef, eventPath) {
  try {
    await github.rest.repos.getContent({ owner, repo, path: eventPath, ref: snapshotRef });
    return true;
  } catch (error) {
    if (error.status === 404) return false;
    throw error;
  }
}

function makeStore(github, owner, repo, branch) {
  return {
    async getHead() {
      const ref = await github.rest.git.getRef({ owner, repo, ref: "heads/" + branch });
      return ref.data.object.sha;
    },
    async getTreeSha(commitSha) {
      const commit = await github.rest.git.getCommit({ owner, repo, commit_sha: commitSha });
      return commit.data.tree.sha;
    },
    async createBlob(content) {
      const blob = await github.rest.git.createBlob({ owner, repo, content, encoding: "utf-8" });
      return blob.data.sha;
    },
    async createTree(baseTreeSha, entries) {
      const tree = await github.rest.git.createTree({ owner, repo, base_tree: baseTreeSha, tree: entries });
      return tree.data.sha;
    },
    async createCommit(message, treeSha, parentSha) {
      const commit = await github.rest.git.createCommit({ owner, repo, message, tree: treeSha, parents: [parentSha] });
      return commit.data.sha;
    },
    async updateHead(commitSha, force) {
      await github.rest.git.updateRef({ owner, repo, ref: "heads/" + branch, sha: commitSha, force });
    }
  };
}

function normalizeEvent({ rawEvent, objectId, targetRepository, branch, defaultCreatedAt, contextEventName }) {
  const event = {
    schema_version: 1,
    id: cleanId(rawEvent.id),
    object_id: objectId,
    created_at: rawEvent.created_at || defaultCreatedAt,
    type: String(rawEvent.type || "task"),
    priority: Number.isInteger(rawEvent.priority) ? rawEvent.priority : 50,
    status: "pending",
    source: rawEvent.source || { kind: contextEventName },
    target: {
      repository: targetRepository,
      ref: (rawEvent.target && rawEvent.target.ref) || branch
    },
    goal: String(rawEvent.goal || "").trim(),
    files: Array.isArray(rawEvent.files) ? rawEvent.files : [],
    constraints: Array.isArray(rawEvent.constraints) ? rawEvent.constraints : []
  };
  if (!event.goal) throw new Error("event goal is empty");
  if (event.priority < 0 || event.priority > 100) throw new Error("priority must be between 0 and 100");
  return event;
}

async function buildAtomicCommit({ github, owner, repo, branch, rawEvent, defaultCreatedAt, contextEventName }) {
  const branchRef = await github.rest.git.getRef({ owner, repo, ref: "heads/" + branch });
  const parentSha = branchRef.data.object.sha;

  const assignment = await readAssignment(github, owner, repo, parentSha);
  const index = await readObjectIndex(github, owner, repo, parentSha);
  const wake = await readWake(github, owner, repo, parentSha);
  const targetRepository = (rawEvent.target && rawEvent.target.repository) || owner + "/" + repo;
  const objectId = resolveObjectId({
    rawObjectId: rawEvent.object_id,
    targetRepository,
    index,
    assignment,
    controlRepository: owner + "/" + repo
  });
  const event = normalizeEvent({
    rawEvent,
    objectId,
    targetRepository,
    branch,
    defaultCreatedAt,
    contextEventName
  });
  const eventPath = ".agent/queue/pending/" + event.id + ".json";
  const exists = await eventExists(github, owner, repo, parentSha, eventPath);
  const transition = planEnqueueEvent({ event, wake, assignment, eventExists: exists });

  if (transition.duplicate) return { duplicate: true, eventPath, parentSha, event };

  const commitSha = await commitAtomicPlan({
    store: makeStore(github, owner, repo, branch),
    changes: serializePlan(transition.plan),
    message: "agent: enqueue " + event.id,
    expectedHead: parentSha
  });
  if (!commitSha) {
    const error = new Error("branch changed during atomic enqueue");
    error.status = 409;
    throw error;
  }

  return {
    duplicate: false,
    eventPath,
    generation: transition.generation,
    eligibleNow: transition.eligibleNow,
    commitSha,
    event
  };
}

module.exports = async function enqueueAgentEvent({ github, context, core, branch, rawEvent }) {
  const owner = context.repo.owner;
  const repo = context.repo.repo;
  const defaultCreatedAt = new Date().toISOString();
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const result = await buildAtomicCommit({
        github,
        owner,
        repo,
        branch,
        rawEvent,
        defaultCreatedAt,
        contextEventName: context.eventName
      });
      if (result.duplicate) {
        core.notice("Event " + result.event.id + " already exists; intake is idempotent.");
      } else {
        core.notice("Queued " + result.event.id + " for object " + result.event.object_id +
          "; eligibleNow=" + result.eligibleNow + "; wake generation=" + result.generation +
          "; commit=" + result.commitSha);
      }
      return result;
    } catch (error) {
      lastError = error;
      if (![409, 422].includes(error.status) || attempt === 3) throw error;
      core.warning("Branch changed during atomic enqueue; retrying (" + attempt + "/3).");
    }
  }
  throw lastError;
};

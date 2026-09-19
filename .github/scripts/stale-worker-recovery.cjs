const { commitAtomicPlan } = require("./lib/atomic-plan.cjs");
const { sameExecutionIdentity, planManagerDefectWake, planStaleRecovery, serializePlan } = require("./lib/runtime-transition.cjs");
const apiBase = "https://api.github.com";
const repo = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
const ref = process.env.RUNTIME_REF || "work-webhook-test";

if (!repo || !token) {
  throw new Error("GITHUB_REPOSITORY and GITHUB_TOKEN are required");
}

const headers = {
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "ai-agent-lab-stale-worker-recovery"
};

async function api(path, options = {}) {
  const response = await fetch(apiBase + path, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
      ...(options.body ? { "Content-Type": "application/json" } : {})
    }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error(`GitHub API ${response.status} ${path}: ${text}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

function decodeContent(row) {
  return Buffer.from(row.content.replace(/\n/g, ""), "base64").toString("utf8");
}

async function getFile(path) {
  try {
    const row = await api(`/repos/${repo}/contents/${path}?ref=${encodeURIComponent(ref)}`);
    return { sha: row.sha, content: decodeContent(row) };
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

async function getJson(path) {
  const file = await getFile(path);
  if (!file) return null;
  return { ...file, json: JSON.parse(file.content) };
}

async function getRefSha() {
  const row = await api(`/repos/${repo}/git/ref/heads/${encodeURIComponent(ref)}`);
  return row.object.sha;
}

async function getCommit(sha) {
  return api(`/repos/${repo}/commits/${sha}`);
}

const atomicStore = {
  async getHead() { return getRefSha(); },
  async getTreeSha(commitSha) {
    const parent = await api(`/repos/${repo}/git/commits/${commitSha}`);
    return parent.tree.sha;
  },
  async createBlob(content) {
    const blob = await api(`/repos/${repo}/git/blobs`, { method: "POST", body: JSON.stringify({ content, encoding: "utf-8" }) });
    return blob.sha;
  },
  async createTree(baseTreeSha, entries) {
    const tree = await api(`/repos/${repo}/git/trees`, { method: "POST", body: JSON.stringify({ base_tree: baseTreeSha, tree: entries }) });
    return tree.sha;
  },
  async createCommit(message, treeSha, parentSha) {
    const commit = await api(`/repos/${repo}/git/commits`, { method: "POST", body: JSON.stringify({ message, tree: treeSha, parents: [parentSha] }) });
    return commit.sha;
  },
  async updateHead(commitSha, force) {
    await api(`/repos/${repo}/git/refs/heads/${encodeURIComponent(ref)}`, { method: "PATCH", body: JSON.stringify({ sha: commitSha, force }) });
  }
};

async function atomicCommit(changes, message, expectedHead) {
  return commitAtomicPlan({ store: atomicStore, changes, message, expectedHead });
}

function isoMs(value) {
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : NaN;
}

async function validateHeartbeat(state, config) {
  const hb = state.heartbeat;
  const problems = [];
  if (!hb || typeof hb !== "object") problems.push("heartbeat missing");
  if (hb && hb.active !== true) problems.push("heartbeat inactive while processing");
  if (hb && !["production", "otk"].includes(hb.role)) problems.push("invalid heartbeat role");
  if (hb && hb.worker_id !== state.worker_id) problems.push("heartbeat worker mismatch");
  if (hb && hb.active_event !== state.active_event) problems.push("heartbeat event mismatch");
  if (hb && hb.time_source !== "github_commit_committer_date") problems.push("invalid heartbeat time source");
  if (hb && !/^[0-9a-f]{40}$/.test(hb.time_anchor_commit || "")) problems.push("invalid heartbeat anchor commit");
  if (hb && !Number.isFinite(isoMs(hb.last_seen_at))) problems.push("invalid heartbeat last_seen_at");
  if (hb && !Number.isFinite(isoMs(hb.stale_at))) problems.push("invalid heartbeat stale_at");
  if (hb && Number.isFinite(isoMs(hb.last_seen_at)) && Number.isFinite(isoMs(hb.stale_at))) {
    if (isoMs(hb.stale_at) - isoMs(hb.last_seen_at) !== config.heartbeat_stale_after_seconds * 1000) {
      problems.push("heartbeat stale deadline mismatch");
    }
  }

  if (problems.length === 0) {
    try {
      const anchor = await getCommit(hb.time_anchor_commit);
      const anchorMs = isoMs(anchor.commit.committer.date);
      if (anchorMs !== isoMs(hb.last_seen_at)) {
        problems.push("heartbeat anchor timestamp mismatch");
      }
      if (hb.time_anchor_path) {
        const changedPaths = Array.isArray(anchor.files) ? anchor.files.map((file) => file.filename) : [];
        if (changedPaths.length && !changedPaths.includes(hb.time_anchor_path)) {
          problems.push("heartbeat anchor path mismatch");
        }
      }
    } catch (error) {
      problems.push("heartbeat anchor commit unavailable");
    }
  }

  return problems;
}

async function signalManagerDefect(reason, pulseSha, pulseTime) {
  const head = await getRefSha();
  if (head !== pulseSha) {
    console.log("State advanced before defect signal; leaving recovery to newer state.");
    return;
  }
  const wakeFile = await getJson(".agent/management/wake.json");
  if (!wakeFile) throw new Error("Missing .agent/management/wake.json");
  const transition = planManagerDefectWake({ wake: wakeFile.json, reason, pulseTime });
  const commit = await atomicCommit(
    serializePlan(transition),
    "manager: flag stale-recovery control-plane defect",
    pulseSha
  );
  if (!commit) console.log("Defect signal raced with newer state; no overwrite performed.");
}

async function main() {
  const configFile = await getJson(".agent/config.json");
  const stateFile = await getJson(".agent/state.json");
  if (!configFile || !stateFile) throw new Error("Runtime config/state missing");
  const config = configFile.json;
  const initialState = stateFile.json;

  if (initialState.status === "idle") {
    console.log("IDLE: no stale-worker recovery needed.");
    return;
  }
  if (initialState.status !== "processing") {
    throw new Error(`Unknown runtime state: ${initialState.status}`);
  }

  const initialHead = await getRefSha();
  const pulseFile = await getJson(config.runtime_time_anchor_file || ".agent/time-pulse.json");
  if (!pulseFile) throw new Error("Runtime time-pulse file missing");

  const pulse = {
    ...pulseFile.json,
    schema_version: 1,
    sequence: Number.isInteger(pulseFile.json.sequence) ? pulseFile.json.sequence + 1 : 1,
    purpose: "stale_recovery_probe",
    role: initialState.heartbeat?.role || null,
    worker_id: initialState.worker_id,
    object_id: initialState.heartbeat?.object_id || null,
    active_event: initialState.active_event,
    fence_generation: initialState.fence_generation,
    activity_kind: "recovery_probe",
    activity_detail: "Checking exact GitHub-anchored heartbeat freshness before the next production clock."
  };

  const pulseSha = await atomicCommit(
    { [config.runtime_time_anchor_file]: JSON.stringify(pulse, null, 2) + "\n" },
    "agent: stale-worker recovery guard pulse",
    initialHead
  );

  if (!pulseSha) {
    console.log("RACE: state advanced before recovery pulse; no action.");
    return;
  }

  const pulseCommit = await getCommit(pulseSha);
  const pulseTime = pulseCommit.commit.committer.date;
  const pulseMs = isoMs(pulseTime);
  if (!Number.isFinite(pulseMs)) throw new Error("Recovery pulse commit has invalid timestamp");

  const currentStateFile = await getJson(".agent/state.json");
  if (!currentStateFile) throw new Error("Runtime state disappeared after recovery pulse");
  const currentState = currentStateFile.json;

  if (!sameExecutionIdentity(initialState, currentState)) {
    console.log("RACE: worker/state changed during recovery probe; no preemption.");
    return;
  }

  const heartbeatProblems = await validateHeartbeat(currentState, config);
  if (heartbeatProblems.length) {
    const reason = heartbeatProblems.join("; ");
    console.log("UNKNOWN/DEFECT:", reason);
    await signalManagerDefect(reason, pulseSha, pulseTime);
    return;
  }

  const hb = currentState.heartbeat;
  if (pulseMs <= isoMs(hb.stale_at)) {
    console.log(`LIVE: ${currentState.worker_id} heartbeat valid through ${hb.stale_at}; no recovery.`);
    return;
  }

  const stateBeforeCloseFile = await getJson(".agent/state.json");
  if (!stateBeforeCloseFile || !sameExecutionIdentity(currentState, stateBeforeCloseFile.json)) {
    console.log("RACE: heartbeat refreshed before stale closure; no preemption.");
    return;
  }

  const branchHead = await getRefSha();
  if (branchHead !== pulseSha) {
    console.log("RACE: branch advanced after recovery pulse; no preemption.");
    return;
  }

  const role = hb.role;
  const eventId = currentState.active_event;
  let shiftNumber = currentState.shift_number;
  if (role === "production" && !Number.isInteger(shiftNumber)) {
    const brigadeFile = await getJson(".agent/brigade.json");
    if (!brigadeFile || !Number.isInteger(brigadeFile.json.shift_counter)) {
      console.log("DEFECT: cannot resolve production shift number for stale recovery.");
      await signalManagerDefect("cannot resolve production shift number for stale recovery", pulseSha, pulseTime);
      return;
    }
    shiftNumber = brigadeFile.json.shift_counter + 1;
  }
  let startReportPath = currentState.shift_start_report_path ?? null;
  let startReportCommit = currentState.shift_start_report_commit ?? null;
  if (role === "production" && currentState.reporting_policy_version === 2 && Number.isInteger(shiftNumber)) {
    const expectedStartReportPath = `.agent/reports/starts/shift-${shiftNumber}-${currentState.worker_id}-${eventId}.md`;
    if (!startReportPath) {
      const recoveredStartReport = await getFile(expectedStartReportPath);
      if (recoveredStartReport) startReportPath = expectedStartReportPath;
    }
    if (startReportPath && !startReportCommit) {
      const rows = await api(
        `/repos/${repo}/commits?sha=${encodeURIComponent(ref)}&path=${encodeURIComponent(startReportPath)}&per_page=1`
      );
      if (Array.isArray(rows) && rows.length && /^[0-9a-f]{40}$/.test(rows[0].sha || "")) {
        startReportCommit = rows[0].sha;
      }
    }
  }

  const wakeFile = await getJson(".agent/wake.json");
  if (!wakeFile) throw new Error("Missing .agent/wake.json");

  let productionEventJson = null;
  let expectedReviewPath = null;
  if (role === "production") {
    const productionEvent = await getJson(`.agent/queue/pending/${eventId}.json`);
    if (!productionEvent) {
      console.log("DEFECT: active production event is not pending; refusing stale preemption.");
      await signalManagerDefect("active production event missing from pending queue", pulseSha, pulseTime);
      return;
    }
    productionEventJson = productionEvent.json;
    expectedReviewPath = `.agent/queue/pending/review-shift-${shiftNumber}-${eventId}.json`;
    const existingReview = await getFile(expectedReviewPath);
    if (existingReview) {
      console.log("DEFECT: runtime-loss review already exists while production still processing.");
      await signalManagerDefect("runtime-loss review already exists for active production event", pulseSha, pulseTime);
      return;
    }
  }

  const transition = planStaleRecovery({
    currentState,
    wake: wakeFile.json,
    pulseTime,
    pulseSha,
    shiftNumber,
    startReportPath,
    startReportCommit,
    productionEvent: productionEventJson
  });
  if (role === "production" && transition.meta.review_path !== expectedReviewPath) {
    throw new Error("deterministic recovery review path mismatch");
  }
  const changes = serializePlan(transition);

  const closeCommit = await atomicCommit(
    changes,
    role === "otk"
      ? `agent: recover stale OTK execution ${eventId}`
      : `agent: recover stale production execution ${eventId}`,
    pulseSha
  );

  if (!closeCommit) {
    console.log("RACE: worker/state advanced before stale closure commit; no preemption.");
    return;
  }

  console.log(
    `RECOVERED: role=${role} event=${eventId} last_seen=${hb.last_seen_at} stale_at=${hb.stale_at} recovery=${pulseTime} fence=${transition.meta.next_fence}`
  );
}

main().catch((error) => {
  console.error(error.stack || String(error));
  process.exitCode = 1;
});

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

async function atomicCommit(changes, message, expectedHead) {
  const currentHead = await getRefSha();
  if (currentHead !== expectedHead) return null;

  const parent = await api(`/repos/${repo}/git/commits/${expectedHead}`);
  const treeEntries = [];
  for (const [path, content] of Object.entries(changes)) {
    const blob = await api(`/repos/${repo}/git/blobs`, {
      method: "POST",
      body: JSON.stringify({ content, encoding: "utf-8" })
    });
    treeEntries.push({ path, mode: "100644", type: "blob", sha: blob.sha });
  }

  const tree = await api(`/repos/${repo}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: parent.tree.sha, tree: treeEntries })
  });

  const commit = await api(`/repos/${repo}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message,
      tree: tree.sha,
      parents: [expectedHead]
    })
  });

  try {
    await api(`/repos/${repo}/git/refs/heads/${encodeURIComponent(ref)}`, {
      method: "PATCH",
      body: JSON.stringify({ sha: commit.sha, force: false })
    });
  } catch (error) {
    if (error.status === 409 || error.status === 422) return null;
    throw error;
  }

  return commit.sha;
}

function isoMs(value) {
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : NaN;
}

function sameIdentity(a, b) {
  return a &&
    b &&
    a.status === "processing" &&
    b.status === "processing" &&
    a.active_event === b.active_event &&
    a.worker_id === b.worker_id &&
    a.fence_generation === b.fence_generation &&
    a.heartbeat &&
    b.heartbeat &&
    a.heartbeat.sequence === b.heartbeat.sequence &&
    a.heartbeat.time_anchor_commit === b.heartbeat.time_anchor_commit &&
    a.heartbeat.last_seen_at === b.heartbeat.last_seen_at &&
    a.heartbeat.stale_at === b.heartbeat.stale_at;
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
  const wake = wakeFile.json;
  const marker = `STALE_RECOVERY_CONTROL_PLANE_DEFECT: ${reason}`;
  const reasons = Array.isArray(wake.reasons) ? [...wake.reasons] : [];
  if (!reasons.includes(marker)) reasons.push(marker);
  const next = {
    ...wake,
    attention: true,
    generation: Number.isInteger(wake.generation) ? wake.generation + 1 : 1,
    reasons,
    updated_at: pulseTime
  };
  const commit = await atomicCommit(
    { ".agent/management/wake.json": JSON.stringify(next, null, 2) + "\n" },
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

  if (!sameIdentity(initialState, currentState)) {
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
  if (!stateBeforeCloseFile || !sameIdentity(currentState, stateBeforeCloseFile.json)) {
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
  const nextFence = currentState.fence_generation + 1;
  const changes = {};

  const idleHeartbeat = {
    ...hb,
    active: false,
    role: null,
    worker_id: null,
    object_id: null,
    active_event: null,
    stale_at: null,
    activity_kind: "idle",
    activity_detail: role === "otk"
      ? "Recovered stale OTK execution; pending review will be retried."
      : "Recovered stale production execution; pending independent OTK review.",
    external_wait: null,
    source: "recovered_by_stale_guard"
  };

  const lossEvidence = {
    role,
    event: eventId,
    worker_id: currentState.worker_id,
    worker_last_seen_at_utc: hb.last_seen_at,
    heartbeat_stale_at_utc: hb.stale_at,
    heartbeat_anchor_commit: hb.time_anchor_commit,
    recovery_closed_at_utc: pulseTime,
    recovery_anchor_commit: pulseSha,
    fenced_generation: nextFence,
    activity_kind: hb.activity_kind,
    activity_detail: hb.activity_detail
  };

  const nextState = {
    ...currentState,
    status: "idle",
    active_event: null,
    worker_id: null,
    started_at: null,
    lease_until: null,
    last_event: eventId,
    last_result: role === "otk" ? "OTK_RUNTIME_LOSS_RETRY" : "RUNTIME_LOSS_PENDING_REVIEW",
    last_completed_at: hb.last_seen_at,
    heartbeat: idleHeartbeat,
    started_at_anchor_commit: null,
    lease_anchor_commit: null,
    fence_generation: nextFence,
    last_runtime_loss: lossEvidence
  };

  changes[".agent/state.json"] = JSON.stringify(nextState, null, 2) + "\n";

  const wakeFile = await getJson(".agent/wake.json");
  if (!wakeFile) throw new Error("Missing .agent/wake.json");
  if (wakeFile.json.pending !== true) {
    const nextWake = {
      ...wakeFile.json,
      pending: true,
      generation: Number.isInteger(wakeFile.json.generation) ? wakeFile.json.generation + 1 : 1,
      last_event: eventId,
      updated_at: pulseTime
    };
    changes[".agent/wake.json"] = JSON.stringify(nextWake, null, 2) + "\n";
  }

  if (role === "production") {
    const productionEvent = await getJson(`.agent/queue/pending/${eventId}.json`);
    if (!productionEvent) {
      console.log("DEFECT: active production event is not pending; refusing stale preemption.");
      await signalManagerDefect("active production event missing from pending queue", pulseSha, pulseTime);
      return;
    }

    const reviewPath = `.agent/queue/pending/review-${eventId}.json`;
    const existingReview = await getFile(reviewPath);
    if (existingReview) {
      console.log("DEFECT: runtime-loss review already exists while production still processing.");
      await signalManagerDefect("runtime-loss review already exists for active production event", pulseSha, pulseTime);
      return;
    }

    const review = {
      schema_version: 1,
      id: `review-${eventId}`,
      created_at: pulseTime,
      type: "supervisor-review",
      priority: 100,
      status: "pending",
      object_id: hb.object_id,
      source: {
        kind: "runtime_loss_recovery",
        production_event: eventId
      },
      worker_id: currentState.worker_id,
      shift_policy_version: 4,
      shift_started_at_utc: currentState.started_at,
      shift_completed_at_utc: hb.last_seen_at,
      target: productionEvent.json.target,
      continuation_id: eventId,
      evidence: {
        journal_path: `.agent/journal/${eventId}.md`,
        heartbeat_anchor_commit: hb.time_anchor_commit,
        recovery_anchor_commit: pulseSha
      },
      stop: {
        kind: "runtime_loss",
        actionable_next_step: true,
        reason: "Verified GitHub-anchored heartbeat became stale before the next production clock.",
        runtime_loss_evidence: {
          worker_last_seen_at_utc: hb.last_seen_at,
          heartbeat_stale_at_utc: hb.stale_at,
          heartbeat_anchor_commit: hb.time_anchor_commit,
          recovery_observed_at_utc: pulseTime,
          recovery_anchor_commit: pulseSha,
          fenced_generation: nextFence,
          activity_kind: hb.activity_kind,
          activity_detail: hb.activity_detail
        }
      }
    };
    changes[reviewPath] = JSON.stringify(review, null, 2) + "\n";
  }

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
    `RECOVERED: role=${role} event=${eventId} last_seen=${hb.last_seen_at} stale_at=${hb.stale_at} recovery=${pulseTime} fence=${nextFence}`
  );
}

main().catch((error) => {
  console.error(error.stack || String(error));
  process.exitCode = 1;
});

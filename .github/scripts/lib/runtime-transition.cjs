"use strict";

function makePlan(kind, changes, meta = {}) {
  const ordered = {};
  for (const path of Object.keys(changes).sort()) ordered[path] = changes[path];
  return { version: 1, kind, changes: ordered, meta: { ...meta } };
}

function serializePlan(plan) {
  const out = {};
  for (const [path, value] of Object.entries(plan.changes || {})) {
    out[path] = typeof value === "string" ? value : JSON.stringify(value, null, 2) + "\n";
  }
  return out;
}

function sameExecutionIdentity(a, b) {
  return Boolean(
    a && b &&
    a.status === "processing" &&
    b.status === "processing" &&
    a.active_event === b.active_event &&
    a.worker_id === b.worker_id &&
    a.fence_generation === b.fence_generation &&
    a.heartbeat && b.heartbeat &&
    a.heartbeat.sequence === b.heartbeat.sequence &&
    a.heartbeat.time_anchor_commit === b.heartbeat.time_anchor_commit &&
    a.heartbeat.last_seen_at === b.heartbeat.last_seen_at &&
    a.heartbeat.stale_at === b.heartbeat.stale_at
  );
}

function fenceAllowsWrite(state, expected) {
  return Boolean(
    state &&
    state.status === "processing" &&
    state.active_event === expected.active_event &&
    state.worker_id === expected.worker_id &&
    state.fence_generation === expected.fence_generation
  );
}

function plansConflict(a, b) {
  const left = new Set(Object.keys((a && a.changes) || {}));
  return Object.keys((b && b.changes) || {}).some((path) => left.has(path));
}

function planEnqueueEvent({ event, wake, assignment, eventExists }) {
  const eventPath = ".agent/queue/pending/" + event.id + ".json";
  if (eventExists) {
    return { duplicate: true, eventPath, eligibleNow: false, generation: wake.generation, plan: null };
  }
  const eligibleNow =
    event.object_id === assignment.active_object &&
    (event.type === "supervisor-review" || assignment.transfer_state === "working");
  const nextWake = {
    schema_version: 1,
    pending: wake.pending || eligibleNow,
    generation: wake.generation + 1,
    last_event: eligibleNow ? event.id : wake.last_event,
    updated_at: event.created_at
  };
  const plan = makePlan("enqueue_event", {
    [eventPath]: event,
    ".agent/wake.json": nextWake
  }, {
    event_id: event.id,
    eligible_now: eligibleNow,
    wake_generation: nextWake.generation
  });
  return { duplicate: false, eventPath, eligibleNow, generation: nextWake.generation, plan };
}

function planManagerDefectWake({ wake, reason, pulseTime }) {
  const marker = "STALE_RECOVERY_CONTROL_PLANE_DEFECT: " + reason;
  const reasons = Array.isArray(wake.reasons) ? [...wake.reasons] : [];
  if (!reasons.includes(marker)) reasons.push(marker);
  const nextWake = {
    ...wake,
    attention: true,
    generation: Number.isInteger(wake.generation) ? wake.generation + 1 : 1,
    reasons,
    updated_at: pulseTime
  };
  return makePlan("manager_defect_wake", { ".agent/management/wake.json": nextWake }, { marker });
}

function planStaleRecovery({
  currentState,
  wake,
  pulseTime,
  pulseSha,
  shiftNumber,
  startReportPath,
  startReportCommit,
  productionEvent
}) {
  if (!currentState || currentState.status !== "processing" || !currentState.heartbeat) {
    throw new Error("stale recovery requires processing state with heartbeat");
  }
  const hb = currentState.heartbeat;
  const role = hb.role;
  if (!["production", "otk"].includes(role)) throw new Error("unsupported stale recovery role: " + role);
  const eventId = currentState.active_event;
  if (!eventId) throw new Error("stale recovery requires active event");
  if (role === "production" && !Number.isInteger(shiftNumber)) throw new Error("production stale recovery requires shift number");
  if (role === "production" && !productionEvent) throw new Error("production stale recovery requires pending production event");

  const nextFence = currentState.fence_generation + 1;
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
    activity_detail: hb.activity_detail,
    shift_number: Number.isInteger(shiftNumber) ? shiftNumber : null,
    reporting_policy_version: currentState.reporting_policy_version ?? null,
    score_policy_version: currentState.score_policy_version ?? null,
    start_report_path: startReportPath ?? null,
    start_report_commit: startReportCommit ?? null
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
    shift_number: null,
    reporting_policy_version: null,
    score_policy_version: null,
    shift_start_report_path: null,
    shift_start_report_commit: null,
    fence_generation: nextFence,
    last_runtime_loss: lossEvidence
  };

  const changes = { ".agent/state.json": nextState };
  if (wake.pending !== true) {
    changes[".agent/wake.json"] = {
      ...wake,
      pending: true,
      generation: Number.isInteger(wake.generation) ? wake.generation + 1 : 1,
      last_event: eventId,
      updated_at: pulseTime
    };
  }

  let reviewPath = null;
  if (role === "production") {
    const reviewId = "review-shift-" + shiftNumber + "-" + eventId;
    reviewPath = ".agent/queue/pending/" + reviewId + ".json";
    const review = {
      schema_version: 1,
      id: reviewId,
      created_at: pulseTime,
      type: "supervisor-review",
      priority: 100,
      status: "pending",
      object_id: hb.object_id,
      source: { kind: "runtime_loss_recovery", production_event: eventId },
      worker_id: currentState.worker_id,
      shift_policy_version: 4,
      reporting_policy_version: currentState.reporting_policy_version === 2 ? 2 : 1,
      score_policy_version: currentState.score_policy_version === 2 ? 2 : 1,
      shift_number: shiftNumber,
      shift_started_at_utc: currentState.started_at,
      shift_completed_at_utc: hb.last_seen_at,
      target: productionEvent.target,
      continuation_id: eventId,
      evidence: {
        journal_path: ".agent/journal/" + eventId + ".md",
        heartbeat_anchor_commit: hb.time_anchor_commit,
        recovery_anchor_commit: pulseSha,
        ...(startReportPath ? { start_report_path: startReportPath } : {})
      },
      ...(startReportPath ? { start_report_path: startReportPath } : {}),
      ...(startReportCommit ? { start_report_commit: startReportCommit } : {}),
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
    changes[reviewPath] = review;
  }

  return makePlan("stale_recovery", changes, {
    role,
    event_id: eventId,
    next_fence: nextFence,
    review_path: reviewPath
  });
}

function planImmutableCreate({ path, content, existingContent }) {
  if (existingContent === undefined || existingContent === null) {
    return { duplicate: false, plan: makePlan("immutable_create", { [path]: content }, { path }) };
  }
  if (existingContent === content) return { duplicate: true, plan: null };
  throw new Error("immutable path already exists with different content: " + path);
}

module.exports = {
  makePlan,
  serializePlan,
  sameExecutionIdentity,
  fenceAllowsWrite,
  plansConflict,
  planEnqueueEvent,
  planManagerDefectWake,
  planStaleRecovery,
  planImmutableCreate
};

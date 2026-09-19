"use strict";

function makePlan(kind, changes, meta = {}) {
  const ordered = {};
  for (const path of Object.keys(changes).sort()) ordered[path] = changes[path];
  return { version: 1, kind, changes: ordered, meta: { ...meta } };
}

function serializePlan(plan) {
  const out = {};
  for (const [path, value] of Object.entries(plan.changes || {})) {
    out[path] = value === null ? null : (typeof value === "string" ? value : JSON.stringify(value, null, 2) + "\n");
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
      otk_finalize_policy_version: 1,
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

function planOtkFinalize({
  currentState,
  reviewEvent,
  wake,
  brigade,
  objectState,
  managementState,
  managementWake,
  decision
}) {
  if (!currentState || currentState.status !== "processing" || currentState.worker_id !== "otk") throw new Error("OTK finalize requires active OTK processing state");
  if (!reviewEvent || reviewEvent.type !== "supervisor-review" || currentState.active_event !== reviewEvent.id) throw new Error("OTK finalize review/state identity mismatch");
  if (reviewEvent.otk_finalize_policy_version !== 1) throw new Error("OTK finalize policy v1 is required");
  if (!Number.isInteger(reviewEvent.shift_number) || reviewEvent.shift_number < 1) throw new Error("review shift number is required");
  if (!decision || !Number.isInteger(decision.score) || decision.score < 0 || decision.score > 10) throw new Error("OTK score must be 0..10");
  if (!["APPROVED","CORRECTED","REMEDIATED","COMPLETE","BLOCKED","CHEAT"].includes(decision.verdict)) throw new Error("invalid OTK verdict");
  if (!["none","incremental","substantial","milestone"].includes(decision.progressClass)) throw new Error("invalid progress class");
  if (typeof decision.reviewContent !== "string" || !decision.reviewContent.trim()) throw new Error("reviewContent is required");
  if (typeof decision.otkReportContent !== "string" || !decision.otkReportContent.trim()) throw new Error("otkReportContent is required");
  if (brigade.shift_counter + 1 !== reviewEvent.shift_number) throw new Error("OTK review must advance exactly the next brigade shift");

  const workerIndex = brigade.members.findIndex((member) => member.id === reviewEvent.worker_id);
  if (workerIndex < 0) throw new Error("reviewed worker is not in brigade");
  const rotationIndex = brigade.rotation_order.indexOf(reviewEvent.worker_id);
  if (rotationIndex < 0) throw new Error("reviewed worker is not in rotation");

  const score = decision.score;
  const ratingDelta = decision.verdict === "CHEAT" ? -100 : (score - 5) * 10;
  const worker = brigade.members[workerIndex];
  const shiftsScored = worker.shifts_scored + 1;
  const totalScore = worker.total_score + score;
  const nextWorker = brigade.rotation_order[(rotationIndex + 1) % brigade.rotation_order.length];
  const nextMember = {
    ...worker,
    rating: worker.rating + ratingDelta,
    shifts_scored: shiftsScored,
    total_score: totalScore,
    average_score: Math.round((totalScore / shiftsScored) * 100) / 100,
    best_score: Math.max(worker.best_score, score),
    last_score: score,
    cheat_strikes: worker.cheat_strikes + (decision.verdict === "CHEAT" ? 1 : 0)
  };
  const nextBrigade = {
    ...brigade,
    shift_counter: reviewEvent.shift_number,
    next_member_id: nextWorker,
    members: brigade.members.map((member, index) => index === workerIndex ? nextMember : member)
  };

  const finalizeTime = currentState.heartbeat && currentState.heartbeat.last_seen_at;
  if (typeof finalizeTime !== "string" || !Number.isFinite(Date.parse(finalizeTime))) throw new Error("OTK finalize requires authoritative heartbeat time");
  const sourceEvent = reviewEvent.source && reviewEvent.source.production_event;
  if (typeof sourceEvent !== "string" || !sourceEvent) throw new Error("review source production event is required");

  const nextObjectState = {
    ...objectState,
    ...(decision.objectPatch || {}),
    last_scored_shift: reviewEvent.shift_number,
    last_otk_verdict: decision.verdict,
    last_progress_class: decision.progressClass,
    last_event: sourceEvent,
    ...(decision.blockerSummary ? { current_blocker_summary: decision.blockerSummary } : {}),
    updated_at: finalizeTime
  };

  const nextShiftsSinceManager = managementState.shifts_since_manager_review + 1;
  const nextNoProgress = decision.progressClass === "none" ? managementState.consecutive_no_progress + 1 : 0;
  const nextCorrected = decision.verdict === "CORRECTED" ? managementState.consecutive_corrected + 1 : 0;
  const nextManagementState = {
    ...managementState,
    ...(decision.managementPatch || {}),
    last_scored_shift: reviewEvent.shift_number,
    shifts_since_manager_review: nextShiftsSinceManager,
    last_otk_verdict: decision.verdict,
    last_progress_class: decision.progressClass,
    consecutive_no_progress: nextNoProgress,
    consecutive_corrected: nextCorrected,
    ...(decision.blockerSummary ? { current_blocker_summary: decision.blockerSummary } : {}),
    updated_at: finalizeTime
  };

  const managerReasons = new Set(Array.isArray(decision.managerReasons) ? decision.managerReasons : []);
  if (nextShiftsSinceManager >= 3) managerReasons.add("THREE_SHIFTS_SINCE_MANAGER_REVIEW");
  if (nextNoProgress >= 2) managerReasons.add("TWO_NO_PROGRESS_SHIFTS");
  if (nextCorrected >= 2) managerReasons.add("TWO_CORRECTED_REVIEWS");
  if (["REMEDIATED","BLOCKED","CHEAT"].includes(decision.verdict)) managerReasons.add("OTK_" + decision.verdict);
  if (decision.progressClass === "milestone") managerReasons.add("MILESTONE");
  if (nextManagementState.owner_decision_required === true) managerReasons.add("OWNER_DECISION_REQUIRED");

  const reviewPath = ".agent/reviews/shift-" + reviewEvent.shift_number + "-" + reviewEvent.id + ".md";
  const otkReportPath = ".agent/reports/otk/shift-" + reviewEvent.shift_number + "-" + reviewEvent.id + ".md";
  const donePath = ".agent/queue/done/" + reviewEvent.id + ".json";
  const pendingReviewPath = ".agent/queue/pending/" + reviewEvent.id + ".json";

  let continuationId = reviewEvent.continuation_id || null;
  const changes = {
    [reviewPath]: decision.reviewContent,
    [otkReportPath]: decision.otkReportContent,
    ".agent/reports/latest-otk.md": decision.otkReportContent,
    ".agent/brigade.json": nextBrigade,
    [".agent/objects/" + reviewEvent.object_id + "/state.json"]: nextObjectState,
    ".agent/management/state.json": nextManagementState,
    [pendingReviewPath]: null
  };

  const continuationAction = decision.continuationAction || "preserve";
  if (continuationAction === "upsert") {
    if (!decision.continuationEvent || decision.continuationEvent.object_id !== reviewEvent.object_id) throw new Error("OTK continuation upsert requires same-object event");
    continuationId = decision.continuationEvent.id;
    changes[".agent/queue/pending/" + continuationId + ".json"] = decision.continuationEvent;
  } else if (continuationAction === "delete") {
    if (!continuationId) throw new Error("OTK continuation delete requires continuation_id");
    changes[".agent/queue/pending/" + continuationId + ".json"] = null;
    continuationId = null;
  } else if (continuationAction !== "preserve") {
    throw new Error("invalid continuationAction");
  }

  const eligibleWorkRemains = decision.eligibleWorkRemains === true;
  if (wake.pending !== eligibleWorkRemains) {
    changes[".agent/wake.json"] = {
      ...wake,
      pending: eligibleWorkRemains,
      generation: Number.isInteger(wake.generation) ? wake.generation + 1 : 1,
      last_event: eligibleWorkRemains ? (continuationId || wake.last_event) : reviewEvent.id,
      updated_at: finalizeTime
    };
  }

  if (managerReasons.size > 0) {
    const mergedReasons = Array.from(new Set([...(Array.isArray(managementWake.reasons) ? managementWake.reasons : []), ...managerReasons]));
    changes[".agent/management/wake.json"] = {
      ...managementWake,
      attention: true,
      generation: Number.isInteger(managementWake.generation) ? managementWake.generation + 1 : 1,
      reasons: mergedReasons,
      updated_at: finalizeTime
    };
  }

  const done = {
    schema_version: 1,
    id: reviewEvent.id,
    type: "supervisor-review",
    status: "done",
    object_id: reviewEvent.object_id,
    shift_number: reviewEvent.shift_number,
    source_event: sourceEvent,
    worker_id: reviewEvent.worker_id,
    verdict: decision.verdict,
    score,
    rating_delta: ratingDelta,
    progress_class: decision.progressClass,
    review_path: reviewPath,
    otk_report_path: otkReportPath,
    ...(reviewEvent.start_report_path ? { start_report_path: reviewEvent.start_report_path } : {}),
    ...(continuationId ? { continuation_id: continuationId } : {}),
    otk_finalize_policy_version: 1,
    ...(decision.doneExtra || {})
  };
  changes[donePath] = done;

  const idleHeartbeat = {
    ...currentState.heartbeat,
    active: false,
    role: null,
    worker_id: null,
    object_id: null,
    active_event: null,
    stale_at: null,
    activity_kind: "idle",
    activity_detail: decision.stateActivityDetail || ("OTK shift " + reviewEvent.shift_number + " finalized atomically."),
    external_wait: null,
    source: "relay_otk_release"
  };
  changes[".agent/state.json"] = {
    ...currentState,
    status: "idle",
    active_event: null,
    worker_id: null,
    started_at: null,
    lease_until: null,
    last_event: reviewEvent.id,
    last_result: decision.verdict + "_" + score,
    last_completed_at: reviewEvent.shift_completed_at_utc || currentState.last_completed_at,
    heartbeat: idleHeartbeat,
    started_at_anchor_commit: null,
    lease_anchor_commit: null,
    reporting_policy_version: null,
    score_policy_version: null,
    shift_number: null,
    shift_start_report_path: null,
    shift_start_report_commit: null
  };

  return makePlan("otk_finalize", changes, {
    review_id: reviewEvent.id,
    shift_number: reviewEvent.shift_number,
    rating_delta: ratingDelta,
    next_member_id: nextWorker,
    otk_report_path: otkReportPath,
    done_path: donePath,
    continuation_id: continuationId
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
  planOtkFinalize,
  planImmutableCreate
};

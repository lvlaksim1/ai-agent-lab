import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
}

function fail(message) {
  console.error("ERROR: " + message);
  process.exitCode = 1;
}

function check(condition, message) {
  if (!condition) fail(message);
}

function git(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function verifyCommitTimeAnchor(commitSha, expectedTimestamp, expectedPath, label) {
  check(typeof commitSha === "string" && /^[0-9a-f]{40}$/.test(commitSha), label + " commit SHA must be 40 lowercase hex");
  if (!(typeof commitSha === "string" && /^[0-9a-f]{40}$/.test(commitSha))) return;
  let commitTime;
  try {
    commitTime = git(["show", "-s", "--format=%cI", commitSha]);
  } catch {
    fail(label + " commit must exist in repository history");
    return;
  }
  const actualMs = Date.parse(commitTime);
  const expectedMs = Date.parse(expectedTimestamp);
  check(Number.isFinite(actualMs) && Number.isFinite(expectedMs) && actualMs === expectedMs, label + " timestamp must exactly equal GitHub commit committer time");
  if (expectedPath) {
    let changed = [];
    try {
      changed = git(["diff-tree", "--root", "--no-commit-id", "--name-only", "-r", commitSha]).split("\n").filter(Boolean);
    } catch {
      fail(label + " changed-path verification failed");
      return;
    }
    check(changed.includes(expectedPath), label + " anchor commit must modify " + expectedPath);
  }
}

const wake = readJson(".agent/wake.json");
const state = readJson(".agent/state.json");
const config = readJson(".agent/config.json");
const assignment = readJson(".agent/assignment.json");
const objectIndex = readJson(".agent/objects/index.json");
const transferRequest = readJson(".agent/transfer/request.json");
const managerWake = readJson(".agent/management/wake.json");
const managerState = readJson(".agent/management/state.json");
const brigade = readJson(".agent/brigade.json");

check(wake.schema_version === 1, "wake schema_version must be 1");
check(typeof wake.pending === "boolean", "wake.pending must be boolean");
check(Number.isInteger(wake.generation) && wake.generation >= 0, "wake.generation must be non-negative");

check(state.schema_version === 1, "state schema_version must be 1");
check(["idle", "processing"].includes(state.status), "state.status must be idle or processing");
check(Number.isInteger(state.fence_generation) && state.fence_generation >= 1, "state.fence_generation must be a positive integer");
check(state.heartbeat && typeof state.heartbeat === "object", "state.heartbeat is required");
if (state.heartbeat && typeof state.heartbeat === "object") {
  check(state.heartbeat.schema_version === 2, "heartbeat schema_version must be 2");
  check(typeof state.heartbeat.active === "boolean", "heartbeat.active must be boolean");
  check(Number.isInteger(state.heartbeat.sequence) && state.heartbeat.sequence >= 0, "heartbeat.sequence must be non-negative integer");
  check(typeof state.heartbeat.last_seen_at === "string" && Number.isFinite(Date.parse(state.heartbeat.last_seen_at)), "heartbeat.last_seen_at must be valid timestamp");
}
if (state.status === "idle") {
  check(state.active_event === null, "idle state must not have active_event");
  check(state.worker_id === null, "idle state must not have worker_id");
  check(state.started_at === null, "idle state must not have started_at");
  check(state.lease_until === null, "idle state must not have lease_until");
  if (state.heartbeat && typeof state.heartbeat === "object") {
    check(state.heartbeat.active === false, "idle state heartbeat must be inactive");
    check(state.heartbeat.role === null, "idle heartbeat.role must be null");
    check(state.heartbeat.worker_id === null, "idle heartbeat.worker_id must be null");
    check(state.heartbeat.object_id === null, "idle heartbeat.object_id must be null");
    check(state.heartbeat.active_event === null, "idle heartbeat.active_event must be null");
    check(state.heartbeat.stale_at === null, "idle heartbeat.stale_at must be null");
    check(state.heartbeat.external_wait === null, "idle heartbeat.external_wait must be null");
  }
} else {
  check(typeof state.active_event === "string" && state.active_event.length > 0, "processing state requires active_event");
  check(typeof state.worker_id === "string" && state.worker_id.length > 0, "processing state requires worker_id");
  check(typeof state.started_at === "string", "processing state requires started_at");
  check(typeof state.lease_until === "string", "processing state requires lease_until");
  check(state.time_authority === "github_commit_committer_date", "processing state time_authority must be github_commit_committer_date");
  verifyCommitTimeAnchor(state.started_at_anchor_commit, state.started_at, ".agent/state.json", "shift start");
  check(typeof state.lease_anchor_commit === "string" && /^[0-9a-f]{40}$/.test(state.lease_anchor_commit), "processing state lease_anchor_commit is required");
  if (typeof state.lease_anchor_commit === "string" && /^[0-9a-f]{40}$/.test(state.lease_anchor_commit)) {
    let leaseAnchorTime;
    try {
      leaseAnchorTime = git(["show", "-s", "--format=%cI", state.lease_anchor_commit]);
      const leaseMs = Date.parse(state.lease_until);
      const anchorMs = Date.parse(leaseAnchorTime);
      check(Number.isFinite(leaseMs) && Number.isFinite(anchorMs) && leaseMs - anchorMs === config.lease_minutes * 60 * 1000, "lease_until must equal lease anchor commit time + lease_minutes");
      const changed = git(["diff-tree", "--root", "--no-commit-id", "--name-only", "-r", state.lease_anchor_commit]).split("\n").filter(Boolean);
      check(changed.includes(".agent/state.json") || changed.includes(config.runtime_time_anchor_file), "lease anchor commit must be a runtime ownership/time-anchor commit");
    } catch {
      fail("lease anchor commit must exist in repository history");
    }
  }
  if (state.heartbeat && typeof state.heartbeat === "object") {
    check(state.heartbeat.active === true, "processing heartbeat must be active");
    check(["production", "otk"].includes(state.heartbeat.role), "processing heartbeat.role must be production or otk");
    check(state.heartbeat.worker_id === state.worker_id, "heartbeat.worker_id must match state.worker_id");
    check(state.heartbeat.active_event === state.active_event, "heartbeat.active_event must match state.active_event");
    check(typeof state.heartbeat.object_id === "string" && state.heartbeat.object_id.length > 0, "processing heartbeat.object_id is required");
    check(typeof state.heartbeat.stale_at === "string" && Number.isFinite(Date.parse(state.heartbeat.stale_at)), "processing heartbeat.stale_at must be valid timestamp");
    check(["working", "external_wait", "persisting", "closing", "otk_review"].includes(state.heartbeat.activity_kind), "invalid heartbeat.activity_kind");
    check(typeof state.heartbeat.activity_detail === "string" && state.heartbeat.activity_detail.trim().length > 0, "heartbeat.activity_detail is required");
    check(state.heartbeat.time_source === "github_commit_committer_date", "heartbeat time_source must be github_commit_committer_date");
    check(typeof state.heartbeat.time_anchor_path === "string" && state.heartbeat.time_anchor_path.length > 0, "heartbeat.time_anchor_path is required");
    verifyCommitTimeAnchor(state.heartbeat.time_anchor_commit, state.heartbeat.last_seen_at, state.heartbeat.time_anchor_path, "heartbeat");
    const hbSeenMs = Date.parse(state.heartbeat.last_seen_at);
    const hbStaleMs = Date.parse(state.heartbeat.stale_at);
    check(Number.isFinite(hbSeenMs) && Number.isFinite(hbStaleMs) && hbStaleMs - hbSeenMs === config.heartbeat_stale_after_seconds * 1000, "heartbeat.stale_at must equal last_seen_at + configured threshold");
    check(state.heartbeat.external_wait === null || (state.heartbeat.external_wait && typeof state.heartbeat.external_wait === "object"), "heartbeat.external_wait must be object or null");
    if (state.heartbeat.activity_kind === "external_wait") {
      check(state.heartbeat.external_wait && state.heartbeat.external_wait.active === true, "external_wait activity requires active external_wait");
    }
    if (state.heartbeat.external_wait && typeof state.heartbeat.external_wait === "object") {
      check(state.heartbeat.external_wait.active === true, "external_wait.active must be true when object exists");
      check(typeof state.heartbeat.external_wait.kind === "string" && state.heartbeat.external_wait.kind.length > 0, "external_wait.kind is required");
      check(typeof state.heartbeat.external_wait.worker_observed_status === "string" && state.heartbeat.external_wait.worker_observed_status.length > 0, "external_wait.worker_observed_status is required");
      check(typeof state.heartbeat.external_wait.since_at === "string" && Number.isFinite(Date.parse(state.heartbeat.external_wait.since_at)), "external_wait.since_at must be timestamp");
      check(typeof state.heartbeat.external_wait.last_polled_at === "string" && Number.isFinite(Date.parse(state.heartbeat.external_wait.last_polled_at)), "external_wait.last_polled_at must be timestamp");
      check(typeof state.heartbeat.external_wait.since_anchor_commit === "string" && /^[0-9a-f]{40}$/.test(state.heartbeat.external_wait.since_anchor_commit), "external_wait.since_anchor_commit is required");
      check(typeof state.heartbeat.external_wait.last_polled_anchor_commit === "string" && /^[0-9a-f]{40}$/.test(state.heartbeat.external_wait.last_polled_anchor_commit), "external_wait.last_polled_anchor_commit is required");
      verifyCommitTimeAnchor(state.heartbeat.external_wait.since_anchor_commit, state.heartbeat.external_wait.since_at, config.runtime_time_anchor_file, "external_wait since");
      verifyCommitTimeAnchor(state.heartbeat.external_wait.last_polled_anchor_commit, state.heartbeat.external_wait.last_polled_at, config.runtime_time_anchor_file, "external_wait last poll");
    }
  }
}

check(config.schema_version === 1, "config schema_version must be 1");
check(config.scheduler_policy === "immutable", "scheduler_policy must remain immutable");
check(config.work_allowed === false, "Work must remain disabled");
check(config.scheduler_mutation_allowed === false, "scheduler mutation must remain disabled");
check(config.max_events_per_run === 2, "relay runtime allows at most two queue events per run");
check(config.max_production_shifts_per_run === 1, "relay runtime allows exactly one production shift maximum per run");
check(config.max_parallel_workers === 1, "parallel production workers must remain disabled");
check(config.run_policy === "review-then-production", "run_policy must remain review-then-production");
check(config.shift_duration_policy === "natural-boundary", "shift duration policy must remain natural-boundary");
check(config.clock_is_shift_limit === false, "scheduled clock must not be a shift-duration limit");
check(Number.isInteger(config.lease_renew_before_minutes) && config.lease_renew_before_minutes > 0 && config.lease_renew_before_minutes < config.lease_minutes, "lease renewal threshold must be inside lease horizon");
check(config.clock_architecture === "generic-dispatcher", "clock architecture must remain generic-dispatcher");
check(Array.isArray(config.dispatcher_clock_minutes) && config.dispatcher_clock_minutes.join(",") === "0,12,24,36,48", "dispatcher clocks must remain at :00/:12/:24/:36/:48");
check(config.physical_clock_count === 5, "physical clock count must remain 5");
check(config.nominal_max_dispatch_latency_minutes === 12, "nominal dispatcher latency must remain 12 minutes");
check(config.manager_priority_when_idle === true, "manager must retain idle-station priority");
check(config.manager_concurrent_with_worker === true, "manager+worker concurrency must remain enabled");
check(config.external_evidence_wait_policy === "active-until-terminal-or-objective-forced-stop", "external evidence must remain active-wait until terminal or objective forced stop");
check(config.wait_for_continuation_policy === "emergency-recovery-only", "wait_for continuation must remain recovery-only");
check(config.verification_closes_work_package === true, "mandatory verification must close the work package before handoff");
check(config.premature_pending_ci_efficiency_score === 0, "premature pending-CI handoff efficiency score must remain zero");
check(config.shift_policy_version === 4, "shift policy version must remain 4");
check(config.work_package_policy === "causal-chain-until-natural-boundary", "work package must follow the causal chain");
check(config.actionable_next_step_required === true, "actionable-next-step closure must remain required");
check(config.continuation_policy === "natural-boundary-or-objective-forced-stop-only", "continuation policy must remain objective-forced-stop-only");
check(config.forced_stop_requires_objective_evidence === true, "forced_stop must require objective evidence");
check(config.forced_stop_prediction_is_invalid === true, "predictive forced_stop must remain invalid");
check(config.forced_stop_while_tools_operational_is_invalid === true, "forced_stop while tools remain operational must remain invalid");
check(config.abrupt_runtime_termination_recovery === "checkpoint-plus-stale-lease", "abrupt runtime termination must recover through checkpoint plus stale lease");
check(config.blocked_requires_exhaustion_evidence === true, "BLOCKED must require exhaustion evidence");
check(config.evidence_acquisition_ladder_required === true, "evidence acquisition ladder must remain required");
check(Number.isInteger(config.short_shift_review_threshold_seconds) && config.short_shift_review_threshold_seconds >= 60, "short shift review threshold must be a sane positive integer");
check(config.short_shift_with_unresolved_work_requires_special_review === true, "short unresolved shifts must require special review");
check(config.premature_handoff_efficiency_score === 0, "premature handoff efficiency score must remain zero");
check(config.heartbeat_policy_version === 2, "heartbeat policy version must remain 2");
check(config.heartbeat_required_while_processing === true, "processing heartbeat must remain mandatory");
check(Number.isInteger(config.heartbeat_interval_seconds) && config.heartbeat_interval_seconds >= 30, "heartbeat interval must be at least 30 seconds");
check(Number.isInteger(config.heartbeat_stale_after_seconds) && config.heartbeat_stale_after_seconds >= config.heartbeat_interval_seconds * 2, "heartbeat stale threshold must provide at least 2x heartbeat interval");
check(config.heartbeat_activity_required === true, "heartbeat activity visibility must remain required");
check(config.heartbeat_external_wait_visibility_required === true, "external wait visibility must remain required");
check(config.lease_is_liveness_signal === false, "lease must never be treated as liveness signal");
check(config.heartbeat_stale_does_not_bypass_valid_lease === false, "verified stale heartbeat must be recoverable before lease expiry");
check(config.runtime_time_authority === "github_commit_committer_date", "runtime time authority must remain GitHub commit committer date");
check(config.runtime_time_anchor_file === ".agent/time-pulse.json", "runtime time anchor file must remain .agent/time-pulse.json");
check(config.local_runtime_timestamps_allowed === false, "local/model runtime timestamps must remain forbidden");
check(config.heartbeat_time_anchor_required === true, "heartbeat time anchor must remain required");
check(config.heartbeat_action_order_policy === "action-then-pulse-then-state", "heartbeat action ordering must remain action-then-pulse-then-state");
check(config.lease_time_anchor_required === true, "lease time anchor must remain required");
check(fs.existsSync(path.join(root, config.runtime_time_anchor_file)), "runtime time anchor file must exist");
check(config.stale_worker_recovery_enabled === true, "stale-worker recovery must remain enabled");
check(config.stale_worker_recovery_policy_version === 1, "stale-worker recovery policy must remain v1");
check(config.recovery_guard_minutes_before_clock === 2, "recovery guard must run two minutes before production clock");
check(Array.isArray(config.recovery_guard_clock_minutes) && config.recovery_guard_clock_minutes.join(",") === "10,22,34,46,58", "recovery guard clocks must remain at :10/:22/:34/:46/:58");
check(config.recovery_guard_only_when_heartbeat_stale === true, "recovery guard may act only on stale heartbeat");
check(config.runtime_loss_stop_kind === "runtime_loss", "runtime-loss stop kind must remain runtime_loss");
check(config.runtime_loss_is_forced_stop === false, "runtime loss must remain distinct from forced_stop");
check(config.runtime_loss_auto_efficiency_penalty === false, "runtime loss must not carry automatic efficiency penalty");
check(config.fence_generation_required === true, "execution fence generation must remain required");
check(config.zombie_write_fencing_required === true, "zombie write fencing must remain required");
check(config.normal_live_worker_crosses_clock_boundary === true, "healthy workers must be allowed to cross clock boundaries");
check(config.queue_scope_policy === "active-object", "queue must remain active-object scoped");
check(fs.existsSync(path.join(root, ".agent/emergency-recovery.md")), "emergency recovery contract must exist");

check(assignment.schema_version === 1, "assignment schema_version must be 1");
check(typeof assignment.active_object === "string" && assignment.active_object.length > 0, "assignment.active_object is required");
check(["working", "requested", "draining", "switching"].includes(assignment.transfer_state), "invalid assignment.transfer_state");
check(Number.isInteger(assignment.generation) && assignment.generation >= 0, "assignment.generation must be non-negative");

check(objectIndex.schema_version === 1, "object index schema_version must be 1");
check(Array.isArray(objectIndex.objects) && objectIndex.objects.length >= 1, "object registry must contain objects");

const ids = new Set();
const repos = new Set();
for (const object of objectIndex.objects) {
  check(typeof object.id === "string" && object.id.length > 0, "object id is required");
  check(!ids.has(object.id), "duplicate object id: " + object.id);
  ids.add(object.id);
  check(typeof object.repository === "string" && object.repository.includes("/"), "object repository is invalid: " + object.id);
  check(!repos.has(object.repository), "duplicate object repository mapping: " + object.repository);
  repos.add(object.repository);
  check(["NEW", "ACTIVE", "PAUSED", "ARCHIVED"].includes(object.status), "invalid object status: " + object.id);
  for (const key of ["object_path", "mission_path", "state_path", "handoff_path"]) {
    check(typeof object[key] === "string" && fs.existsSync(path.join(root, object[key])), object.id + " missing " + key);
  }
  const objectState = readJson(object.state_path);
  check(objectState.schema_version === 1, object.id + " state schema_version must be 1");
  check(objectState.object_id === object.id, object.id + " state object_id mismatch");
  check(["NEW", "ACTIVE", "PAUSED", "ARCHIVED"].includes(objectState.status), object.id + " state status invalid");
}

check(ids.has(assignment.active_object), "active object is not registered");
const activeRows = objectIndex.objects.filter((object) => object.status === "ACTIVE");
check(activeRows.length === 1, "exactly one registry object must be ACTIVE");
check(activeRows[0].id === assignment.active_object, "registry ACTIVE object must match assignment.active_object");

const activeObject = objectIndex.objects.find((object) => object.id === assignment.active_object);
const activeState = readJson(activeObject.state_path);
check(activeState.status === "ACTIVE", "active object state must be ACTIVE");

check(transferRequest.schema_version === 1, "transfer request schema_version must be 1");
check(typeof transferRequest.active === "boolean", "transfer request active must be boolean");
if (transferRequest.active) {
  check(["NORMAL", "EMERGENCY"].includes(transferRequest.mode), "active transfer request mode invalid");
  check(typeof transferRequest.target_object_id === "string" && transferRequest.target_object_id.length > 0, "active transfer request requires target_object_id");
  check(transferRequest.target_object_id !== assignment.active_object, "transfer target must differ from active object");
}

check(managerWake.schema_version === 1, "manager wake schema_version must be 1");
check(typeof managerWake.attention === "boolean", "manager wake attention must be boolean");
check(Number.isInteger(managerWake.generation) && managerWake.generation >= 0, "manager wake generation must be non-negative");
check(Array.isArray(managerWake.reasons), "manager wake reasons must be array");

check(managerState.schema_version === 1, "manager state schema_version must be 1");
check(["GREEN", "YELLOW", "ORANGE", "RED", "BLOCKED"].includes(managerState.health), "manager health invalid");
if (assignment.transfer_state !== "switching") {
  check(managerState.active_object === assignment.active_object, "manager active_object must match assignment outside switching");
}
for (const field of ["shifts_since_manager_review", "consecutive_no_progress", "consecutive_corrected", "last_scored_shift", "manager_review_count"]) {
  check(Number.isInteger(managerState[field]) && managerState[field] >= 0, "manager state " + field + " must be non-negative integer");
}
check(typeof managerState.owner_decision_required === "boolean", "owner_decision_required must be boolean");
check(typeof managerState.stop_production === "boolean", "stop_production must be boolean");

const managerReportPath = path.join(root, ".agent/management/reports/latest.md");
check(fs.existsSync(managerReportPath), "latest manager report must exist");
if (fs.existsSync(managerReportPath) && managerState.owner_decision_required === true) {
  const managerReport = fs.readFileSync(managerReportPath, "utf8");
  for (const marker of [
    "## Что требуется от владельца",
    "## Зачем это нужно",
    "## Варианты ответа"
  ]) {
    check(managerReport.includes(marker), "owner-decision manager report missing marker: " + marker);
  }
}

check(brigade.schema_version === 1, "brigade schema_version must be 1");
check(Array.isArray(brigade.rotation_order) && brigade.rotation_order.length === 8, "brigade must contain eight workers");
check(Array.isArray(brigade.members) && brigade.members.length === 8, "brigade members must contain eight workers");
check(new Set(brigade.rotation_order).size === 8, "brigade rotation ids must be unique");
check(brigade.members.every((m) => brigade.rotation_order.includes(m.id)), "every brigade member must be in rotation");
check(brigade.rotation_order.includes(brigade.next_member_id), "next_member_id must be in rotation");

const pendingDir = path.join(root, ".agent/queue/pending");
let eligibleCount = 0;
if (fs.existsSync(pendingDir)) {
  const eventFiles = fs.readdirSync(pendingDir).filter((name) => name.endsWith(".json"));

  for (const file of eventFiles) {
    const event = readJson(path.join(".agent/queue/pending", file));
    check(event.schema_version === 1, file + ": schema_version must be 1");
    check(event.status === "pending", file + ": status must be pending");
    check(typeof event.id === "string" && event.id.length > 0, file + ": id is required");
    check(Number.isInteger(event.priority) && event.priority >= 0 && event.priority <= 100, file + ": priority must be 0..100");
    if (event.type === "supervisor-review") {
      check(event.source && typeof event.source.production_event === "string" && event.source.production_event.length > 0, file + ": supervisor-review requires source.production_event");
      if (event.shift_policy_version !== undefined) {
        check([2, 3, 4].includes(event.shift_policy_version), file + ": shift_policy_version must be legacy 2/3 or current 4");
        const stop = event.stop;
        check(stop && typeof stop === "object", file + ": shift policy requires stop record");
        if (stop && typeof stop === "object") {
          check(["project_or_phase_complete", "blocked", "forced_stop", "speculation_boundary", "runtime_loss"].includes(stop.kind), file + ": invalid stop.kind");
          if (stop.kind === "runtime_loss") {
            check(event.shift_policy_version === 4, file + ": runtime_loss requires shift policy v4");
            check(stop.actionable_next_step === true || stop.actionable_next_step === false, file + ": runtime_loss actionable_next_step must be boolean");
            check(stop.runtime_loss_evidence && typeof stop.runtime_loss_evidence === "object", file + ": runtime_loss requires runtime_loss_evidence");
            if (stop.runtime_loss_evidence && typeof stop.runtime_loss_evidence === "object") {
              const loss = stop.runtime_loss_evidence;
              check(typeof loss.worker_last_seen_at_utc === "string" && Number.isFinite(Date.parse(loss.worker_last_seen_at_utc)), file + ": runtime_loss worker_last_seen_at_utc is required");
              check(typeof loss.heartbeat_stale_at_utc === "string" && Number.isFinite(Date.parse(loss.heartbeat_stale_at_utc)), file + ": runtime_loss heartbeat_stale_at_utc is required");
              check(typeof loss.heartbeat_anchor_commit === "string" && /^[0-9a-f]{40}$/.test(loss.heartbeat_anchor_commit), file + ": runtime_loss heartbeat_anchor_commit is required");
              check(typeof loss.recovery_observed_at_utc === "string" && Number.isFinite(Date.parse(loss.recovery_observed_at_utc)), file + ": runtime_loss recovery_observed_at_utc is required");
              check(typeof loss.recovery_anchor_commit === "string" && /^[0-9a-f]{40}$/.test(loss.recovery_anchor_commit), file + ": runtime_loss recovery_anchor_commit is required");
              check(Number.isInteger(loss.fenced_generation) && loss.fenced_generation >= 1, file + ": runtime_loss fenced_generation is required");
              check(Date.parse(loss.recovery_observed_at_utc) > Date.parse(loss.heartbeat_stale_at_utc), file + ": runtime_loss recovery must occur after heartbeat stale_at");
              verifyCommitTimeAnchor(loss.heartbeat_anchor_commit, loss.worker_last_seen_at_utc, null, file + " runtime_loss heartbeat");
              verifyCommitTimeAnchor(loss.recovery_anchor_commit, loss.recovery_observed_at_utc, config.runtime_time_anchor_file, file + " runtime_loss recovery");
            }
          } else {
            check(stop.actionable_next_step === false, file + ": normal shift may close only with actionable_next_step=false");
          }
          check(typeof stop.reason === "string" && stop.reason.trim().length > 0, file + ": stop.reason is required");
          if (["blocked", "speculation_boundary"].includes(stop.kind)) {
            check(Array.isArray(stop.exhaustion_evidence) && stop.exhaustion_evidence.length > 0, file + ": blocker/speculation stop requires exhaustion_evidence");
          }
          if (stop.kind === "blocked") {
            check(typeof stop.external_action === "string" && stop.external_action.trim().length > 0, file + ": blocked stop requires external_action");
          }
          if ([3, 4].includes(event.shift_policy_version) && stop.kind === "forced_stop") {
            check(Array.isArray(stop.forced_stop_evidence) && stop.forced_stop_evidence.length > 0, file + ": policy v3 forced_stop requires objective forced_stop_evidence");
            if (Array.isArray(stop.forced_stop_evidence)) {
              for (const [index, item] of stop.forced_stop_evidence.entries()) {
                check(item && typeof item === "object", file + ": forced_stop_evidence[" + index + "] must be an object");
                if (item && typeof item === "object") {
                  check(["platform_signal", "tool_timeout", "tool_termination", "tool_unavailable"].includes(item.kind), file + ": invalid forced_stop_evidence kind");
                  check(typeof item.observed_at_utc === "string" && Number.isFinite(Date.parse(item.observed_at_utc)), file + ": forced_stop_evidence requires valid observed_at_utc");
                  check(typeof item.detail === "string" && item.detail.trim().length > 0, file + ": forced_stop_evidence requires detail");
                }
              }
            }
          }
          if (typeof event.shift_started_at_utc === "string" && typeof event.shift_completed_at_utc === "string") {
            const start = Date.parse(event.shift_started_at_utc);
            const end = Date.parse(event.shift_completed_at_utc);
            if (Number.isFinite(start) && Number.isFinite(end) && end >= start) {
              const durationSeconds = Math.floor((end - start) / 1000);
              if (durationSeconds < config.short_shift_review_threshold_seconds && event.continuation_id) {
                check(typeof stop.short_shift_justification === "string" && stop.short_shift_justification.trim().length > 0, file + ": short unresolved shift requires stop.short_shift_justification");
              }
            }
          }
        }
      }
    } else {
      check(typeof event.goal === "string" && event.goal.trim().length > 0, file + ": goal is required");
    }
    check(typeof event.object_id === "string" && ids.has(event.object_id), file + ": registered object_id is required");

    const eligible =
      event.object_id === assignment.active_object &&
      (event.type === "supervisor-review" || assignment.transfer_state === "working");
    if (eligible) eligibleCount += 1;
  }
}

if (eligibleCount > 0 && !wake.pending) {
  fail("eligible active-object queue work exists while wake.pending=false");
}

const doneDir = path.join(root, ".agent/queue/done");
if (fs.existsSync(doneDir)) {
  const doneFiles = fs.readdirSync(doneDir).filter((name) => name.endsWith(".json"));
  for (const file of doneFiles) {
    const done = readJson(path.join(".agent/queue/done", file));
    if (done.schema_version === undefined) continue;
    check(done.schema_version === 1, file + ": schema_version must be 1");
    if ("status" in done) {
      check(["done", "blocked"].includes(done.status), file + ": status must be done or blocked");
    } else {
      check(done.type === "supervisor-review" && typeof done.verdict === "string" && typeof done.completed_at === "string", file + ": legacy done record without status must be a completed supervisor-review");
    }
    check(typeof done.id === "string" && done.id.length > 0, file + ": id is required");
    if ("summary" in done) {
      check(typeof done.summary === "string" && done.summary.trim().length > 0, file + ": summary must be non-empty when present");
    }
  }
}

const telegramWorkflowPath = path.join(root, ".github/workflows/agent-telegram-report.yml");
check(fs.existsSync(telegramWorkflowPath), "Telegram report workflow must exist");
if (fs.existsSync(telegramWorkflowPath)) {
  const telegramWorkflow = fs.readFileSync(telegramWorkflowPath, "utf8");
  check(telegramWorkflow.includes("ref: ${{ github.sha }}"), "Telegram workflow must checkout the triggering commit SHA");
  check(telegramWorkflow.includes(".agent/reports/redelivery/*.request"), "Telegram workflow must support explicit immutable redelivery requests");
  check(telegramWorkflow.includes("git diff-tree --root"), "Telegram workflow must resolve newly added reports from the triggering commit");
}

const reportPath = path.join(root, ".agent/reports/latest.md");
check(fs.existsSync(reportPath), "latest human report must exist");
if (fs.existsSync(reportPath)) {
  const humanReport = fs.readFileSync(reportPath, "utf8");
  for (const marker of [
    "Проект:",
    "Работник:",
    "Смена:",
    "Начало смены:",
    "Конец смены:",
    "Доклад:",
    "ОЦЕНКА ПРЕДЫДУЩЕГО:",
    "МОЙ ПЛАН:",
    "ЧТО ПОЛУЧИЛОСЬ:",
    "СЛЕДУЮЩЕМУ:",
    "Оценка ОТК:",
    "Рейтинг:"
  ]) {
    check(humanReport.includes(marker), "latest human report missing marker: " + marker);
  }
  check(/Начало смены: \d{2}\.\d{2}\.\d{4} \d{2}:\d{2}:\d{2} МСК/.test(humanReport), "latest human report start time must be Moscow timestamp");
  check(/Конец смены: \d{2}\.\d{2}\.\d{4} \d{2}:\d{2}:\d{2} МСК/.test(humanReport), "latest human report end time must be Moscow timestamp");
}

if (!process.exitCode) {
  console.log("Agent runtime invariants: OK");
}

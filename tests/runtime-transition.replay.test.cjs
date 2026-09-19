"use strict";

const assert = require("node:assert/strict");
const {
  sameExecutionIdentity,
  fenceAllowsWrite,
  plansConflict,
  planEnqueueEvent,
  planManagerDefectWake,
  planStaleRecovery,
  planImmutableCreate,
  serializePlan
} = require("../.github/scripts/lib/runtime-transition.cjs");

const sha = (c) => c.repeat(40);
const processing = {
  schema_version: 1,
  status: "processing",
  active_event: "event-1",
  worker_id: "petrovich",
  started_at: "2026-09-19T10:00:00Z",
  lease_until: "2026-09-19T10:45:00Z",
  last_event: null,
  last_result: null,
  last_completed_at: null,
  time_authority: "github_commit_committer_date",
  started_at_anchor_commit: sha("a"),
  lease_anchor_commit: sha("a"),
  fence_generation: 7,
  reporting_policy_version: 2,
  score_policy_version: 2,
  shift_number: 42,
  shift_start_report_path: ".agent/reports/starts/shift-42-petrovich-event-1.md",
  shift_start_report_commit: sha("b"),
  last_runtime_loss: null,
  heartbeat: {
    schema_version: 2,
    active: true,
    role: "production",
    worker_id: "petrovich",
    object_id: "ios",
    active_event: "event-1",
    sequence: 9,
    time_source: "github_commit_committer_date",
    time_anchor_commit: sha("c"),
    time_anchor_path: ".agent/time-pulse.json",
    last_seen_at: "2026-09-19T10:05:00Z",
    stale_at: "2026-09-19T10:08:00Z",
    activity_kind: "working",
    activity_detail: "Editing bounded target file.",
    external_wait: null,
    source: "production_heartbeat"
  }
};
const wake = { schema_version: 1, pending: false, generation: 10, last_event: null, updated_at: "2026-09-19T09:00:00Z" };

assert.equal(sameExecutionIdentity(processing, structuredClone(processing)), true);
const refreshed = structuredClone(processing);
refreshed.heartbeat.sequence += 1;
assert.equal(sameExecutionIdentity(processing, refreshed), false, "heartbeat refresh must defeat stale recovery identity");
assert.equal(fenceAllowsWrite(processing, { active_event: "event-1", worker_id: "petrovich", fence_generation: 7 }), true);
assert.equal(fenceAllowsWrite({ ...processing, fence_generation: 8 }, { active_event: "event-1", worker_id: "petrovich", fence_generation: 7 }), false, "zombie generation must be fenced");

const event = { schema_version:1,id:"incoming",object_id:"ios",created_at:"2026-09-19T10:09:00Z",type:"task",priority:50,status:"pending",source:{kind:"test"},target:{repository:"x/y",ref:"main"},goal:"test",files:[],constraints:[] };
const assignment = { active_object:"ios", transfer_state:"working" };
const enqueue = planEnqueueEvent({ event, wake, assignment, eventExists:false });
assert.equal(enqueue.duplicate, false);
assert.equal(enqueue.eligibleNow, true);
assert.equal(enqueue.generation, 11);
assert.equal(enqueue.plan.changes[".agent/wake.json"].pending, true);
assert.equal(planEnqueueEvent({event,wake,assignment,eventExists:true}).duplicate, true, "duplicate intake must be idempotent");

const recovery = planStaleRecovery({
  currentState: processing,
  wake,
  pulseTime: "2026-09-19T10:10:00Z",
  pulseSha: sha("d"),
  shiftNumber: 42,
  startReportPath: processing.shift_start_report_path,
  startReportCommit: processing.shift_start_report_commit,
  productionEvent: event
});
assert.equal(recovery.plan, undefined);
assert.equal(recovery.meta.next_fence, 8);
assert.equal(recovery.changes[".agent/state.json"].status, "idle");
assert.equal(recovery.changes[".agent/state.json"].last_result, "RUNTIME_LOSS_PENDING_REVIEW");
assert.equal(recovery.changes[".agent/wake.json"].pending, true);
assert.ok(recovery.changes[".agent/queue/pending/review-shift-42-event-1.json"]);
assert.equal(recovery.changes[".agent/queue/pending/review-shift-42-event-1.json"].stop.kind, "runtime_loss");

const managerPlan = planManagerDefectWake({ wake:{schema_version:1,attention:false,generation:3,reasons:[],updated_at:null}, reason:"x", pulseTime:"2026-09-19T10:10:00Z" });
assert.equal(plansConflict(recovery, managerPlan), false, "manager wake and production recovery are path-disjoint");

const otkState = structuredClone(processing);
otkState.worker_id = "otk";
otkState.active_event = "review-shift-41-event-1";
otkState.shift_number = null;
otkState.reporting_policy_version = null;
otkState.score_policy_version = null;
otkState.shift_start_report_path = null;
otkState.shift_start_report_commit = null;
otkState.heartbeat.role = "otk";
otkState.heartbeat.worker_id = "otk";
otkState.heartbeat.active_event = otkState.active_event;
const otkRecovery = planStaleRecovery({ currentState:otkState, wake:{...wake,pending:true}, pulseTime:"2026-09-19T10:10:00Z", pulseSha:sha("e"), shiftNumber:null, startReportPath:null, startReportCommit:null, productionEvent:null });
assert.equal(Object.keys(otkRecovery.changes).some((p)=>p.includes("/review-shift-")), false, "OTK recovery must not create a second review");

const immutable = planImmutableCreate({ path:".agent/reports/starts/x.md", content:"abc\n", existingContent:null });
assert.equal(immutable.duplicate, false);
assert.equal(serializePlan(immutable.plan)[".agent/reports/starts/x.md"], "abc\n");
assert.equal(planImmutableCreate({path:".agent/reports/starts/x.md",content:"abc\n",existingContent:"abc\n"}).duplicate, true);
assert.throws(()=>planImmutableCreate({path:".agent/reports/starts/x.md",content:"new\n",existingContent:"old\n"}), /immutable path/);

console.log("Runtime transition replay tests: OK");

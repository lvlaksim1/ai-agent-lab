import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readJson(rel) {
  const full = path.join(root, rel);
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exitCode = 1;
}

function check(condition, message) {
  if (!condition) fail(message);
}

const wake = readJson(".agent/wake.json");
const state = readJson(".agent/state.json");
const config = readJson(".agent/config.json");
const managerWake = readJson(".agent/management/wake.json");
const managerState = readJson(".agent/management/state.json");

check(wake.schema_version === 1, "wake schema_version must be 1");
check(typeof wake.pending === "boolean", "wake.pending must be boolean");
check(Number.isInteger(wake.generation) && wake.generation >= 0, "wake.generation must be a non-negative integer");

check(state.schema_version === 1, "state schema_version must be 1");
check(["idle", "processing"].includes(state.status), "state.status must be idle or processing");

if (state.status === "idle") {
  check(state.active_event === null, "idle state must not have active_event");
  check(state.worker_id === null, "idle state must not have worker_id");
  check(state.started_at === null, "idle state must not have started_at");
  check(state.lease_until === null, "idle state must not have lease_until");
}

if (state.status === "processing") {
  check(typeof state.active_event === "string" && state.active_event.length > 0, "processing state requires active_event");
  check(typeof state.worker_id === "string" && state.worker_id.length > 0, "processing state requires worker_id");
  check(typeof state.started_at === "string", "processing state requires started_at");
  check(typeof state.lease_until === "string", "processing state requires lease_until");
}

check(config.schema_version === 1, "config schema_version must be 1");
check(config.scheduler_policy === "immutable", "scheduler_policy must remain immutable");
check(config.work_allowed === false, "Work must remain disabled");
check(config.scheduler_mutation_allowed === false, "scheduler mutation must remain disabled");
check(config.max_events_per_run === 1, "runtime must process exactly one event per run");

check(managerWake.schema_version === 1, "manager wake schema_version must be 1");
check(typeof managerWake.attention === "boolean", "manager wake attention must be boolean");
check(Number.isInteger(managerWake.generation) && managerWake.generation >= 0, "manager wake generation must be non-negative");
check(Array.isArray(managerWake.reasons), "manager wake reasons must be an array");

check(managerState.schema_version === 1, "manager state schema_version must be 1");
check(["GREEN","YELLOW","ORANGE","RED","BLOCKED"].includes(managerState.health), "manager health is invalid");
for (const field of ["shifts_since_manager_review","consecutive_no_progress","consecutive_corrected","last_scored_shift","manager_review_count"]) {
  check(Number.isInteger(managerState[field]) && managerState[field] >= 0, `manager state ${field} must be a non-negative integer`);
}
check(typeof managerState.owner_decision_required === "boolean", "owner_decision_required must be boolean");
check(typeof managerState.stop_production === "boolean", "stop_production must be boolean");
check(managerState.active_directive === null || typeof managerState.active_directive === "string", "active_directive must be null or string");

const pendingDir = path.join(root, ".agent/queue/pending");
if (fs.existsSync(pendingDir)) {
  const eventFiles = fs.readdirSync(pendingDir).filter((name) => name.endsWith(".json"));

  for (const file of eventFiles) {
    const event = readJson(path.join(".agent/queue/pending", file));
    check(event.schema_version === 1, `${file}: schema_version must be 1`);
    check(event.status === "pending", `${file}: status must be pending`);
    check(typeof event.id === "string" && event.id.length > 0, `${file}: id is required`);
    check(Number.isInteger(event.priority) && event.priority >= 0 && event.priority <= 100, `${file}: priority must be 0..100`);
    check(typeof event.goal === "string" && event.goal.trim().length > 0, `${file}: goal is required`);
  }

  if (eventFiles.length > 0 && !wake.pending) {
    fail("pending queue contains events while wake.pending=false");
  }
}

const doneDir = path.join(root, ".agent/queue/done");
if (fs.existsSync(doneDir)) {
  const doneFiles = fs.readdirSync(doneDir).filter((name) => name.endsWith(".json"));

  for (const file of doneFiles) {
    const done = readJson(path.join(".agent/queue/done", file));
    if (done.schema_version === undefined) continue;
    check(done.schema_version === 1, `${file}: schema_version must be 1`);
    check(["done", "blocked"].includes(done.status), `${file}: status must be done or blocked`);
    check(typeof done.id === "string" && done.id.length > 0, `${file}: id is required`);
    if ("summary" in done) {
      check(typeof done.summary === "string" && done.summary.trim().length > 0, `${file}: summary must be non-empty when present`);
    }
  }
}

if (!process.exitCode) {
  console.log("Agent runtime invariants: OK");
}

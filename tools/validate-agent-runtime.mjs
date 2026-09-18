import fs from "node:fs";
import path from "node:path";

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
if (state.status === "idle") {
  check(state.active_event === null, "idle state must not have active_event");
  check(state.worker_id === null, "idle state must not have worker_id");
  check(state.started_at === null, "idle state must not have started_at");
  check(state.lease_until === null, "idle state must not have lease_until");
} else {
  check(typeof state.active_event === "string" && state.active_event.length > 0, "processing state requires active_event");
  check(typeof state.worker_id === "string" && state.worker_id.length > 0, "processing state requires worker_id");
  check(typeof state.started_at === "string", "processing state requires started_at");
  check(typeof state.lease_until === "string", "processing state requires lease_until");
}

check(config.schema_version === 1, "config schema_version must be 1");
check(config.scheduler_policy === "immutable", "scheduler_policy must remain immutable");
check(config.work_allowed === false, "Work must remain disabled");
check(config.scheduler_mutation_allowed === false, "scheduler mutation must remain disabled");
check(config.max_events_per_run === 2, "relay runtime allows at most two queue events per run");
check(config.max_production_shifts_per_run === 1, "relay runtime allows exactly one production shift maximum per run");
check(config.max_parallel_workers === 1, "parallel production workers must remain disabled");
check(config.run_policy === "review-then-production", "run_policy must remain review-then-production");
check(Array.isArray(config.production_clock_minutes) && config.production_clock_minutes.join(",") === "2,17,32,47", "production clocks must remain evenly spaced at :02/:17/:32/:47");
check(config.manager_clock_minute === 59, "manager clock must remain at :59");
check(config.queue_scope_policy === "active-object", "queue must remain active-object scoped");

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
    check(typeof event.goal === "string" && event.goal.trim().length > 0, file + ": goal is required");
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

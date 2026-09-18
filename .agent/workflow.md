# Worker Workflow — Relay Cycle

This workflow is used only after `.agent/wake.json` says production/OTK work is pending.

## 0. Scheduler and concurrency rules

Never mutate Scheduled Tasks from runtime. Never use Work. Dynamic orchestration is GitHub state only.

Hard concurrency invariant:
- at most ONE production worker at a time;
- OTK and production share the same global lease `.agent/state.json`;
- the dedicated manager may run concurrently because it uses separate management state;
- one scheduled production run may contain at most ONE production shift.

Read `.agent/production-topology.md` for the topology.

## 1. Resolve eligible work

1. Read `.agent/config.json`, `.agent/state.json`, `.agent/assignment.json`, `.agent/objects/index.json` and list JSON files in `.agent/queue/pending/`.
2. Ignore `.gitkeep` and non-JSON files.
3. Resolve each event's object:
   - use `event.object_id` when present;
   - legacy fallback only when target.repository matches exactly one registered object.
4. Eligible events:
   - supervisor-review whose object is assignment.active_object;
   - ordinary production event whose object is assignment.active_object AND assignment.transfer_state=working.
5. If there is no eligible event, reconcile wake using `.agent/protocol.md` and stop.
6. If `.agent/state.json` has an unexpired processing lease, stop immediately. Never start a second worker.
7. For a normal production event carrying a `wait_for` condition, treat it as a **recovery/inherited wait**, not as the normal way a live worker handles CI:
   - inspect only the referenced external evidence/status before claiming the lease or materializing a brigade member;
   - if it is still non-terminal, leave the event pending, keep wake pending, make no brigade/rating change, and stop quietly;
   - if it is terminal, continue normally and let the worker consume the final evidence;
   - a live worker MUST NOT create a routine `wait_for` handoff merely because CI/build/test is still running.
8. Event selection for the FIRST phase:
   - supervisor-review has precedence;
   - otherwise higher numeric priority;
   - then older created_at;
   - then lexical id.

## 2. Relay cycle

A scheduled production run may process at most two events, but only in one legal pattern:

`supervisor-review -> one production event`

OR:

`one production event`

No other two-event combination is allowed.

### 2A. If the first event is normal production

0. Apply the `wait_for` preflight from section 1 when present. Do not claim a worker while a mandatory external run is still in progress.
1. Read `.agent/management/state.json`.
2. If `stop_production=true`, leave the event queued and stop with `PRODUCTION_STOPPED_BY_MANAGER`.
3. If an active directive applies to this object and NEXT_SHIFT, read and follow it.
4. Claim the global lease with SHA/CAS. Capture the returned GitHub commit SHA, fetch that commit, and record its GitHub server timestamp as `shift_started_at_utc`. Never invent start time from the scheduler minute.
5. Read active object mission/state/handoff as needed.
6. Read `.agent/brigade.json` and `.agent/competition.md`.
7. Materialize exactly `next_member_id`. Proposed shift number is `shift_counter + 1`.
8. Before the substantive change, write down two things for the internal report: (a) a fair evidence-based assessment of the immediately preceding worker, and (b) the current worker's concrete plan/success criterion. Do not rewrite the plan with hindsight.
9. Execute one production shift continuously until a **natural stop condition** is reached. The scheduled clock interval is NOT a shift-duration limit.
   - keep working through successive justified steps while the same worker still has actionable evidence;
   - after starting CI/build/test, enter **active evidence wait**: keep ownership of the shift, poll/inspect the exact run until it becomes terminal while the current Chat and tools remain available, then consume that result and continue the same reasoning/action loop;
   - pending CI/build/test is work-in-progress, not a handoff boundary, even when it takes many minutes;
   - do not hand work to the next shift merely because one commit/push/test was produced or because an external run has started;
   - if the lease is approaching expiry while useful work or active evidence wait is still progressing, renew the lease with SHA/CAS before continuing; the lease is a stale-worker safety lock, not a work-time budget;
   - persist intermediate journal/checkpoint state before long external waits so recovery is safe if the platform terminates the Chat.
10. Never weaken tests, proof gates, Definition of Done or anti-cheat controls.
11. Any continuation MUST inherit the same object_id.
12. End the production shift only at a natural stop condition, then write the technical journal and internal first-person shift report using the four sections from `.agent/reporting.md`. The journal/handoff commit is the preferred authoritative end marker: capture its returned commit SHA, fetch the GitHub server timestamp and record it as `shift_completed_at_utc`.

Natural stop conditions are limited to:
- the event goal / current bounded work package is actually complete **and every mandatory verification started by this shift has reached a terminal state and has been consumed by the worker**;
- a genuine blocker requires owner/manager/external action that the worker cannot perform;
- the required external evidence cannot be observed or polled from the current live Chat because the platform/tooling is forcing termination or has become unavailable;
- continuing would require speculation without any obtainable evidence;
- the platform/runtime is forcing termination, in which case persist a safe recovery continuation first when possible.

Pending CI/build/test by itself is NEVER a natural stop condition.

A worker MUST NOT stop merely because:
- the next scheduled clock is approaching;
- 15, 30, 45 or 60 minutes have elapsed;
- one patch/commit/push has been made;
- CI has started or is still running;
- a convenient handoff point exists while the worker can still wait for, inspect, or act on evidence.

If a worker is forced to terminate while external evidence is still running, a `wait_for` continuation is an emergency recovery checkpoint. Record the exact external run and the forced-stop reason. Do not use this path as normal shift choreography.
13. ALWAYS enqueue exactly one supervisor-review for this shift with priority 100 and the same object_id. Include `shift_started_at_utc`, `shift_completed_at_utc`, predecessor identity when known, the original plan, evidence references, target/ref and continuation id if any.
14. Persist done/state/wake. The production done record SHOULD also contain `shift_started_at_utc` and `shift_completed_at_utc`.
14. STOP. The run MUST NOT review the shift it just performed.

### 2B. If the first event is supervisor-review

1. Claim the global lease as OTK.
2. Follow `.agent/supervision.md` and `.agent/competition.md`.
3. Independently inspect and score the PREVIOUS production shift.
4. Fully persist verdict, rating, brigade rotation, object/management signals, human report, done record and lease release.
5. The OTK phase is now closed and immutable for this run.

Then a second phase MAY begin:

6. Re-read `.agent/wake.json`, `.agent/state.json`, `.agent/assignment.json`, `.agent/management/state.json` and pending queue.
7. Continue only if:
   - state is idle;
   - transfer_state=working;
   - stop_production=false;
   - a normal production event for the active object exists.
8. Select one normal production event using normal priority/age ordering.
9. Claim the global lease again.
10. Materialize the now-current `next_member_id` (which OTK has already advanced).
11. Execute exactly one production shift using steps 2A.5–2A.14.
12. STOP.

The second phase may not be another supervisor-review.

## 2C. Lease renewal and long shifts

The production lease is renewable.

- `config.lease_minutes` is the stale-lock horizon, not maximum shift duration.
- While the same live worker is still making useful progress, renew `lease_until` with SHA/CAS before the remaining lease window falls below `config.lease_renew_before_minutes`.
- Keep the same `active_event`, `worker_id` and `started_at`; only extend `lease_until` and record a heartbeat timestamp if present.
- Another production clock that sees the renewed unexpired lease exits immediately.
- Manager concurrency remains allowed.

## 3. OTK independence

The Chat that performs relay OTK did NOT perform the reviewed production shift; that shift came from an earlier scheduled run.

The same Chat may become the NEXT worker only after OTK has been fully persisted and the brigade rotation has advanced.

Never:
- review a production shift created in the same scheduled run;
- alter the previous shift score after starting the next production phase;
- merge evidence between the reviewed shift and the new shift.

## 4. Transfer behavior

While NORMAL transfer is draining:
- no new production phase starts;
- OTK may still finish the last shift;
- after OTK, do not enter the second production phase.

## 5. Wake reconciliation

After each phase, use `.agent/protocol.md`.

If the first phase was OTK, do not clear wake before deciding whether the legal second production phase exists.

Paused-object backlog alone must not keep production awake.

## 6. Stop

Absolute limits per scheduled production run:
- supervisor reviews: max 1;
- production shifts: max 1;
- total queue events: max 2;
- simultaneous production workers: max 1.

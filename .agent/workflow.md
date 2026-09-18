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
Read `.agent/evidence-acquisition.md` before production work; it is authoritative for actionable-next-step and BLOCKED closure.
Read `.agent/liveness.md`; its heartbeat contract is mandatory for every processing production/OTK lease.
Read `.agent/emergency-recovery.md`; verified stale workers may be externally fenced by the recovery guard even while an old lease timestamp remains in the future.

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
6. If `.agent/state.json` has an unexpired processing lease, stop immediately. Never start a second worker. A stale-worker lease is bypassed only by the separate recovery guard defined in `.agent/emergency-recovery.md`; a normal production clock never performs that preemption.
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
4. Claim the global lease using the exact-time protocol in `.agent/liveness.md`:
   - first update `.agent/time-pulse.json` with purpose=`lease_claim` and the intended worker/event identity, but no generated current timestamp;
   - capture the returned pulse commit SHA and fetch that exact GitHub commit;
   - use ONLY its `commit.committer.date` as the authoritative start/lease time;
   - CAS state to processing with `started_at`, `started_at_anchor_commit`, `lease_until`, `lease_anchor_commit` and the initial heartbeat all derived from that pulse;
   - record the same exact GitHub time as `shift_started_at_utc`.
   Never invent start/lease time from scheduler minute, model time or local clock.
   - increment `state.fence_generation` for the new execution and remember the claimed generation;
   - for production claims, persist `reporting_policy_version: 2`, `shift_number = brigade.shift_counter + 1`, and initialize `shift_start_report_path=null`, `shift_start_report_commit=null`;
   - before every target-repository write or runtime mutation, re-read state and verify the same active event/worker/fence. A mismatch means this execution was fenced and must stop without writing.
4a. From this point onward every heartbeat refresh MUST follow `.agent/liveness.md`: action/checkpoint first -> time-pulse second -> state heartbeat third. Heartbeat timestamps may only come from the fetched GitHub pulse commit.
5. Read active object mission/state/handoff as needed.
6. Read `.agent/brigade.json` and `.agent/competition.md`.
7. Materialize exactly `next_member_id`. Proposed shift number is `shift_counter + 1`.
8. Immediately publish the immutable worker start report per `.agent/reporting.md`, BEFORE any substantive target-repository work:
   - set `reporting_policy_version: 2` and `shift_number` in runtime state;
   - create exactly one `.agent/reports/starts/shift-<shift-number>-<worker-id>-<production-event>.md`;
   - include only the factual first-person sections `ОЦЕНКА ПРЕДШЕСТВЕННИКА` and `МОЙ ПЛАН`; the plan must include a concrete success criterion;
   - persist `shift_start_report_path` and `shift_start_report_commit` in state;
   - never edit that report later and never rewrite the plan with hindsight;
   - reading inherited evidence is allowed before this report, but no target-repository mutation, CI launch or evidence-changing engineering action may precede it.
   If the execution dies before the report is created, OTK records it as missing; nobody fabricates it afterward.
9. Execute one production shift continuously until a **proven natural stop condition** is reached. The scheduled clock interval is NOT a shift-duration limit and the queued event goal is NOT a micro-task boundary.
   - treat the event as the entry point into the current causal engineering chain;
   - keep working through successive justified steps while the same worker still has an actionable next step;
   - if consuming CI/test evidence exposes the next directly related blocker, continue into that blocker in the SAME shift when the current tools can act on it;
   - merely naming/localizing the next blocker does not close the work package;
   - after starting CI/build/test, enter **active evidence wait**: keep ownership of the shift, write the exact wait target/status into heartbeat, poll/inspect the exact run until terminal while the current Chat and tools remain available, refresh heartbeat after every poll, consume the result, clear/update external_wait, and continue the same reasoning/action loop;
   - before declaring evidence unavailable or BLOCKED, execute the applicable evidence-acquisition ladder in `.agent/evidence-acquisition.md`;
   - pending CI/build/test is work-in-progress, not a handoff boundary, even when it takes many minutes;
   - do not hand work to the next shift merely because one commit/push/test was produced, one requested result was consumed, or a new blocker was discovered;
   - if the lease is approaching expiry while useful work or active evidence wait is still progressing, renew the lease with SHA/CAS before continuing; the lease is a stale-worker safety lock, not a work-time budget;
   - persist intermediate journal/checkpoint state before long external waits so recovery is safe if the platform terminates the Chat;
   - immediately after each such checkpoint, create a new authoritative time-pulse and refresh heartbeat so last_seen_at is never earlier than the action/checkpoint it proves.
10. Never weaken tests, proof gates, Definition of Done or anti-cheat controls.
11. Any continuation MUST inherit the same object_id.
12. End the production shift only at a natural stop condition, then write/update the technical journal/checkpoint evidence. Do NOT write an end-of-shift worker narrative. The immutable start report already records the worker's own assessment and plan; OTK will independently reconstruct the result after closure. The journal/handoff commit is the preferred authoritative end marker: capture its returned commit SHA, fetch the GitHub server timestamp and record it as `shift_completed_at_utc`.

Before ending the shift, execute the **closure gate**:
1. apply the actionable-next-step test from `.agent/evidence-acquisition.md`;
2. if the answer is YES, continue working;
3. if the proposed stop is BLOCKED or speculation-boundary, persist the evidence-acquisition attempts and why no available route can advance the chain;
4. only then choose a natural stop kind and end the shift.

Natural stop conditions are limited to:
- **project_or_phase_complete**: the current causal work package/phase is genuinely closed, all mandatory verification started by the shift is terminal and consumed, and no directly actionable same-object next step remains;
- **blocked**: owner/manager/external action is genuinely required, the applicable evidence-acquisition ladder is exhausted, no actionable next step remains, and the exact external action is identified;
- **forced_stop**: an objective platform/runtime/tool signal has already made continued execution impossible or is explicitly terminating it now; the claim must satisfy the forced-stop standard in `.agent/evidence-acquisition.md` and be independently reviewable;
- **speculation_boundary**: continuing would require speculation AND all obtainable evidence routes that could discriminate the remaining hypotheses have been exhausted.

Pending CI/build/test by itself is NEVER a natural stop condition.

A worker MUST NOT stop merely because:
- the next scheduled clock is approaching;
- 15, 30, 45 or 60 minutes have elapsed;
- one patch/commit/push has been made;
- CI has started or is still running;
- the event's originally worded goal has been consumed but it exposed another directly related actionable blocker;
- one evidence-access route returned unavailable/404/unsupported while alternatives remain;
- a convenient handoff point exists while the worker can still wait for, inspect, diagnose, instrument or act on evidence;
- the worker merely predicts that the scheduled/non-interactive turn may end soon;
- the worker still has functioning GitHub/tool calls and can continue polling or acting.

A worker MUST NOT proactively convert a live shift into `forced_stop` just to guarantee a clean handoff. Before long waits, persist an intermediate checkpoint while keeping the lease and shift active. If the platform kills the turn abruptly, the next relay recovers from that checkpoint after stale-lease detection.

If an objective forced-stop signal is actually observed and persistence remains possible, a `wait_for` continuation is an emergency recovery checkpoint. Record the exact external run AND the objective `forced_stop_evidence`. Do not use this path as normal shift choreography.

13. ALWAYS enqueue exactly one supervisor-review for this shift with priority 100 and the same object_id. Its id/path MUST be shift-unique even when the production event is a continuation reused across several workers:

   `review-shift-<shift-number>-<production-event>`
   `.agent/queue/pending/review-shift-<shift-number>-<production-event>.json`

   Never reuse legacy `review-<production-event>` for a new shift.

   Include `shift_started_at_utc`, `shift_completed_at_utc`, predecessor identity when known, evidence references, target/ref and continuation id if any. New reviews MUST also include:
   - `shift_policy_version: 4`;
   - `reporting_policy_version: 2`;
   - `shift_number`;
   - exact `start_report_path` and `start_report_commit` when the worker successfully published them; if absent because execution died before publication, preserve that fact rather than inventing a report;
   - `stop.kind` = `project_or_phase_complete`, `blocked`, `forced_stop` or `speculation_boundary`;
   - `stop.actionable_next_step: false`;
   - a concrete `stop.reason`;
   - for `blocked` or `speculation_boundary`, non-empty `stop.exhaustion_evidence`;
   - for `blocked`, exact `stop.external_action`;
   - for `forced_stop`, non-empty objective `stop.forced_stop_evidence` with kind, observed_at_utc and detail;
   - when duration is below `config.short_shift_review_threshold_seconds` and unresolved work/continuation remains, `stop.short_shift_justification`.
14. Persist done/state/wake. The production done record SHOULD also contain `shift_started_at_utc` and `shift_completed_at_utc`.
14. STOP. The run MUST NOT review the shift it just performed.

### 2B. If the first event is supervisor-review

1. Claim the global lease as OTK.
1a. Initialize `.agent/state.json -> heartbeat` with role=`otk`, worker_id=`otk`, reviewed event/object, activity_kind=`otk_review`, and refresh it throughout review according to `.agent/liveness.md`.
2. Follow `.agent/supervision.md` and `.agent/competition.md`.
3. Independently inspect and score the PREVIOUS production shift.
4. Fully persist verdict, rating, brigade rotation, object/management signals, independent OTK result report, done record and lease release.
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
- While the same live worker is still making useful progress, renew the lease before the remaining lease window falls below `config.lease_renew_before_minutes`.
- Lease renewal MUST use the exact-time protocol: write purpose=`lease_renewal` to `.agent/time-pulse.json`, fetch the returned GitHub commit, then derive `lease_until = commit.committer.date + config.lease_minutes` and persist `lease_anchor_commit`.
- Keep the same `active_event`, `worker_id` and `started_at`. Never calculate renewal from model/local time. Heartbeat may share the same pulse only when its activity description is accurate.
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

## 2D. Heartbeat discipline

Heartbeat is operational state, not narrative logging.

- Never write current timestamps directly into heartbeat state. First create/fetch the authoritative GitHub time-pulse, then project that exact time into state.
- Update heartbeat state with minimal SHA/CAS writes after the pulse commit has been fetched.
- Keep `activity_detail` concrete enough that the manager can answer "чем занят?" without opening the target repository.
- During external wait, always expose the exact repository/run/job/artifact target and the last status actually observed by this worker.
- Never mark a terminal status merely because the external system probably finished.
- If the Chat disappears abruptly, do not fabricate a final heartbeat later; the last real heartbeat must age into STALE naturally.
- On every normal lease release to idle, convert heartbeat to the idle shape from `.agent/liveness.md`.

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

## Runtime-loss note

A production worker does not self-declare `runtime_loss`. Only the separate stale-worker recovery guard may create it after exact heartbeat verification. When that happens the old execution has been fenced; if it later resumes, it must stop on the mandatory fence check before any write.

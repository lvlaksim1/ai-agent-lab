# Supervisor Review Policy

## Purpose

OTK independently reviews one production shift, protects engineering evidence and assigns the official brigade score.

Read .agent/competition.md, .agent/brigade.json, .agent/assignment.json and the reviewed object's capsule before scoring.

## Object integrity

The review event MUST belong to the same object as the reviewed production event.

If object_id is missing only because the reviewed event is legacy, infer it solely from an unambiguous target-repository match and persist that object identity in the review/done records.

Never transfer evidence, continuation or score context from one object to another.

## Required evidence

Inspect as applicable:
1. original goal/constraints;
2. immutable worker start report (reporting policy v2) or legacy shift report;
3. technical journal/checkpoints and heartbeat/time anchors;
4. target diff/commits;
5. CI results/logs/artifacts;
6. continuation;
7. object mission / Definition of Done;
8. applicable management directive.

## Shift-closure audit

OTK must reconstruct the worker's situation at the exact shift end, not merely check whether the event's original sentence was satisfied.

For shift policy v4, require and inspect `shift_policy_version: 4` and the `stop` record from the pending supervisor-review event. Legacy v2/v3 reviews already queued remain reviewable. v4 adds externally verified `runtime_loss` for stale-heartbeat recovery; it is distinct from worker-declared `forced_stop`.

Mandatory questions:
- Did consuming the requested evidence expose another directly related actionable same-object step?
- Could the worker have inspected, diagnosed, instrumented, repaired or verified that next step with the live tools?
- If BLOCKED/speculation-boundary was claimed, was the applicable evidence-acquisition ladder actually exhausted?
- Is the claimed external action precise and truly outside the worker's current capability?
- If forced_stop was claimed, what objective platform/tool signal actually occurred?
- If runtime_loss was recorded, does its heartbeat anchor verify exactly, was the recovery pulse later than stale_at, and did the recovery guard fence the old execution?
- Can that forced-stop signal be independently verified?
- Did ordinary GitHub/tool calls continue succeeding after the claimed stop signal, indicating that the worker could still have continued?

For a **voluntary/natural worker closure**, if any actionable next step existed at shift end, the handoff was premature:
- Efficiency/focus = 0/2;
- APPROVED is forbidden;
- use CORRECTED unless a stronger verdict applies;
- preserve or repair exactly one safe continuation.

For `runtime_loss`, an actionable next step is expected and is NOT evidence of premature handoff: the worker did not choose to stop.

A shift shorter than `config.short_shift_review_threshold_seconds` is NOT automatically bad. Short unresolved voluntary closures require special justification. A verified `runtime_loss` is reviewed from its exact last heartbeat and does not need a fictional closure justification.

BLOCKED is valid only when the required evidence/capability, exhausted routes and exact external action are all demonstrated. One unavailable artifact/log call is insufficient.

A `forced_stop` claim is invalid when it is based only on expected turn duration, scheduled/non-interactive execution, pending CI, or a desire to leave a clean continuation. If tools were still operational and no objective termination signal existed, treat the handoff as premature:
- Efficiency/focus = 0/2;
- APPROVED is forbidden;
- use CORRECTED unless a stronger verdict applies;
- preserve exactly one safe continuation if work remains.

For v3, `stop.forced_stop_evidence` is mandatory and OTK must verify it. For legacy v2 reviews, absence of such evidence does not make the JSON structurally invalid, but it DOES make the forced-stop claim unproven unless independent evidence exists.

## Review-path resolution

Review ids are shift-unique. The same production continuation may be worked by several brigade members after runtime losses, so `review-<production-event>` is no longer a safe identifier.

When prior OTK evidence is needed, NEVER construct or guess a review filename.

Resolution order:
1. use exact `predecessor_review_path` / `predecessor_otk_report_path` carried by the pending production/review event when present;
2. otherwise use the exact done record for the known **review event id** and its stored `review_path` / `otk_report_path`;
3. otherwise inspect done metadata by exact `source.production_event` plus `shift_number`;
4. only then inspect existing review/report metadata; never synthesize a legacy filename.

New OTK done records MUST store:
- `shift_number`;
- `source_event`;
- `review_path`;
- `otk_report_path`;
- `start_report_path` when one existed.

When OTK leaves a continuation, it MUST attach exact `predecessor_review_path` and `predecessor_otk_report_path` so the next worker can evaluate the predecessor without guessing.

A 404 on an optional/guessed legacy path is not fatal. Stop only if genuinely required evidence is unavailable after this resolution procedure.

## Review

Determine whether:
- the immutable start report exists when reporting policy v2 required it;
- the predecessor assessment was fair and evidence-based;
- the pre-work plan targeted the real blocker/objective and stated a useful success criterion;
- first real blocker was attacked;
- conclusions are evidenced;
- change is minimal and sound;
- tests/proof gates were preserved;
- manager directive was followed;
- any evidence-driven deviation from the initial plan was justified;
- proposed next action is highest-value;
- claimed progress is actually validated;
- for voluntary closure, the worker ended only at a valid natural stop boundary after the actionable-next-step test;
- the worker did not voluntarily treat discovery of the next actionable blocker as a handoff boundary;
- any BLOCKED/speculation claim contains adequate exhaustion evidence from the acquisition ladder;
- any pending external evidence handoff was caused by an objectively evidenced runtime/tooling stop rather than ordinary CI latency or predicted turn expiry;
- anti-cheat was violated.

Verdict:
APPROVED, CORRECTED, REMEDIATED, COMPLETE, BLOCKED or CHEAT.

Score 0..10 using the scoring policy carried by the review event:
- `score_policy_version: 2` -> progress 0..4, engineering quality 0..3, efficiency/focus while alive 0..2, start assessment/plan 0..1;
- legacy `score_policy_version: 1` -> historical scoring remains valid and is not retroactively changed.

If a new review lacks score_policy_version but `reporting_policy_version: 2` is present, treat that as a control-plane defect rather than silently guessing.

CHEAT uses fixed -100 rating penalty.

Classify project progress exactly:
- none
- incremental
- substantial
- milestone

## Continuation control

Any continuation MUST retain the same object_id.

APPROVED: leave it.
CORRECTED: correct/replace exactly one continuation.
REMEDIATED: ensure exactly one corrected continuation remains.
COMPLETE: remove stale continuation.
BLOCKED: remove normal continuation and persist blocker.
CHEAT: repair compromised state/gates where possible and leave exactly one safe continuation unless externally blocked.

For every continuation that remains after OTK:
- persist exact `predecessor_review_event_id`;
- persist exact `predecessor_review_path`;
- for reporting policy v2, persist exact `predecessor_otk_report_path`;
- persist `predecessor_shift_number` and `predecessor_worker_id`.

These fields are the authoritative input for the next worker's start-of-shift predecessor assessment.

## Queue continuity guard

Normal case: a live worker does **not** finish while mandatory external evidence is still running. The worker keeps the shift, waits for terminal evidence and continues.

Recovery case: if a shift genuinely ended because the platform/runtime/tooling forced termination or could no longer observe the external run, OTK MUST NOT leave the active-object production queue empty.

For that recovery case:
- ensure exactly one same-object continuation exists;
- describe the exact evidence/run that must be checked next;
- attach a `wait_for` object when possible;
- preserve the documented forced-stop reason;
- keep wake pending.

A recovery continuation whose only purpose is to wait for external evidence must not consume a brigade turn while the evidence is still non-terminal.

Treat ANY voluntary handoff as premature when the live Chat/tools still had an evidence-backed actionable next step. This includes pending CI, consuming one terminal result and stopping at the next blocker, or declaring BLOCKED after only one failed evidence-access route:
- Efficiency/focus = 0/2;
- verdict cannot be APPROVED on that handoff; use CORRECTED unless a stronger verdict applies;
- BLOCKED cannot be awarded without exhaustion evidence and a precise external action;
- preserve one safe continuation so production still proceeds.

This guard remains as crash/recovery protection, not as normal shift choreography.

## Persistent rating

OTK alone updates .agent/brigade.json.

For a scored shift:
- shift_counter becomes reviewed shift number;
- rating delta = (score - 5) * 10, except CHEAT=-100;
- update worker statistics;
- advance next_member_id exactly one roster position.

Ratings are global across objects and never reset on transfer.

## Object state

SHA/CAS update .agent/objects/<object-id>/state.json:
- last_scored_shift;
- last_otk_verdict;
- last_progress_class;
- last_event;
- current_blocker_summary when evidence changes it;
- updated_at.

Do not change object ACTIVE/PAUSED status here; transfer status belongs to management.

## Management signal

SHA/CAS update .agent/management/state.json for the active object:
- last_scored_shift;
- shifts_since_manager_review += 1;
- last_otk_verdict;
- last_progress_class;
- consecutive_no_progress increments only for none, otherwise resets;
- consecutive_corrected increments only for CORRECTED, otherwise resets;
- current_blocker_summary when evidence changes it.

Wake the manager when any trigger fires:
- three shifts since manager review;
- two no-progress shifts;
- two CORRECTED reviews;
- REMEDIATED, BLOCKED or CHEAT;
- milestone;
- release candidate;
- material architecture/scope proposal;
- owner decision required;
- assignment.transfer_state is requested or draining.

Manager wake generation is monotonic and reasons are preserved on conflict.

## Relay handoff

After OTK has fully persisted verdict, rating, brigade rotation, object state, management signal and human report, the same scheduled Chat MAY continue into the next production phase only under `.agent/workflow.md`.

This does not permit self-review:
- the reviewed shift must come from an earlier run;
- OTK must be complete before the next worker is materialized;
- the next worker is the newly advanced `next_member_id`;
- OTK evidence and new-shift evidence remain separate.

If transfer is draining, STOP after OTK and do not start another production shift.

## Human report

After rating, follow `.agent/reporting.md` exactly.

For reporting policy v2, OTK writes an **independent supervision report**, never a reconstructed first-person worker report.

Required sections:
- ЧТО ПЛАНИРОВАЛ;
- ЧТО ФАКТИЧЕСКИ СДЕЛАНО;
- ЧТО ПОДТВЕРЖДЕНО;
- ГДЕ ОСТАНОВИЛСЯ;
- СЛЕДУЮЩЕМУ;
- four component scores, total verdict and rating.

The `ЧТО ПЛАНИРОВАЛ` section summarizes the immutable start report. If the required start report is missing, say that explicitly; do not reconstruct or fabricate it.

Time rules:
- use authoritative production timestamps carried in the review event;
- if absent in a legacy event, recover from GitHub server timestamps of the production lease claim/end commits;
- for runtime_loss, the worker end is exactly the last verified heartbeat/action, not recovery time;
- convert to Europe/Moscow (UTC+03:00).

Publication protocol for v2:
1. Create immutable `.agent/reports/otk/shift-<shift-number>-<review-event-id>.md`.
2. Never overwrite an existing OTK result.
3. Update `.agent/reports/latest-otk.md` and optionally legacy convenience mirror `.agent/reports/latest.md`.
4. External delivery is tied only to creation of the immutable OTK file.

Legacy pre-v2 reviews may keep their historical `.agent/reports/published/` format. Do not rewrite them.

Private evidence remains in reviews/journals.

## Runtime-loss review

For `stop.kind=runtime_loss`:
- independently verify the last heartbeat anchor and recovery anchor;
- use `worker_last_seen_at_utc` as the factual worker end time, not the later administrative recovery time;
- do not classify runtime loss itself as voluntary premature handoff;
- do not apply an automatic Efficiency/focus penalty merely because the platform execution disappeared;
- score only evidenced engineering progress/quality/focus up to the last verified heartbeat;
- evaluate the immutable start assessment/plan normally if it exists; if a required v2 start report is missing, that category is 0/1 without fabricating one;
- repair/preserve exactly one actionable same-object continuation;
- advance brigade rotation normally so the next worker can take over.

If the evidence shows the worker was actually still LIVE or the stale condition was not valid, treat the recovery as a control-plane defect and do not attribute it to the worker.

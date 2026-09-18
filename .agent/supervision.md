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
2. shift report and journal;
3. target diff/commits;
4. CI results/logs/artifacts;
5. continuation;
6. object mission / Definition of Done;
7. applicable management directive.

## Review

Determine whether:
- first real blocker was attacked;
- conclusions are evidenced;
- change is minimal and sound;
- tests/proof gates were preserved;
- manager directive was followed;
- proposed next action is highest-value;
- claimed progress is actually validated;
- the worker ended only at a valid natural stop boundary;
- any pending external evidence handoff was caused by a documented forced runtime/tooling stop rather than ordinary CI latency;
- anti-cheat was violated.

Verdict:
APPROVED, CORRECTED, REMEDIATED, COMPLETE, BLOCKED or CHEAT.

Score 0..10 using competition policy.
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

If a worker voluntarily handed off ordinary pending CI while the live Chat/tools were still capable of waiting, treat that as premature handoff:
- Efficiency/focus = 0/2;
- verdict cannot be APPROVED on that handoff; use CORRECTED unless a stronger verdict applies;
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

OTK must build the final report in this order:

```text
Проект: <human project name>
Работник: <brigade display name>
Смена: №<global brigade shift number>
Начало смены: <DD.MM.YYYY HH:MM:SS МСК>
Конец смены: <DD.MM.YYYY HH:MM:SS МСК>

Доклад:

ОЦЕНКА ПРЕДЫДУЩЕГО:
<verified first-person paragraph>

МОЙ ПЛАН:
<verified first-person paragraph>

ЧТО ПОЛУЧИЛОСЬ:
<verified first-person paragraph>

СЛЕДУЮЩЕМУ:
<verified first-person paragraph>

Оценка ОТК: <score>/10 — <verdict>
Рейтинг: <new rating> (<signed delta>)
```

Time rules:
- use authoritative production timestamps carried in the review event;
- if absent in a legacy event, recover from GitHub server timestamps of the production lease claim/end commits;
- convert to Europe/Moscow (UTC+03:00);
- never substitute the OTK review time for the worker's shift end.

The narrative is written from the worker's point of view, but every material statement must be independently supported by evidence.

The four sections are mandatory. Keep real technical detail understandable to a non-specialist owner. Humor/irony is encouraged and should be more visible than before, but it must not blur status, uncertainty or evidence.

OTK score and rating are separate metadata after the report and must never be hidden inside the prose.

Publication protocol:
1. Create immutable `.agent/reports/published/<review-event-id>.md` with the final report.
2. Never overwrite an existing published report.
3. Update `.agent/reports/latest.md` with the same text only as a convenience mirror.
4. External delivery must be tied to creation of the immutable published file, never to edits of `latest.md`.

Private evidence remains in reviews/journals.

# Supervisor Review Policy

## Purpose

ОТК independently reviews the previous production shift. It verifies engineering evidence, prevents drift and assigns the official brigade score.

Read `.agent/competition.md` and `.agent/brigade.json` before scoring.

## Required evidence

Inspect as applicable:
1. original event goal/constraints;
2. shift report and technical journal;
3. target repository diff/commits;
4. actual CI/workflow results and available logs/artifacts;
5. queued continuation;
6. mission Definition of Done;
7. applicable management directive.

Do not rely on the worker's summary where underlying evidence is available.

## Review

Determine:
- whether the worker attacked the first real blocker rather than a symptom;
- whether conclusions are evidenced;
- whether the change is minimal and architecturally sound;
- whether tests/proof/release gates were preserved;
- whether the manager directive, if any, was followed;
- whether the next action is the highest-value action;
- whether claimed progress is actually validated;
- whether any anti-cheat rule was violated.

Verdict is one of:
`APPROVED`, `CORRECTED`, `REMEDIATED`, `COMPLETE`, `BLOCKED`, `CHEAT`.

Score the production shift 0..10 using `.agent/competition.md`.
CHEAT uses the fixed -100 rating penalty and increments cheat_strikes.

Also classify verified project progress for management as exactly one:
- `none` — no meaningful new evidence or useful state change;
- `incremental` — useful narrowing/evidence but same milestone/blocker remains;
- `substantial` — major blocker removed or material capability gained;
- `milestone` — a Definition-of-Done milestone is genuinely reached.

## Continuation control

If a continuation exists:
- APPROVED: leave it.
- CORRECTED: correct/replace exactly one continuation.
- REMEDIATED: ensure exactly one corrected continuation remains.
- COMPLETE: remove stale continuation.
- BLOCKED: remove normal continuation and persist blocker.
- CHEAT: correct compromised state/gates where possible, then leave exactly one safe continuation unless externally blocked.

## Persistent rating

The supervisor alone updates `.agent/brigade.json`.

For a normal scored shift:
- set global shift_counter to the reviewed shift number;
- rating delta = (score - 5) * 10, except CHEAT = -100;
- update shifts_scored, total_score, average_score, best_score, last_score;
- increment cheat_strikes on CHEAT;
- advance next_member_id one roster position.

Never reward quantity metrics.

## Management signal

After scoring, read and SHA/CAS-update `.agent/management/state.json`:

- `last_scored_shift` = reviewed shift number;
- `shifts_since_manager_review += 1`;
- `last_otk_verdict` = verdict;
- `last_progress_class` = progress class;
- if progress class is `none`, increment `consecutive_no_progress`, otherwise set it to 0;
- if verdict is `CORRECTED`, increment `consecutive_corrected`, otherwise set it to 0;
- update `current_blocker_summary` in concise plain language when evidence changed the blocker.

Then evaluate manager-attention triggers:
- `shifts_since_manager_review >= 3`;
- `consecutive_no_progress >= 2`;
- `consecutive_corrected >= 2`;
- verdict is `REMEDIATED`, `BLOCKED`, or `CHEAT`;
- progress class is `milestone`;
- a release candidate is claimed;
- a material architecture/scope change is proposed;
- an owner decision is required.

If any trigger fires, SHA/CAS-update `.agent/management/wake.json`:
- set `attention=true`;
- increment `generation` exactly once for this OTK review;
- append concise trigger reasons;
- update timestamp.

If manager wake already contains newer reasons, preserve them. Never lower its generation.

## Human report

After rating, write `.agent/reports/latest.md` with ONLY:

```
Проект: <human project name>
Работник: <brigade display name>
Смена: №<number>
Доклад: <short Russian prose>
```

No technical metadata.

The report prose should:
- sound like a competent factory veteran reporting to the foreman;
- briefly assess the predecessor when relevant;
- say whether this shift did useful work;
- naturally mention the official score/rating movement when useful;
- include at most one or two mild collegial jokes/jabs;
- never insult anyone;
- never exaggerate success;
- keep uncertainty explicit in ordinary language.

Private review remains detailed under `.agent/reviews/<reviewed-event-id>.md`.

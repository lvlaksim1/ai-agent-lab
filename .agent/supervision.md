# Supervisor Review Policy

## Purpose

A supervisor review is an independent ordinary-Chat reasoning pass over the previous worker's result. It exists so long-running autonomous work is not allowed to drift for many scheduled ticks without challenge.

## Required evidence

For the reviewed event, inspect as applicable:

1. the original event goal and constraints;
2. `.agent/reports/<event-id>.md`;
3. `.agent/journal/<event-id>.md`;
4. the target repository diff/commits made by the worker;
5. actual GitHub Actions runs, job conclusions and available logs/artifacts;
6. the queued continuation event, if one exists;
7. the overall mission Definition of Done.

Do not rely on the previous worker's summary when the underlying evidence is available.

## Review questions

Answer these explicitly in the review record:

- Did the worker solve/investigate the first real blocker, or merely a symptom?
- Is every technical conclusion supported by evidence?
- Was the change minimal and aligned with the project architecture?
- Were tests/proof/release gates preserved?
- Did the worker introduce diagnostic code that should later be removed?
- Is the proposed next action the highest-value next action?
- Is the continuation too broad, too narrow, repetitive or based on an unproven assumption?
- Did CI actually validate the claimed progress?
- Has the mission reached its Definition of Done?

## Outcomes

Use exactly one:

- `APPROVED` — previous work and proposed continuation are sound.
- `CORRECTED` — previous work is acceptable but the continuation/instructions are corrected.
- `REMEDIATED` — a harmful/unjustified target-repo change required a minimal corrective/revert commit.
- `COMPLETE` — mission Definition of Done is genuinely satisfied; remove any stale continuation.
- `BLOCKED` — a genuine external blocker is proven.

## Continuation control

If a continuation event exists:

- APPROVED: leave it unchanged.
- CORRECTED: update its goal/constraints using its current blob SHA, or replace it with exactly one corrected continuation.
- REMEDIATED: ensure exactly one corrected continuation remains.
- COMPLETE: delete the continuation and reconcile wake.
- BLOCKED: remove normal continuation and persist the external blocker clearly.

Never create multiple competing continuations for the same mission.

## Review record

Write `.agent/reviews/<reviewed-event-id>.md` with:

- verdict;
- evidence independently checked;
- disagreements/corrections;
- target-repo commits reviewed;
- CI runs reviewed;
- continuation action;
- exact next recommendation.

Also write/update `.agent/reports/latest.md` so a human or supervising chat can immediately see current mission state.

## Scope

Supervisor review is allowed to inspect and correct work, but it must not turn into unrelated development. If substantial new implementation is needed, express it as the next continuation event.

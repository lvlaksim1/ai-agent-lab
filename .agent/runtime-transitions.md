# Runtime Transition Engine v1

## Purpose

ChatGPT remains responsible for reasoning, diagnosis, engineering choices and evidence interpretation.

Deterministic bookkeeping is separated into pure transition planning:
- input snapshot + command/event;
- pure transition plan;
- one non-force CAS Git tree commit.

The canonical reducer is `.github/scripts/lib/runtime-transition.cjs`.
The canonical commit primitive is `.github/scripts/lib/atomic-plan.cjs`.

## Snapshot rule

A transition MUST be planned from one immutable Git commit snapshot. Do not read HEAD and then mix files read from a later moving branch state.

The transition is applied only if the branch still equals the expected parent SHA.

## Time-anchor exception

`.agent/time-pulse.json` remains a separate commit.

This is intentional: GitHub `commit.committer.date` of that exact pulse commit is the authoritative runtime time. State derived from the pulse is committed afterward with CAS against the pulse SHA.

Do not combine pulse and derived state into one commit.

## Atomic transition classes

Current deterministic classes:
- external event enqueue + wake update;
- stale production/OTK recovery state release;
- runtime-loss review creation;
- manager defect wake;
- immutable append-only create planning;
- fence/identity checks.

Related non-time-anchor mutations belonging to one class should be one atomic tree commit.

## Replay proof

`tests/runtime-transition.replay.test.cjs` covers:
- duplicate intake idempotency;
- eligible wake transition;
- heartbeat identity race;
- zombie fence rejection;
- production runtime-loss recovery;
- OTK runtime-loss retry;
- manager/worker path-disjoint concurrency;
- immutable report duplicate/different-content behavior.

`tests/atomic-plan.replay.test.cjs` covers:
- deterministic path ordering;
- expected-head CAS rejection;
- update-ref conflict rejection.

Any change to transition or atomic-commit logic must keep these tests green.

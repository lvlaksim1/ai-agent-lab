# Agent Runtime Protocol

## Purpose

GitHub is the authoritative persistent state and message bus. Native Scheduled Chat supplies only periodic clock ticks. Ordinary Chat performs reasoning.

## Idle path

Every scheduled run starts by reading exactly one file:

`.agent/wake.json`

If `pending=false`, stop immediately. Do not read profile, state, queue, journal, target files or repository history.

## Producer protocol

A producer creates one immutable JSON event under:

`.agent/queue/pending/<event-id>.json`

and advances `.agent/wake.json`:

- `pending=true`;
- `generation = previous generation + 1`;
- `last_event=<event-id>`;
- `updated_at=<UTC ISO-8601>`.

The event file and wake update SHOULD be committed atomically. The supplied GitHub intake workflow does this in one Git commit.

`generation` is monotonic. Producers never decrement it.

## Worker protocol

A worker remembers the wake generation seen at the beginning of its run.

After processing one event:

1. list remaining pending event JSON files;
2. re-read `.agent/wake.json`;
3. if its generation is greater than the generation observed at run start, a producer wrote new work while the worker was active: leave `pending=true`;
4. if pending files remain, leave `pending=true`;
5. only when the queue is empty AND generation has not advanced may the worker set `pending=false`;
6. update wake/state using current blob SHA (compare-and-swap behavior);
7. on SHA conflict, re-read and preserve the newer state.

This prevents a worker from erasing a concurrent producer wake-up.

## Claim/lease

`.agent/state.json` is the single-worker lease.

Valid status values:

- `idle`
- `processing`

A claim is an SHA-guarded update from idle to processing.

While processing, state contains `active_event`, `worker_id`, `started_at`, and `lease_until`.

If another worker sees an unexpired processing lease, it stops. If the lease expired, the next worker may recover the event and must document recovery.

## Event ordering

Workers process at most one event per run.

Selection order:

1. higher numeric `priority`;
2. older `created_at`;
3. lexical event id as deterministic tie-breaker.

## Result reporting

Persistent result state always wins over notification delivery.

For events originating from a GitHub issue/PR comment, the worker SHOULD post a completion comment only after the target change, journal, done record, state reset and wake reconciliation have succeeded.

Completion comments start with `[AGENT_RESULT]`, never `[AGENT_TASK]`, so the intake workflow will not enqueue them as new work.

## Scheduler invariants

The scheduler is immutable after initial setup.

Forbidden at runtime:

- re-arm;
- changing DTSTART/RRULE;
- enabling/disabling tasks;
- creating a replacement task;
- Work-based wakeups.

All dynamic orchestration is represented as GitHub data.

## Failure behavior

If task execution is blocked, do not falsify success. Write a journal entry and done record with status `blocked`, then return state to idle.

If persistence fails after target code changed, prioritize repairing agent state/journal on the next run before taking new work.

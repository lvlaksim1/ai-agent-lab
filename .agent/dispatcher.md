# Generic Shop Dispatcher — Variant C-5

## Purpose

All five active Scheduled Tasks are generic **clock ticks**, not named workers and not a dedicated manager clock.

Each physical task runs once per hour. The five tasks are staggered evenly at Moscow minutes:

- :00
- :12
- :24
- :36
- :48

Nominal maximum dispatcher polling latency is therefore 12 minutes without adding active Scheduled Tasks.

The clock does not define shift duration. A production worker may remain active across any number of later ticks.

## First read

Every clock tick initially reads only:
- `.agent/state.json`
- `.agent/wake.json`
- `.agent/management/wake.json`

## State machine

### Active worker

If production state is `processing` and lease is valid:
- manager attention=true -> materialize one manager review; active worker continues concurrently;
- manager attention=false -> quiet no-op.

### Idle station

If production state is `idle`:
1. manager attention=true -> one manager review, then stop;
2. else production wake pending=true -> run the production relay;
3. else quiet no-op.

### Expired lease

If state says `processing` but lease has expired:
- manager attention has priority for one management review;
- otherwise enter production workflow and perform its safe stale-lease recovery before taking work.

## Role isolation

One clock run materializes exactly one top-level role:
- manager;
- production relay;
- idle.

Manager never becomes worker or OTK in the same run.

Production relay may retain its existing sequential `OTK -> next worker` behavior.

## Concurrency

Allowed:
- one production worker + one manager.

Forbidden:
- worker + worker;
- two production/OTK leases;
- manager acting as OTK.

## Shift duration

Clock cadence is not a work budget.

An active worker continues until the natural stop condition in `.agent/workflow.md` and may renew the production lease. Later clock ticks see the occupied station and do not replace that worker.

## Notifications

Normal no-op ticks stay silent. Human reports continue through the immutable Telegram publication path.

## Fallback

Variant A rollback is documented in `.agent/scheduler-rollback-variant-a.md`.

# DEC-20260918-generic-dispatcher

- **Status:** ACTIVE
- **Type:** DECISION
- **Date:** 2026-09-18

## Decision

Use all five existing active Scheduled Tasks as generic exact-schedule clock ticks rather than four dedicated production clocks plus one dedicated manager clock.

Clock slots (Europe/Moscow):
- :00
- :12
- :24
- :36
- :48

Each physical task still runs once per hour. Combined nominal maximum polling latency is 12 minutes.

## Dispatcher

Each tick first reads production state, production wake and manager wake, then materializes exactly one top-level role:
- MANAGER;
- PRODUCTION RELAY;
- IDLE.

If a worker is active, another worker cannot start. A manager may run concurrently when attention is pending.

If the station is idle, manager attention has priority; otherwise production wake starts the relay.

## Shift duration

Clock cadence is not shift duration. Active workers continue until a natural stop condition and may renew their lease.

## Reason

Reduce handoff latency using the same five active tasks while preserving the owner's prohibition on worker+worker parallelism.

## Rollback

Variant A remains a supported fallback:
- production :02/:17/:32/:47;
- dedicated manager :59.

Rollback affects only scheduler/control-plane topology and does not revert project/queue/rating history.

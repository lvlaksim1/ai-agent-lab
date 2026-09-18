# Generic Shop Dispatcher — Variant C-5

## Purpose

All five active Scheduled Tasks are generic **clock ticks**, not named workers and not a dedicated manager clock.

Each physical task runs at most once per hour. Five tasks are staggered evenly:

- :00
- :12
- :24
- :36
- :48

This gives a nominal maximum dispatcher polling latency of 12 minutes without adding active Scheduled Tasks.

The clock does not define shift duration. A production worker may remain active across any number of later ticks.

## First read

Every clock tick initially reads only:

- `.agent/state.json`
- `.agent/wake.json`
- `.agent/management/wake.json`

Do not load the full project before role selection.

## State machine

### 1. Active production worker

If `.agent/state.json.status == processing` and the lease is still valid:

- if `.agent/management/wake.json.attention == true`:
  - materialize **Начальник участка**;
  - run exactly one management review;
  - the production worker continues concurrently;
  - never become a second production worker.

- otherwise:
  - quiet no-op;
  - do not load production queue/project files;
  - do not notify the owner.

### 2. Expired production lease

If state says `processing` but `lease_until` is already expired:

- treat the production station as needing recovery;
- if manager attention is true, manager has priority for one review;
- otherwise enter the production workflow, which must recover the expired lease safely before claiming work.

### 3. Production station idle

If state is `idle`:

1. If manager attention is true:
   - materialize **Начальник участка** first;
   - run exactly one management review;
   - stop after that role;
   - production can start at the next clock tick.

2. Else if production wake `pending == true`:
   - materialize the production relay;
   - follow `.agent/workflow.md`;
   - the relay may perform OTK of the previous shift and then at most one next production shift, as already defined.

3. Else:
   - quiet no-op.

## Why manager has priority when the station is idle

Management attention may contain STOP, transfer, blocker or course-change decisions. Starting a worker before resolving that control-plane state can waste a shift.

When a worker is already active, manager may run concurrently because worker + manager is explicitly allowed.

## Role isolation

A single clock-run materializes at most one top-level logical role:

- MANAGER; or
- PRODUCTION RELAY; or
- IDLE.

The production relay may still do its existing sequential `OTK -> next worker` cycle.

A manager run never becomes a production worker in the same Chat.

## Concurrency

Allowed:
- one production worker + one manager.

Forbidden:
- worker + worker;
- two OTK/production leases;
- manager acting as OTK.

## Notifications

Normal clock checks are silent:
- no work;
- valid occupied production lease with no manager attention;
- wait-for preflight still non-terminal;
- other no-op conditions.

Human-visible reporting remains the responsibility of the immutable Telegram publication path and meaningful manager escalation.

## Rollback

Variant A is preserved in `.agent/scheduler-rollback-variant-a.md`.

Rollback requires only:
- restoring the four production clocks :02/:17/:32/:47;
- restoring dedicated manager :59;
- restoring their role-specific prompts;
- restoring Variant A config/topology fields.

No queue, rating, object, journal or project state needs to be rolled back.

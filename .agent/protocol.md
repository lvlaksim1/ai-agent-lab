# Agent Runtime Protocol

## Purpose

GitHub is the authoritative persistent state and message bus. Native Scheduled Chat supplies only periodic clock ticks. Ordinary Chat performs reasoning.

The production queue is global transport, but every project event belongs to a registered object.

## Idle path

Every production scheduled run starts by reading exactly one file:

.agent/wake.json

If pending=false, stop immediately. Do not read profile, state, queue, journal, target files or repository history.

## Object assignment

Authoritative assignment:
.agent/assignment.json

Registered objects:
.agent/objects/index.json

Every non-legacy queue event MUST contain object_id.

Production eligibility:
- supervisor-review for the active object is eligible even while a NORMAL transfer is draining;
- ordinary production work is eligible only for assignment.active_object while transfer_state=working;
- events for PAUSED/NEW objects remain durable but are ineligible;
- a legacy event without object_id may be inferred only when its target repository unambiguously matches exactly one registered object.

Workers never silently retarget an event from one object to another.

## Producer protocol

A producer creates one immutable JSON event under:

.agent/queue/pending/<event-id>.json

The event includes object_id resolved from the registered object map.

A producer advances wake generation monotonically.
It sets pending=true only when the new event is eligible for the currently active object, or when pending was already true because other eligible work exists.

An event for a paused object may be stored without waking production.

The event file and wake update SHOULD be committed atomically.

## Worker protocol

A worker remembers the wake generation seen at the beginning of its run.

After processing one event:

1. list remaining pending event JSON files;
2. read assignment and determine which remaining events are eligible for the active object;
3. re-read .agent/wake.json;
4. if generation advanced while the worker was active, preserve the newer producer state;
5. if eligible events remain, leave pending=true;
6. if no eligible events remain and generation did not introduce new eligible work, set pending=false even if paused-object events still exist;
7. update wake/state using current blob SHA;
8. on SHA conflict, re-read and preserve newer state.

Paused-object backlog must not cause permanent production wakeups.

## Claim/lease

.agent/state.json is the single production/OTK lease.

Valid status values:
- idle
- processing

A claim is an SHA-guarded update from idle to processing.

While processing, state contains active_event, worker_id, started_at and lease_until.

If another worker sees an unexpired processing lease, it stops. If the lease expired, the next worker may recover the event and must document recovery.

## Event ordering

Workers process at most one eligible event per run.

Selection order:
1. higher numeric priority;
2. older created_at;
3. lexical event id.

Ineligible events do not participate in ordering for the current active object.

## Transfer boundary

Transfer policy is defined in .agent/transfer.md.

During transfer_state=requested, draining or switching:
- no new ordinary production shift may start;
- an already started shift may finish;
- its supervisor-review may finish;
- manager performs conservation and pointer switch;
- production resumes only after assignment returns to working.

## Result reporting

Persistent result state always wins over notification delivery.

For events originating from a GitHub issue/PR comment, completion comments are posted only after durable result state is safe.

## Scheduler invariants

The scheduler is immutable after setup.

Forbidden at runtime:
- re-arm;
- changing DTSTART/RRULE;
- enabling/disabling tasks;
- creating a replacement task;
- Work-based wakeups.

All dynamic orchestration is represented as GitHub data.

## Failure behavior

If execution is blocked, do not falsify success. Persist the blocker and return production state to idle.

If persistence fails after target code changed, prioritize repairing agent state/journal on the next run before taking new work.

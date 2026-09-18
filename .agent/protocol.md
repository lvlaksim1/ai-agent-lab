# Agent Runtime Protocol

## Purpose

GitHub is the authoritative persistent state and message bus. Native Scheduled Chat supplies periodic clock ticks. Ordinary Chat performs reasoning.

The runtime uses an **эстафетный цикл**: a production tick may first accept the previous shift through OTK and then, sequentially, start exactly one next production shift.

## Idle path

Every physical clock run is a generic dispatcher tick. It first reads only `.agent/state.json`, `.agent/wake.json` and `.agent/management/wake.json`, then follows `.agent/dispatcher.md` to select MANAGER, PRODUCTION RELAY or IDLE. Full project/runtime context is loaded only after role selection.

## Object assignment

Authoritative assignment:
`.agent/assignment.json`

Registered objects:
`.agent/objects/index.json`

Every non-legacy queue event MUST contain object_id.

Production eligibility:
- supervisor-review for the active object is eligible even while a NORMAL transfer is draining;
- ordinary production work is eligible only for assignment.active_object while transfer_state=working;
- events for PAUSED/NEW objects remain durable but are ineligible.

Workers never silently retarget an event.

## Producer protocol

A producer creates one immutable event under:

`.agent/queue/pending/<event-id>.json`

and advances wake generation monotonically.

An event for a paused object may be stored without waking production.

## Single-worker lease

`.agent/state.json` is one global production/OTK lease.

Valid status:
- idle
- processing

While processing it contains active_event, worker_id, started_at, lease_until and the mandatory heartbeat defined in `.agent/liveness.md`.

Hard invariant: **two production workers never run concurrently.**

Lease and heartbeat answer different questions:
- lease: who owns the production station;
- heartbeat: whether that owner has been observed alive recently and what it is doing.

Never infer liveness from an unexpired lease.

## Authoritative runtime time

All live control-plane timestamps use the exact GitHub commit time-anchor protocol in `.agent/liveness.md`.

Runtime workers must not manufacture current UTC values. They first update `.agent/time-pulse.json`, fetch the exact resulting commit and use only its `commit.committer.date`.

This applies to heartbeat observation time, stale deadlines, shift start, lease claim/renewal, and external-wait timing.

If another production clock sees an unexpired lease, it stops. An expired lease may be recovered and recovery must be documented.

The manager uses `.agent/management/` state and may run concurrently with one production worker. Conflicting GitHub writes require SHA/CAS retry. A valid production lease blocks only another production worker, not the manager.

## Relay run limits

A scheduled production run has these absolute limits:

- max total queue events: 2;
- max supervisor-review: 1;
- max production shift: 1.

The ONLY two-event pattern is:

`supervisor-review -> production`

If the first processed event is production, the run ends after it creates its supervisor-review. Self-review in the same run is forbidden.

If the first event is supervisor-review, it must be fully persisted before the run may claim the next production event.

## Event ordering

At start of a production run:
1. eligible supervisor-review first;
2. otherwise higher numeric priority;
3. older created_at;
4. lexical event id.

For the optional second phase after OTK:
1. only normal production events are eligible;
2. higher priority;
3. older created_at;
4. lexical event id.

## Active external evidence wait

A production worker that starts mandatory CI/build/test retains ownership of the shift while that evidence is observable from the live Chat.

Rules:
- publish the exact external wait target/status in heartbeat;
- poll the exact external run until terminal while the current Chat/tools remain available;
- refresh heartbeat after every poll;
- renew the production lease as required;
- consume terminal evidence in the same shift and continue the reasoning/action loop;
- do not convert ordinary CI latency into a worker handoff.

A `wait_for` continuation is recovery-only. It is appropriate when the live Chat/runtime/tooling is forced to terminate or becomes unable to observe the external run. The next worker performs preflight without consuming a brigade turn while that inherited evidence is still non-terminal.

## Wake reconciliation

After a production-only run:
1. list eligible remaining work;
2. re-read wake;
3. preserve newer generations;
4. keep pending=true if eligible work remains;
5. clear only when no eligible work remains and no newer eligible wake was introduced.

After an OTK first phase:
- persist OTK completely;
- then re-read runtime state and queue;
- if a legal second production phase exists, run it;
- otherwise reconcile and stop.

Paused-object backlog does not keep production awake.

## Transfer boundary

During transfer_state=requested, draining or switching:
- no new ordinary production shift may start;
- an already started shift may finish;
- its supervisor-review may finish;
- relay second production phase is forbidden;
- manager performs conservation and switch.

## Result reporting

Persistent result state wins over notification delivery.

## Scheduler invariants

After the explicit owner-approved topology configuration, runtime code must not mutate scheduler tasks.

Forbidden from runtime:
- re-arm;
- changing DTSTART/RRULE;
- enabling/disabling;
- creating replacement tasks;
- Work-based wakeups.

## Failure behavior

Never falsify success. Persist blockers and restore lease safely.

If persistence fails after target code changed, repair durable agent state before taking new work.

## Emergency stale-worker recovery

Read `.agent/emergency-recovery.md`.

Healthy workers are never ended because a production clock is approaching. They may continue across any number of :00/:12/:24/:36/:48 clocks while heartbeat remains LIVE and normal lease rules are respected.

A separate recovery guard runs at :10/:22/:34/:46/:58, exactly two minutes before the next normal production clock. It acts only when a processing worker has a verified GitHub-anchored STALE heartbeat.

Verified stale recovery may bypass an otherwise valid 45-minute lease. The guard fences the lost execution, records `runtime_loss`, releases state to idle, enqueues OTK review and leaves the production continuation pending. The following normal production clock runs OTK first and may then start the next brigade worker.

`runtime_loss` is not `forced_stop` and is not a voluntary handoff.

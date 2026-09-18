# Production Topology v3 — Generic Clock Dispatcher

Five active exact-schedule clock tasks are evenly staggered at Moscow minutes :00, :12, :24, :36 and :48.

Each clock is generic. It first checks production state, production wake and manager wake, then selects exactly one top-level role: MANAGER, PRODUCTION RELAY or IDLE. Detailed selection rules are in `.agent/dispatcher.md`.

The nominal maximum polling latency is 12 minutes. This is NOT a shift-duration limit.

A production worker continues across later clock ticks until the natural stop condition in `.agent/workflow.md`. The lease is renewable and protects ownership/concurrency. Worker liveness is separately represented by the mandatory heartbeat in `.agent/state.json`.

Allowed concurrency: one worker + one manager.
Forbidden: worker + worker.

When a worker lease is valid, later ticks never start another worker. If manager attention is pending, a tick may run one manager review concurrently.

When the production station is idle, manager attention has priority over starting a new worker. Otherwise pending production work starts the production relay.

Production relay keeps the existing independent OTK -> next-worker sequence. Self-review remains forbidden.

All clock tasks remain exact-schedule. No-op checks are silent. Worker reports use the immutable Telegram publication path.

Rollback to the previous :02/:17/:32/:47 production + :59 manager topology is documented in `.agent/scheduler-rollback-variant-a.md`.

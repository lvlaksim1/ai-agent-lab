# Scheduler Rollback — Variant A

This is the owner-approved fallback topology that existed immediately before Variant C-5.

## Physical clock topology

All tasks use `exact_schedule`, Europe/Moscow, recurring hourly.

Production relay slots:
- :02
- :17
- :32
- :47

Dedicated manager:
- :59

## Production role

Use the production relay prompt from `.agent/scheduled-worker.md`.

Core behavior:
- first read `.agent/wake.json`;
- idle when pending=false;
- otherwise follow config/profile/protocol/workflow;
- never run more than one production worker concurrently;
- production relay may perform OTK then one next worker sequentially;
- runtime never mutates scheduler tasks.

## Manager role

Dedicated :59 task:
- first read `.agent/management/wake.json`;
- idle when attention=false;
- otherwise load manager persona/charter/workflow/state and perform one management review;
- manager is not worker and not OTK;
- manager may coexist with one active worker.

## Runtime configuration to restore

- clock architecture: dedicated roles
- production minutes: [2,17,32,47]
- manager minute: 59
- nominal max production polling latency: 15 minutes

## State safety

Rollback is scheduler/control-plane only.

Do NOT roll back:
- brigade ratings;
- queue events;
- object state;
- journals/reviews;
- context capsule;
- target repository commits.

If rollback occurs while a worker is active, preserve its valid lease and let the worker finish naturally.

# Scheduler Rollback — Variant A

This is the fallback topology immediately preceding Variant C-5.

## Clock topology

All tasks: exact schedule, Europe/Moscow, hourly recurrence.

Production relay:
- :02
- :17
- :32
- :47

Dedicated manager:
- :59

## Production prompt

Use `.agent/scheduled-worker.md`.

## Manager behavior

Dedicated :59 task:
- read `.agent/management/wake.json` first;
- if attention=false -> quiet idle;
- if attention=true -> load manager persona/charter/workflow/state and perform one management review;
- manager is not worker or OTK;
- manager may coexist with one active worker.

## Configuration to restore

- dedicated-role clock architecture;
- production minutes [2,17,32,47];
- manager minute 59;
- nominal max production polling latency 15 minutes.

## State safety

Rollback changes scheduler/control-plane topology only.

Do not roll back:
- brigade ratings;
- queue;
- object state;
- journals/reviews;
- Project Context Capsule;
- target-repository commits.

If a worker is active during rollback, preserve its lease and let it finish naturally.

# DEC-20260918-silent-scheduler-notifications

- **Status:** ACTIVE
- **Type:** DECISION
- **Decision:** all five active Scheduled Tasks use condition-watch notification semantics.
- **Behavior:** idle/no-op clock ticks stay silent; meaningful production/OTK outcomes and substantive manager outcomes may notify the owner.
- **Examples of silent runs:** production wake false, manager attention false, occupied production lease, no-op/skip.
- **Reason:** browser notifications such as `MANAGER_IDLE` created noise even though the underlying scheduler checks were normal and necessary.
- **Non-change:** schedules, production cadence, one-worker lease and manager concurrency remain unchanged.

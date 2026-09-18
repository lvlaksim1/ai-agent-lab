# Worker Liveness / Heartbeat Contract

## Purpose

Heartbeat is the authoritative observability contract for the currently leased production/OTK execution.

It must let the manager answer, without reconstructing implementation details:

1. who is on shift;
2. when that execution was last observed alive;
3. what it is doing now;
4. whether it is waiting for an external result and which one;
5. the exact UTC instant after which its heartbeat is stale.

Heartbeat does NOT replace the production lease.

- lease = concurrency/safe ownership lock;
- heartbeat = liveness/observability signal.

A valid lease is never proof that the worker is alive.

## Authoritative location

`.agent/state.json -> heartbeat`

While `state.status=processing`, heartbeat is mandatory.

Canonical processing shape:

```json
{
  "heartbeat": {
    "schema_version": 1,
    "active": true,
    "role": "production | otk",
    "worker_id": "worker id or otk",
    "object_id": "active object id",
    "active_event": "queue event id",
    "sequence": 1,
    "last_seen_at": "UTC ISO-8601",
    "stale_at": "UTC ISO-8601",
    "activity_kind": "working | external_wait | persisting | closing | otk_review",
    "activity_detail": "short concrete description of the current activity",
    "external_wait": null
  }
}
```

When waiting for an external result, `external_wait` MUST be an object:

```json
{
  "active": true,
  "kind": "github_actions_run | workflow_job | artifact | other",
  "repository": "owner/repo",
  "run_id": 123,
  "worker_observed_status": "queued | in_progress | completed | unknown",
  "since_at": "UTC ISO-8601",
  "last_polled_at": "UTC ISO-8601"
}
```

Use the most specific durable external identifier available.

## Timing

Configuration lives in `.agent/config.json`.

Current policy:
- target heartbeat interval: 60 seconds;
- stale threshold: 180 seconds.

Every heartbeat sets:

`stale_at = last_seen_at + heartbeat_stale_after_seconds`

The manager does not estimate freshness from lease age.

Liveness classification is deterministic:
- `state.status=idle` -> **NO_WORKER**;
- processing and current UTC <= `heartbeat.stale_at` -> **LIVE**;
- processing and current UTC > `heartbeat.stale_at` -> **STALE**;
- processing with missing/invalid heartbeat -> **UNKNOWN/DEFECT**.

The exact `stale_at` stored in state is the deadline to report to the owner.

## Mandatory refresh points

A live production worker or OTK must refresh heartbeat:

1. immediately after claiming the lease;
2. after each substantive evidence/tool/action batch;
3. before entering a potentially long external wait;
4. after every poll of that external wait;
5. after the external wait becomes terminal and before consuming the result;
6. before/after a long persistence or verification phase when practical;
7. at least once per configured heartbeat interval while the Chat remains alive.

A heartbeat update is a minimal SHA/CAS update of `.agent/state.json`.

It MUST:
- increment `heartbeat.sequence`;
- refresh `last_seen_at` and `stale_at`;
- describe the current activity accurately;
- update/clear `external_wait` accurately.

It MUST NOT:
- change worker identity;
- change active_event;
- reset started_at;
- silently extend lease unless normal lease-renewal rules require it;
- claim an external result the worker has not actually observed.

## Idle transition

When the global production/OTK lease is released and state becomes idle:

- `heartbeat.active=false`;
- `heartbeat.role=null`;
- `heartbeat.worker_id=null`;
- `heartbeat.object_id=null`;
- `heartbeat.active_event=null`;
- `heartbeat.stale_at=null`;
- `heartbeat.activity_kind="idle"`;
- `heartbeat.activity_detail="No active production/OTK worker."`;
- `heartbeat.external_wait=null`.

`last_seen_at` and sequence may be retained for audit.

## Manager interpretation

The manager must report lease and heartbeat independently.

Examples:
- valid lease + LIVE heartbeat -> worker is alive;
- valid lease + STALE heartbeat -> lease is still held, but worker liveness is lost/suspect;
- expired lease + STALE heartbeat -> stale-worker recovery is eligible under runtime recovery rules;
- LIVE heartbeat + external_wait active -> worker is alive and intentionally waiting; report the exact target and last poll time.

Never tell the owner that a worker "is working" solely because `state.status=processing` or `lease_until` is in the future.

## Abrupt disappearance

If a worker disappears before it can close the shift:
- the last heartbeat remains as the factual last-seen record;
- checkpoint/journal state remains recovery evidence;
- heartbeat becomes STALE at the stored deadline;
- no invented `forced_stop` is created retroactively.

This makes abrupt runtime loss directly observable without requiring the worker to predict its own termination.

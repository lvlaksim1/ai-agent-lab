# Worker Liveness / Exact Time Contract

## Purpose

Heartbeat is the authoritative observability contract for the currently leased production/OTK execution.

It must let the manager answer unambiguously:
1. who is on shift;
2. when that execution was last observed alive;
3. what it is doing now;
4. whether it is waiting for an external result and which one;
5. the exact instant after which its heartbeat is stale.

Lease and heartbeat are separate:
- lease = ownership/concurrency lock;
- heartbeat = liveness/observability.

A valid lease is never proof that the worker is alive.

## Single time authority

All live runtime timestamps are repository-authoritative.

The ONLY permitted source for:
- `started_at`;
- heartbeat `last_seen_at`;
- heartbeat `stale_at`;
- lease claim/renewal anchor time;
- external-wait `since_at`;
- external-wait `last_polled_at`

is the GitHub `commit.committer.date` returned for a commit that updates:

`.agent/time-pulse.json`

Forbidden time sources:
- model/current-time inference;
- scheduler minute;
- local/system clock;
- manually typed UTC;
- derived chat timestamps;
- "now" from prose.

## Time-anchor protocol

Every live time update is two-phase.

### Phase A — create an authoritative pulse

1. SHA/CAS update `.agent/time-pulse.json`.
2. The pulse contains identity/purpose/activity but NO generated current timestamp.
3. Capture the returned commit SHA.
4. Fetch that exact commit from GitHub.
5. Read `commit.committer.date`.

That commit timestamp is the authoritative observation time.

### Phase B — project exact time into state

Update `.agent/state.json` and record:
- `time_source = "github_commit_committer_date"`;
- `time_anchor_commit = <exact pulse commit SHA>`;
- `last_seen_at = <exact GitHub commit.committer.date>`;
- `stale_at = last_seen_at + config.heartbeat_stale_after_seconds`.

For lease claim/renewal:
- `lease_anchor_commit = <exact pulse commit SHA>`;
- `lease_until = anchor_time + config.lease_minutes`.

For shift start:
- `started_at_anchor_commit = <lease-claim pulse commit SHA>`;
- `started_at = anchor_time`.

The worker MUST NOT calculate these from any other clock.

## Heartbeat shape

While `state.status=processing`, heartbeat is mandatory.

```json
{
  "heartbeat": {
    "schema_version": 2,
    "active": true,
    "role": "production",
    "worker_id": "fedorych",
    "object_id": "ios-research-runtime",
    "active_event": "event-id",
    "sequence": 3,
    "time_source": "github_commit_committer_date",
    "time_anchor_commit": "40-hex-sha",
    "time_anchor_path": ".agent/time-pulse.json",
    "last_seen_at": "2026-09-18T21:26:03Z",
    "stale_at": "2026-09-18T21:29:03Z",
    "activity_kind": "working",
    "activity_detail": "Concrete current activity.",
    "external_wait": null
  }
}
```

Legacy/backfill exception:
- an already completed historical worker action may be backfilled from its exact GitHub commit;
- then `time_anchor_path` is the exact file changed by that worker commit;
- `source = "backfill_from_authoritative_worker_commit"`;
- this MUST NOT be treated as a new heartbeat or resurrect the worker.

## External wait

When waiting for an external result, `external_wait` is mandatory and must identify the target.

Its times must also be GitHub-anchor derived.

```json
{
  "active": true,
  "kind": "github_actions_run",
  "repository": "owner/repo",
  "run_id": 123,
  "worker_observed_status": "in_progress",
  "since_at": "UTC from a time-pulse commit",
  "since_anchor_commit": "40-hex-sha",
  "last_polled_at": "UTC from latest polling time-pulse commit",
  "last_polled_anchor_commit": "40-hex-sha"
}
```

## Timing policy

Current policy:
- target heartbeat interval: 60 seconds;
- stale threshold: 180 seconds.

Deterministic classification:
- `state.status=idle` -> **NO_WORKER**;
- processing and current time <= exact `heartbeat.stale_at` -> **LIVE**;
- processing and current time > exact `heartbeat.stale_at` -> **STALE**;
- processing with missing/invalid/unverifiable time anchor -> **UNKNOWN/DEFECT**.

Manager reports the exact `last_seen_at`, `stale_at` and anchor commit.

## Activity kinds

Processing heartbeat uses one of:
- `starting` — lease claimed; the worker/OTK is materializing context and production has not yet crossed the start-report barrier;
- `working` — active reasoning/evidence/engineering work;
- `external_wait` — exact external evidence target is being actively polled;
- `persisting` — durable state/checkpoint transition is being written;
- `closing` — a valid natural boundary is being persisted;
- `otk_review` — independent OTK review is in progress.

Idle state uses `idle`.

`starting` is a first-class live state. A production worker in `starting` still may not mutate the target repository until the Reporting v2 start-report barrier passes.

## Mandatory refresh points

A live production worker or OTK must create a new time-pulse and refresh state:

1. on lease claim;
2. after each substantive evidence/tool/action batch;
3. immediately AFTER persisting an intermediate checkpoint;
4. before entering a potentially long external wait;
5. after every poll of that wait;
6. when the wait becomes terminal;
7. before/after a long persistence/verification phase when practical;
8. at least once per configured heartbeat interval while alive.

Important ordering rule:

**action/checkpoint first -> time-pulse second -> state heartbeat third**

This guarantees `last_seen_at` cannot be earlier than the substantive action it is meant to prove.

## Lease timing

Lease time uses the same authority.

Claim:
1. create time-pulse with purpose `lease_claim`;
2. fetch exact GitHub commit timestamp;
3. CAS state to processing with:
   - `started_at` = anchor timestamp;
   - `started_at_anchor_commit` = pulse commit;
   - `lease_until` = anchor + lease_minutes;
   - `lease_anchor_commit` = pulse commit;
   - initial heartbeat anchored to the same pulse.

Renewal:
1. create time-pulse with purpose `lease_renewal`;
2. fetch its exact timestamp;
3. CAS-update `lease_until` and `lease_anchor_commit`.
Heartbeat may use the same anchor if it accurately describes current activity.

## Idle transition

When state returns to idle:
- `heartbeat.active=false`;
- role/worker/object/event = null;
- `heartbeat.stale_at=null`;
- `heartbeat.activity_kind="idle"`;
- `heartbeat.external_wait=null`.

Last exact observation fields may be retained for audit.

## Manager interpretation

The manager must verify:
- `time_source`;
- `time_anchor_commit`;
- that `last_seen_at` equals the GitHub commit timestamp for that anchor;
- that `stale_at` is exactly threshold seconds later.

If these cannot be verified, liveness is UNKNOWN/DEFECT, not LIVE.

Never infer liveness from lease age.

## Abrupt disappearance

If a worker disappears:
- the last verified GitHub-anchored heartbeat remains factual;
- it becomes STALE exactly at stored `stale_at`;
- checkpoint/journal remains recovery evidence;
- no retroactive forced_stop is invented.

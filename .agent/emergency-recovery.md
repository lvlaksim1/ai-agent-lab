# Emergency Stale-Worker Recovery

## Purpose

A dead Scheduled Chat must not hold production for the full 45-minute lease.

Normal production clocks remain at :00/:12/:24/:36/:48 Moscow time. A separate recovery guard runs two minutes before each production clock at :10/:22/:34/:46/:58.

The guard NEVER ends a healthy shift merely because a clock is approaching. A LIVE worker keeps working across clocks exactly as before.

The guard acts only on a processing state whose exact GitHub-anchored heartbeat is already STALE.

## Core rule

At a recovery guard invocation:

- state idle -> NO-OP;
- state processing + verified LIVE heartbeat -> NO-OP;
- state processing + UNKNOWN/DEFECT heartbeat -> do not preempt; raise manager attention for control-plane defect;
- state processing + verified STALE heartbeat -> emergency-close the dead execution, fence it, enqueue OTK review, release the global lease, keep production work pending.

The 45-minute lease remains the normal ownership lock for live workers. A verified stale heartbeat may bypass it only through this recovery-guard procedure.

## Exact recovery time

Recovery must use the authoritative time protocol in `.agent/liveness.md`.

1. Re-read state and capture its SHA and current `fence_generation`.
2. Update `.agent/time-pulse.json` with purpose=`stale_recovery_probe`, current event/worker/fence identity, and NO generated timestamp.
3. Fetch that exact pulse commit.
4. Use only its GitHub `commit.committer.date` as `recovery_observed_at_utc`.
5. Re-read state again before mutation.
6. If state SHA/worker/event/fence/heartbeat sequence changed, restart classification from the new state; never preempt a worker that refreshed while the guard was probing.
7. STALE is true only when `recovery_observed_at_utc > heartbeat.stale_at`.

## Emergency closure is not forced_stop

A stale-heartbeat recovery is an externally imposed `runtime_loss` closure.

It is NOT:
- a worker-declared forced_stop;
- a planned handoff;
- evidence that the platform exposed a termination code;
- a worker efficiency defect by itself.

The factual worker end time is the last exact verified heartbeat:

`shift_completed_at_utc = heartbeat.last_seen_at`

The administrative recovery time is stored separately as:

`recovery_closed_at_utc = recovery_observed_at_utc`

Never inflate worker lifetime to the recovery-guard time.

## Fencing against zombie executions

`.agent/state.json -> fence_generation` is a monotonic execution fence.

- every production/OTK claim increments it before materializing the new execution;
- emergency stale recovery increments it when closing the dead execution;
- the live worker records the claimed generation;
- before every target-repository write, queue mutation, lease renewal, heartbeat refresh, checkpoint, or closure write, the worker MUST re-read state and verify that the same event/worker/fence is still current;
- mismatch means the execution has been fenced and MUST stop without writing.

This protects against an execution that appears dead, gets recovered, and later resumes after a long blocking tool call.

## Recovery review event

For an interrupted production shift, ensure exactly one pending supervisor-review event with a **shift-unique** id:

`.agent/queue/pending/review-shift-<shift-number>-<event>.json`

Never reuse `review-<event>` across multiple worker attempts of the same continuation. The production event id may remain the same across runtime-loss recoveries, but the brigade shift number is unique.

The emergency review uses `shift_policy_version: 4`, carries `shift_number`, and for reporting policy v2 also carries the exact immutable worker `start_report_path` / `start_report_commit` when they exist. If the worker died before publishing the required start report, preserve that absence; OTK must not fabricate it.

The review contains:

```json
{
  "stop": {
    "kind": "runtime_loss",
    "actionable_next_step": true,
    "reason": "Verified heartbeat became stale before the recovery guard.",
    "runtime_loss_evidence": {
      "worker_last_seen_at_utc": "...",
      "heartbeat_stale_at_utc": "...",
      "heartbeat_anchor_commit": "...",
      "recovery_observed_at_utc": "...",
      "recovery_anchor_commit": "...",
      "fenced_generation": 7,
      "activity_kind": "...",
      "activity_detail": "..."
    }
  }
}
```

The original production event/continuation remains pending. OTK has precedence at the next normal production clock and may correct the continuation from the journal/checkpoint before rotating to the next worker.

## State after emergency closure

Persist state as idle and:
- clear active worker/event/start/lease fields;
- retain the last heartbeat as inactive audit evidence;
- increment `fence_generation`;
- set `last_event` to the lost production event;
- set `last_result="RUNTIME_LOSS_PENDING_REVIEW"`;
- set `last_completed_at` to the worker's exact `heartbeat.last_seen_at`;
- persist `last_runtime_loss` with the exact evidence above.

Keep `.agent/wake.json.pending=true`.

The recovery guard MUST NOT perform OTK and MUST NOT start the next worker. The next normal production clock does that.

## Next normal clock

The next :00/:12/:24/:36/:48 dispatcher sees idle + wake pending.

Relay behavior:
1. OTK reviews the `runtime_loss` shift first.
2. OTK scores only evidenced engineering work. Runtime loss itself carries no automatic efficiency penalty and is not a voluntary premature handoff.
3. OTK advances brigade rotation.
4. In the same relay run, if production remains allowed, the next brigade worker may claim the pending continuation and work normally.

Thus a dead worker costs at most the remainder of the current 12-minute clock interval, not a 45-minute lease wait.


## OTK runtime loss

The same guard also protects the global lease while OTK is active.

If a verified stale heartbeat belongs to role=`otk`:
- fence and close the stale OTK execution;
- return global state to idle;
- keep the existing pending supervisor-review event unchanged;
- do NOT create a review-of-a-review;
- set `last_result="OTK_RUNTIME_LOSS_RETRY"`;
- keep production wake pending.

At the next normal production clock, OTK retries that same pending review. Only after OTK completes may the relay start the next brigade worker.

## Physical scheduler budget

This recovery guard does not consume a ChatGPT Scheduled Task slot.

The five existing Scheduled Chat production clocks remain the only five active planner tasks. No sixth ChatGPT Scheduled Task is created.

Recovery is implemented by a GitHub Actions watchdog triggered by authoritative `.agent/state.json` pushes. While a worker/OTK is processing, that watchdog remains armed and sleeps until :10/:22/:34/:46/:58 — exactly two minutes before the next normal production clock. A newer heartbeat state push cancels/replaces the older watchdog run. If no newer heartbeat arrives, the last watchdog reaches the guard boundary and performs the exact stale-heartbeat check.

If a watchdog starts and finds the heartbeat already stale (for example during deployment/recovery), it performs recovery immediately instead of waiting for another clock boundary.

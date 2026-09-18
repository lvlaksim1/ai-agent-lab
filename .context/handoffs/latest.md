# Latest Interactive Handoff

AI Agent Lab now has:
- immutable Scheduled Chat clock;
- GitHub durable orchestration;
- 8 rotating workers;
- independent OTK;
- persistent «Начальник участка»;
- object transfer;
- single-worker relay production;
- Telegram reporting;
- Project Context Capsule v1.0.

Most recent changes:
- standard PCC installed from owner-provided installer archive;
- `.context/` is interactive project/chat memory;
- `.agent/` stays authoritative live runtime;
- reporting uses Moscow times + predecessor/plan/result/next;
- OTK score/rating outside narrative;
- immutable published reports prevent stale resend.

At installation production was idle and wake false; active object was iOS-Research-Runtime. Always re-read live `.agent/` later.

Do not reintroduce Work, mutable scheduler orchestration, worker+worker parallelism, Telegram-on-`latest.md`, or a second competing memory system.

Fresh-chat bootstrap is now empirically proven: a truly empty Chat invoked only with the canonical manager phrase restored manager/runtime context correctly. Remaining validation: persist one meaningful decision back to Capsule from an independently bootstrapped manager Chat.


## Default-branch discovery

The default `main` branch now contains discovery shims:
- `AI_CONTEXT.md`
- `AGENTS.md`
- `.context/ENTRYPOINT.md`

They redirect a fresh Chat into the authoritative `work-webhook-test` Capsule. No external repository is required.

- Idle scheduler notifications are suppressed via condition-watch semantics; the clocks still run on the same cadence.


## Production continuity incident

The shop was found idle after shift 21 because OTK completed before asynchronous CI and cleared the queue. The later gate success/E2E failure did not create a new central event. Event 024 now resumes from the fresh failure evidence.

New invariant: if required external evidence is still pending, OTK must leave a same-object continuation; waiting preflight must not consume a worker turn.

The condition-watch scheduler experiment was reverted. Production and manager clocks are back on exact schedules; do not trade clock reliability for UI-notification silence.


## Scheduler re-anchor

A second continuity issue was observed: changing timing mode back to exact did not by itself produce the expected next tick. The five active tasks were explicitly re-anchored to future Moscow DTSTART values while preserving the factory cadence.

At the repair point event 024 was still pending, wake=true, state idle. First expected production recovery tick: 14:32 MSK. Verify it before declaring the clock healthy.


## Telegram publication race fixed

Shift #22 proved that production and OTK were working after the schedule re-anchor, but the Telegram send step was skipped.

Exact cause: the workflow triggered from the immutable-report commit but checked out the moving branch head. Later OTK commits advanced the branch before checkout, so `git diff-tree HEAD` inspected the wrong commit and found no newly added report.

The workflow now checks out the triggering `github.sha`, resolves reports from that commit, and supports explicit redelivery requests. A redelivery of shift #22 completed successfully.

Next proof required: one natural report must publish and deliver with no recovery request.


## Worker shift duration policy

Do not cap production shifts at 10, 12 or 15 minutes.

The four production clock slots are wake/start opportunities only. Once a worker owns the production lease, he continues until a natural stop condition. The lease is renewable and is not a shift timer. Another clock must not start a second worker while the lease remains active.

A worker should wait for and consume near-term CI/test evidence in the same live Chat instead of handing off immediately after one push.


## Variant C-5 scheduler experiment

The five existing tasks are now generic exact-schedule clocks at :00/:12/:24/:36/:48 MSK.

They dispatch MANAGER / PRODUCTION RELAY / IDLE from GitHub state. A running worker remains in charge across later ticks; manager may run concurrently; a second worker may not.

Rollback to Variant A is explicitly documented in .agent/scheduler-rollback-variant-a.md and does not require reverting queue, ratings or target-repository history.


## Variant C-5 first live result

The first :24 generic tick worked: it accepted shift #24 through OTK and then claimed the next event for Петрович in the same production relay. Core dispatcher routing is therefore empirically proven once.

Still verify occupied-worker behavior on subsequent ticks and manager+worker concurrency before declaring the topology fully proven.


## Pending CI is no longer a shift boundary

Shift #25 exposed that the old continuation model still ended workers immediately after starting CI. This is now corrected.

A live worker must keep the shift during observable mandatory CI, renew lease if needed, wait for terminal evidence, consume it and continue. `wait_for` exists only as crash/forced-stop recovery. OTK penalizes voluntary pending-CI handoff with Efficiency/focus 0/2 and cannot approve that behavior.


## Fresh-chat manager bootstrap validated

The canonical invocation was tested in a truly empty Chat and worked end-to-end. The new Chat discovered the repository context, redirected to `work-webhook-test`, restored the persistent manager persona and current live state, and produced the correct owner escalation with a ready-to-send recommended answer. No prior-chat recap was requested.

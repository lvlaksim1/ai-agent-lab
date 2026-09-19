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


## Owner authorized APFS evidence channel

The previous owner-decision block is resolved. The owner explicitly authorized a diagnostic APFS evidence channel and production resume.

Live runtime now has:
- DEC-011 AUTHORIZE_APFS_EVIDENCE_AND_RESUME;
- DIR-011 APFS EVIDENCE FIRST;
- pending event `ios-runtime-release-20260918-031`;
- production wake=true, generation 41;
- management owner_decision_required=false;
- object health YELLOW.

Next production work must instrument Windows E2E to persist compact original-vs-rebuilt NX/APFS/checkpoint structural evidence, identify the first causally incompatible metadata field, and only then make a minimal evidence-supported writer change. Do not weaken proof gates or guess APFS semantics.

The fresh-chat Context Capsule validation is now complete end-to-end, including dynamic write-back from the independently bootstrapped manager Chat.

## Stale-worker emergency recovery v4 — 2026-09-19

Owner changed recovery policy after repeated 2–3 minute worker disappearances made the 45-minute lease waste most production time.

New invariant:
- a healthy worker is NEVER ended merely because the next production clock is approaching;
- live workers continue across :00/:12/:24/:36/:48 clocks exactly as before;
- a verified STALE heartbeat may now bypass an otherwise valid lease through the dedicated recovery guard;
- recovery guard boundaries are :10/:22/:34/:46/:58, two minutes before the next normal production clock;
- the guard is a GitHub Actions watchdog triggered by authoritative state pushes, not a sixth ChatGPT Scheduled Task;
- the five ChatGPT production clocks remain the only five active planner tasks;
- runtime loss is a new v4 stop kind distinct from worker-declared forced_stop and carries no automatic efficiency penalty;
- the factual worker end time is the last exact heartbeat; the later administrative recovery time is stored separately;
- stale recovery increments state.fence_generation so any late zombie execution must stop before further writes;
- OTK is reviewed/retried separately; production runtime loss enqueues exactly one OTK review and leaves the continuation pending.

Live proof during deployment:
- Кузьмич shift 31 heartbeat last_seen = 22:18:04Z, stale_at = 22:21:04Z;
- the newly armed watchdog detected that stale execution, created exact recovery pulse c75428de4070feca9465d82e551038b2e718cc3c at 22:24:57Z and fenced/released it in commit 58f8da770311e72efeb0e9ace29487430629d89c;
- state moved to idle with RUNTIME_LOSS_PENDING_REVIEW and fence_generation=5;
- the recovery workflow completed SUCCESS;
- final runtime validator after policy correction completed SUCCESS.

The first deployment recovery happened after the intended :22 guard because the watchdog itself was armed after that guard had already passed. Future workers arm the watchdog from their state/heartbeat pushes, so it is already waiting before the next guard boundary.

## Reporting policy v2 — worker report at shift start

Owner changed brigade reporting because Scheduled Chat workers often disappear before natural shift closure.

New reporting contract:
- worker no longer depends on surviving to write an end-of-shift narrative;
- immediately after claim/materialization and before substantive target work, worker creates one immutable start report under `.agent/reports/starts/`;
- worker start report contains exactly the core narrative sections `ОЦЕНКА ПРЕДШЕСТВЕННИКА` and `МОЙ ПЛАН`; plan includes the success criterion;
- start report is first-person worker voice and is never rewritten with hindsight;
- OTK later reconstructs the actual shift independently from start report + journal/checkpoints + heartbeat + target diff + CI/artifacts;
- OTK result is supervisor voice, not worker impersonation, and is published immutably under `.agent/reports/otk/`;
- Telegram now delivers both immutable worker-start and OTK-result reports; legacy `.agent/reports/published/` remains supported;
- scoring v2 is 4 progress + 3 engineering quality + 2 efficiency/focus while alive + 1 start assessment/plan quality;
- runtime loss itself is not an efficiency penalty; missing a required v2 start report scores 0/1 in the planning category;
- legacy score/report policy v1 remains grandfathered for already-started shifts.

Repeated runtime-loss attempts exposed an independent review-id collision: production event 032 was reused by Федорыч then Кузьмич, so legacy `review-<production-event>` collided with an immutable completed OTK record. OTK detected it and rolled back its partial score mutations.

This is now fixed:
- every new review id is shift-unique: `review-shift-<shift-number>-<production-event>`;
- recovery guard uses the same unique scheme;
- current Кузьмич shift 31 pending review was migrated to `review-shift-31-ios-runtime-release-20260918-032` and explicitly grandfathered to report/score policy v1;
- new continuations must carry exact predecessor review/OTK-report paths for the next worker's start assessment;
- validator enforces reporting/scoring policy v2, unique review ids, new Telegram paths and report schemas;
- stale recovery can deterministically rediscover the immutable start report and its creation commit if the worker dies in the narrow gap between publishing that file and linking it into state.

Final Runtime Check and stale-worker recovery workflow after the policy migration are green.


## P0 control-plane stabilization — 2026-09-19

The audit-driven P0 is complete and live in `work-webhook-test` at commit `3acdc72905d024d525ff63bdc1fbe0f09d425217`.

Key consequence: do not weaken or bypass Runtime Check. It is now split correctly: new/live artifacts are strict, immutable historical report drift is audited separately. New worker start reports must pass the literal Reporting v2 contract and the exact report commit's Runtime Check before any substantive target-repository mutation.

Next engineering priority is P1 transition/replay hardening, not new factory features.

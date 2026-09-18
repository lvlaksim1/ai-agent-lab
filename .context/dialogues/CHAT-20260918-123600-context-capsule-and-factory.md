# CHAT-20260918-123600-context-capsule-and-factory

- **Date:** 2026-09-18
- **Topic:** manager continuity, universal project memory, shop optimization and reporting.
- **Type:** bootstrap/import
- **Status:** completed installation session.
- **Source quality:** semantic record, not raw transcript.

## User goals and outcomes

- Scheduled roles renamed into human shop terms.
- Persistent manager identity tied to GitHub bootstrap.
- Universal self-contained Project Context Capsule installer created for any repository.
- Owner confirmed that archive as the standard Capsule.
- Shop expanded to 8 logical workers.
- Limited Scheduled Task capacity optimized via :02/:17/:32/:47 production relay + :59 manager.
- Owner rejected worker+worker parallelism; only worker+manager allowed.
- Reporting changed to Moscow shift times and explicit predecessor/plan/result/next sections, with more humor.
- OTK score/rating moved outside report prose.
- Historical report replay diagnosed: old `latest.md` edit triggered Telegram.
- Fix: immutable published reports; `latest.md` no longer a publication trigger.
- Standard PCC was installed into AI Agent Lab itself.
- Default branch `main` now contains `AI_CONTEXT.md`, `AGENTS.md` and a `.context/ENTRYPOINT.md` redirect so a blank Chat given only the repository URL can discover the authoritative Capsule in `work-webhook-test`.
- Manager bootstrap was integrated with PCC so substantial manager conversations must also update `.context/dialogues/` and related semantic state.

## Open validation

- fresh empty Chat bootstrap;
- dynamic write-back from that Chat;
- first natural immutable report delivery;
- eventual cross-repo forwarding E2E.


### Quiet Scheduled Task notifications

Owner reported browser notifications from normal idle Scheduled Task runs such as `MANAGER_IDLE`.

Decision implemented:
- all five active shop tasks switched from exact-schedule notification behavior to condition-watch semantics while keeping the same recurring schedules;
- manager idle (`attention=false`) is silent;
- worker idle (`pending=false`), occupied-lease skips and other no-op runs are silent;
- notifications are reserved for meaningful worker/OTK results, blockers/failures requiring attention, or substantive manager outcomes/escalations.

This changes notification behavior only, not production cadence or scheduler execution.


### Production stall discovered and recovered

Owner noticed worker reports had stopped. Live inspection showed the brigade was genuinely idle: the active-object queue was empty, wake=false, and the last accepted shift was #21.

Root cause:
- OTK accepted shift 21 while the mandatory qemu-sptm Windows Gate was still running;
- OTK cleared the queue because no continuation remained;
- the gate later PASSED and exact Windows End-to-End Boot then FAILED after emitting SPTM_MAP but showing no XNU/launchd/root-shell progress for 5 minutes;
- no new central event was created from that asynchronous CI completion, so the shop sat idle.

Recovery:
- created production event `ios-runtime-release-20260918-024` using the completed E2E failure evidence;
- wake generation advanced and production was re-armed;
- added a queue-continuity guard: OTK must not leave the active queue empty while mandatory external evidence is still pending;
- added a non-scored `wait_for` preflight so waiting for CI does not consume a brigade turn.

Scheduler correction:
- switching the five shop clocks to `condition_watch` made their execution timing approximate and unsuitable as the factory clock;
- all five tasks were returned to `exact_schedule`;
- production reliability takes precedence over suppressing idle UI notifications. Notification suppression must be solved separately from timing mode.


### Exact-schedule re-anchor incident

Owner again reported no worker reports. Live inspection at 14:18 MSK showed event 024 still pending, production state idle, wake=true, and no shift after #21. The active Scheduled Tasks were enabled, but their `last_run_time` values had not advanced through the expected 14:17 production tick after the earlier timing-mode change.

The prior repair had changed `timing_mode` back to `exact_schedule` while leaving old DTSTART anchors in place. That was not sufficient to restore observed firing.

Corrective action:
- explicitly re-anchored all five recurring schedules with future Moscow DTSTART values while preserving the intended minutes;
- production: 14:32, 14:47, 15:02, 15:17 then hourly;
- manager: 14:59 then hourly;
- kept exact-schedule mode and kept browser notifications disabled;
- event 024 remains pending with wake=true, so the 14:32 tick should be the first recovery production start.

Do not claim the scheduler repair is proven until a post-reanchor `last_run_time` and corresponding GitHub production state change are observed.


### Telegram delivery race — root cause confirmed

Owner still saw no reports after scheduler recovery.

Deep inspection showed that workers were in fact running again:
- shift #22 executed;
- OTK independently accepted it;
- immutable report `.agent/reports/published/review-ios-runtime-release-20260918-024.md` was created.

The Telegram workflow itself ran and returned overall SUCCESS, but the actual send step was SKIPPED.

Exact race:
- publication commit triggered the workflow;
- checkout used `ref: work-webhook-test`;
- subsequent OTK commits advanced that branch before runner checkout;
- checkout landed on a later `latest.md` commit;
- `git diff-tree HEAD` found no newly added immutable report;
- workflow set `publish=false` and skipped Telegram.

Correction:
- checkout is now bound to `${{ github.sha }}`;
- report selection uses the exact triggering commit;
- explicit `.agent/reports/redelivery/*.request` recovery path added;
- shift #22 redelivery completed and Telegram API success was confirmed in Actions logs;
- validator protects the trigger-SHA invariant.

This incident is separate from the earlier scheduler timing problem, although both appeared after the request to silence technical notifications.


### Shift duration policy revised

Owner rejected pre-set 10–12 minute budgets and any assumption that the 15-minute clock interval is a shift length.

Decision:
- workers continue while they can make useful evidence-driven progress;
- no artificial shift time cap;
- scheduled clock is only a chance to start a worker when the station is free;
- active worker may run across later clock slots;
- lease is renewable and only protects against stale/dead workers;
- near-term CI/test results should be awaited and consumed in the same run;
- premature handoff with actionable work remaining is scored as an efficiency defect.


### Generic dispatcher Variant C-5

Owner chose to experimentally implement the more frequent-clock idea while keeping the same number of active Scheduled Tasks and preserving single-worker production.

Platform constraint: one physical task cannot recur more frequently than hourly. Therefore five existing tasks are staggered evenly at :00/:12/:24/:36/:48, giving nominal 12-minute polling latency.

All five physical tasks now use the same generic dispatcher prompt. They are clocks, not characters. Runtime role is selected from GitHub state:
- active worker + manager attention -> manager may run concurrently;
- active worker + no manager attention -> no-op;
- idle + manager attention -> manager;
- idle + production pending -> production relay;
- idle/no work -> no-op.

Variant A is preserved for rollback.


### Short-shift root cause fixed

Owner asked for investigation without speculative timing limits. Shift #25 was the decisive case: 15:24:00–15:27:14 MSK. The worker made a valid minimal repair, started replacement CI, then treated running CI as the end of the work package.

Diagnosis:
- scheduler C-5 was functioning;
- worker workflow still retained old `CI -> continuation(wait_for) -> handoff` choreography;
- "cannot reasonably obtain evidence" was too vague;
- OTK still rewarded that handoff with full efficiency.

Implemented control-plane fix:
- mandatory external verification is active work inside the same shift;
- worker polls it to terminal while the current Chat/tools remain alive;
- mandatory verification must be terminal and consumed before a bounded work package can be considered complete;
- `wait_for` is emergency recovery only;
- OTK assigns Efficiency/focus 0/2 and a non-APPROVED correction path for unjustified pending-CI handoff;
- validator protects the new invariants.

No scheduler timing changes were made.

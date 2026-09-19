# Current State

Updated during PCC installation on 2026-09-18.

AI Agent Lab has an operational GitHub-backed autonomous runtime with immutable Scheduled Chat wake, rotating brigade, independent OTK, persistent manager, object transfers, relay production topology, Telegram reporting and now Project Context Capsule.

For fast-changing live values, read `.agent/state.json`, `.agent/wake.json`, `.agent/management/state.json` and `.agent/assignment.json`.

At installation time:
- active object: `ios-research-runtime`;
- production: idle;
- wake: false;
- manager attention: false;
- scored shifts: 21;
- next worker: Федорыч.

Recent control-plane changes:
- production clocks :02/:17/:32/:47; manager :59;
- one-worker concurrency retained;
- worker+manager concurrency allowed;
- reports use Moscow times and predecessor/plan/result/next sections;
- OTK score/rating are outside narrative;
- Telegram publication is immutable append-only;
- standard Project Context Capsule installed.

- browser notifications for the five shop tasks are disabled; the tasks themselves are exact-schedule.


## Recovery note — 2026-09-18

A real continuity defect was found: OTK could finish while mandatory CI was still running and leave no continuation, causing the brigade to idle after CI later completed. Event 024 was queued to resume iOS work from the completed E2E failure. OTK/workflow now include a queue-continuity guard and non-scored external-evidence preflight.

The temporary condition-watch scheduler experiment was reverted; all five shop clocks are again exact-schedule because timing reliability is part of production correctness.


## Explicit schedule re-anchor — 2026-09-18 14:18 MSK

After reverting timing mode, production still did not fire: event 024 remained pending and the expected :17 tick was not reflected in Scheduled Task `last_run_time`.

All five active tasks were therefore re-anchored with explicit future DTSTART values while preserving :02/:17/:32/:47 production and :59 manager cadence. First expected recovery production tick: 14:32 MSK. This remains OPEN until empirically observed.


## Telegram delivery incident — 2026-09-18 14:42 MSK

The production clock was recovered successfully: shift #22 ran after the scheduler re-anchor, and OTK completed it. The apparent absence of reports had a second, independent cause in the Telegram workflow.

Root cause:
- an immutable report was correctly created;
- the Actions workflow triggered on that commit;
- but checkout used the moving branch `work-webhook-test` instead of the triggering commit SHA;
- OTK made later commits before the Actions runner checked out the branch;
- the job therefore inspected a newer commit, concluded that no report had been added, and skipped the Telegram send step.

Fix:
- Telegram workflow now checks out `${{ github.sha }}`;
- report discovery is bound to that exact event commit;
- explicit immutable redelivery requests are supported;
- runtime validator now checks this invariant.

Shift #22 was redelivered after the fix and GitHub Actions confirmed successful Telegram delivery.


## Natural-boundary shift policy — 2026-09-18

Owner rejected artificial shift budgets shorter than the 15-minute clock interval.

New rule:
- Scheduled clock cadence is only an opportunity to start work;
- it is not a shift-duration limit;
- a worker continues as long as useful evidence-driven work is possible;
- CI/build/test should be awaited and consumed in the same live Chat when reasonably possible;
- production lease is renewable and acts only as a stale-worker lock;
- the next clock exits if a worker is still active;
- premature handoff while actionable work remains is an efficiency defect.


## Generic dispatcher experiment — Variant C-5

Owner approved an experiment using the same five active Scheduled Tasks as generic clocks.

New exact-schedule slots: :00, :12, :24, :36, :48 MSK.

Each clock first dispatches from GitHub state to MANAGER, PRODUCTION RELAY or IDLE. This reduces nominal handoff polling latency from 15 to 12 minutes without increasing active task count.

Worker+worker remains forbidden. Worker+manager remains allowed.

Variant A (:02/:17/:32/:47 production + :59 manager) is preserved as an explicit rollback plan.


## First Variant C-5 empirical proof

The first generic :24 clock successfully dispatched from GitHub state:
- it claimed and completed OTK for shift #24;
- published the immutable human report;
- then, in the same production-relay run, claimed the next production event for Петрович;
- no second worker was created.

This proves the core `clock -> dispatcher -> OTK -> next worker` path is functioning.

The remaining experiment is to observe later generic ticks while Петрович is still active and confirm they do not replace him; if management attention appears, a generic tick may instead run the manager concurrently.


## Active evidence wait — 2026-09-18

Fresh shift #25 proved the remaining short-shift defect was not scheduler-related. The worker fixed one patch conflict, started replacement CI, then handed off after 3m14s while mandatory CI was still running.

Root cause: the runtime still treated pending external evidence as a normal continuation boundary through the old `wait_for` handoff model.

Policy corrected:
- mandatory CI/build/test started by a worker stays inside that same shift while the live Chat/tools can observe it;
- worker keeps/renews the lease, polls exact evidence to terminal state, consumes the result and continues;
- pending CI is never by itself a natural stop condition;
- `wait_for` is recovery-only for forced runtime/tool termination;
- unjustified pending-CI handoff gets Efficiency/focus 0/2 and cannot receive APPROVED solely on that handoff.

Runtime validator passed on the control-plane commit.


## Shift closure policy v2 — 2026-09-18

Owner approved replacing micro-handoff behavior with a causal-chain natural-boundary policy.

New invariant:
- a queued event is an entry point, not an automatic shift boundary;
- discovering the next directly actionable blocker keeps the SAME worker on shift;
- before handoff the worker must prove `actionable_next_step=false`;
- BLOCKED requires an evidence-acquisition ladder, exhaustion evidence and a precise external action;
- short shifts are not forbidden, but short unresolved shifts trigger mandatory OTK closure review;
- any premature handoff gets Efficiency/focus 0/2 and cannot be APPROVED.

The policy is enforced by `.agent/evidence-acquisition.md`, workflow/supervision/competition rules, config invariants and runtime validation.


## Manager owner-escalation UX — 2026-09-18

Owner requires every future production blocker that needs owner input to be actionable.

When `owner_decision_required=true`, the manager must explicitly state:
- what stopped production;
- exactly what the owner must do/allow/choose;
- why it is needed and what it unlocks;
- ready-to-send response options when alternatives exist;
- a recommended safe option when appropriate.

A bare «нужно решение владельца» is not acceptable. Runtime validation enforces the required sections in the latest manager report while an owner decision is pending.


## Fresh-chat manager bootstrap proof — 2026-09-18

A truly empty Chat was started with only the canonical invocation:

`вызываю начальника участка https://github.com/lvlaksim1/ai-agent-lab`

The new Chat independently discovered the default-branch shims, followed the Capsule bootstrap into `work-webhook-test`, materialized the persistent manager identity and restored live runtime state without asking the owner to restate prior context.

Observed first response correctly reported:
- active object: `lvlaksim1/iOS-Research-Runtime`;
- phase: `boot-debugging`;
- health: `BLOCKED`;
- production intentionally idle, no active worker;
- next worker: Иваныч;
- exact APFS evidence blocker;
- owner decision required;
- ready-to-send recommended response to authorize the diagnostic APFS evidence channel and resume production.

This closes the fresh-chat manager bootstrap proof. The manager continuity/discovery path is empirically validated end-to-end.


## APFS evidence authorization — 2026-09-18

The owner authorized adding a diagnostic APFS evidence channel to the iOS-Research-Runtime Windows E2E and resuming production.

Runtime consequence:
- management decision DEC-011 recorded;
- directive DIR-011 applies from NEXT_SHIFT;
- owner_decision_required cleared;
- event ios-runtime-release-20260918-031 queued;
- production wake generation advanced to 41;
- object health moved from BLOCKED to YELLOW;
- Scheduled Tasks were not mutated.

The next worker must first obtain compact source-vs-rebuilt NX/APFS/checkpoint structural evidence, identify the first causally incompatible field, and only then make an evidence-supported writer correction.

This independently bootstrapped manager Chat also completed the remaining dynamic write-back proof for Project Context Capsule continuity.


## Objective forced-stop policy v3 — 2026-09-18

Owner rejected predictive `forced_stop` after shift 29 ended while ordinary GitHub/tool operations were still succeeding.

New invariant:
- `forced_stop` requires an objective, independently reviewable platform/runtime/tool termination signal;
- elapsed time, pending CI, scheduled/non-interactive execution, or belief that the turn may end soon are not sufficient;
- while normal tool/GitHub calls still work, the worker must continue polling/acting;
- before long waits, persist an intermediate checkpoint without ending the shift or releasing the lease;
- abrupt termination with no chance to persist a normal end is recovered through checkpoint + stale lease;
- v3 forced-stop review records require structured `forced_stop_evidence`;
- OTK gives Efficiency/focus 0/2 and forbids APPROVED for an unproven predictive forced-stop handoff.

Shift 29 / event 031 remains historical evidence of the old v2 behavior; its pending OTK review is explicitly marked for audit under the new forced-stop standard.


## Worker liveness heartbeat — 2026-09-18

Manager requested a first-class liveness contract after shift 30 (Федорыч) disappeared abruptly while the production lease remained valid.

Implemented:
- `.agent/state.json -> heartbeat` is now the authoritative worker/OTK liveness snapshot;
- it exposes worker/role/object/event, last_seen_at, exact stale_at, current activity, and any external wait with exact target/status/last poll;
- heartbeat target interval = 60s, stale threshold = 180s;
- lease and heartbeat are explicitly separate: lease is ownership/concurrency, heartbeat is liveness;
- manager must classify NO_WORKER / LIVE / STALE / UNKNOWN and must not call a worker alive merely because its lease is valid;
- workers/OTK refresh heartbeat on claim, substantive action batches, before/after external waits, every external poll, and at least once per interval while alive;
- abrupt runtime disappearance leaves the last real heartbeat to age into STALE; no retroactive forced_stop is invented;
- current Федорыч state was migrated from his last real checkpoint at 20:28:23Z, with stale_at 20:31:23Z, so the programmer change does not falsely resurrect him.

This is observability only: STALE heartbeat by itself does not bypass an otherwise valid production lease; safe lease recovery remains a separate control-plane decision.


## Authoritative runtime time v2 — 2026-09-19

Owner required all runtime times to be exact and unambiguous after shift 30 showed a 73-second mismatch between worker-generated heartbeat time and GitHub commit time.

New invariant:
- live runtime timestamps must never come from model/local/system/scheduler time;
- the only authority is GitHub `commit.committer.date` of an explicit `.agent/time-pulse.json` commit;
- runtime uses pulse -> fetch exact commit -> project timestamp into state;
- heartbeat last_seen_at/stale_at, shift started_at, lease claim/renewal and external-wait timing all use this source;
- validator fetches full git history and verifies heartbeat/shift/lease anchors against exact commit timestamps;
- heartbeat update ordering is action/checkpoint -> pulse -> state, preventing last_seen_at from preceding the action it proves.

Historical shift 30 was corrected without resurrecting Федорыч:
- exact shift claim anchor: 960067fe5243588fea275262b6eeec53ecca0ce8 at 20:26:30Z;
- exact recovery lease anchor: 918275b33960c5d1794fd4c8f1f3029afbe8783b at 21:24:00Z, giving lease_until 22:09:00Z;
- exact last worker action anchor: c54d6f4dd4c1afe5a8fcbaaeb69935e0cd6ca7de at 21:26:03Z, giving stale_at 21:29:03Z.

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

An architectural audit found that Agent Runtime Check mixed current policy enforcement with retroactive validation of immutable historical reports. It also exposed a real current defect: shifts 57 and 58 used Markdown heading-style start reports instead of the literal Reporting v2 field contract.

P0 stabilization was implemented in authoritative runtime commit `3acdc72905d024d525ff63bdc1fbe0f09d425217`:
- new machine report contract and deterministic render helpers in `tools/agent-report-contract.mjs`;
- contract tests in `tests/agent-report-contract.test.mjs`;
- live validator now checks newly added reports and the active production start report, not the entire immutable archive on every heartbeat;
- separate non-retroactive `Agent History Audit` reports historical shape drift without rewriting history;
- current state/event/done JSON schemas were synchronized with the actual runtime shape;
- worker workflow now has a mandatory start-report contract/CI barrier before substantive target-repository work;
- immutable legacy reports remain unchanged.

Both `Agent Runtime Check` and `Agent History Audit` passed on the authoritative P0 commit.


## P1 deterministic transitions and replay hardening — 2026-09-19

P1 moved deterministic control-plane bookkeeping out of free-form Chat choreography and into replayable transition planning.

Production commits:
- `6ec4d28cafa374a34d738cbbcabdb59455431f20` — shared non-force CAS commit primitive, pure runtime transition reducer, snapshot-consistent intake, stale-recovery reducer, replay CI and narrowed live Runtime Check scope;
- `1ba0e4d46a1c03705acb0e92e6904671c31f857b` — atomic OTK-finalize policy v1 and Git-history enforcement;
- `ebd8e97930f56b7c6ad94c79c10f0a2741b7f960` — live heartbeat contract correction for legitimate `starting` and `blocked_control_plane` phases.

Key invariants:
- transition inputs are read from one immutable parent SHA;
- related non-time-anchor bookkeeping is planned deterministically and committed as one non-force CAS Git tree transition;
- authoritative `.agent/time-pulse.json` remains intentionally separate because its GitHub commit timestamp is evidence;
- stale recovery uses the reducer and execution identity/fence checks;
- new OTK reviews carry `otk_finalize_policy_version: 1`;
- OTK finalization must atomically persist review/report/rating/object/management/continuation/done/pending-review deletion/state release;
- Runtime Check verifies atomic OTK finalization from Git history;
- replay tests cover CAS conflicts, heartbeat races, zombie fencing, duplicate intake, stale production/OTK recovery, immutable creation/deletion and OTK finalization.

CI amplification was reduced: a pulse-only test commit `351698ceccd9682ac96b3d00490abaceab248ec5` started zero workflows, proving `.agent/time-pulse.json` no longer launches heavyweight Runtime Check/Control Plane Tests by itself.

Live shift 59 provided a useful fault-injection proof. The worker claimed with `activity_kind=starting`; the old validator rejected that legitimate phase. The Reporting-v2 barrier then behaved correctly: Михалыч published a valid immutable start report, did not touch the target repository, switched to `blocked_control_plane` and raised manager attention. The contract was fixed without rewriting the report or target history, and the exact blocked-state snapshot then passed Runtime Check and History Audit.

The remaining P1 proof is empirical rather than implementation work: observe a natural post-policy OTK close and confirm its immutable OTK report is created in the same single finalize commit as all required bookkeeping.

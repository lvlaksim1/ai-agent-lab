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

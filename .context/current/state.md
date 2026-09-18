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

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

- all five active Scheduled Tasks now use quiet condition-watch notifications: idle/no-op runs do not notify; substantive outcomes may notify.


## Recovery note — 2026-09-18

A real continuity defect was found: OTK could finish while mandatory CI was still running and leave no continuation, causing the brigade to idle after CI later completed. Event 024 was queued to resume iOS work from the completed E2E failure. OTK/workflow now include a queue-continuity guard and non-scored external-evidence preflight.

The temporary condition-watch scheduler experiment was reverted; all five shop clocks are again exact-schedule because timing reliability is part of production correctness.

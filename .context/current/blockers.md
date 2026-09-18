# Current Blockers and Open Risks

## OPEN — scheduler re-anchor proof

After timing-mode changes, enabled tasks did not visibly fire on the expected tick. All five recurring tasks were explicitly re-anchored with future Moscow DTSTART values. Require a post-reanchor Scheduled Task run plus GitHub production state transition before considering cadence restored.


## OPEN — cross-repository end-to-end proof

Cross-repository forwarding exists, but a complete real source-repository → central intake → worker → result cycle should still be explicitly proven before being called universally verified.

## OPEN — fresh-chat Context Capsule proof

Use a completely new empty Chat to verify repository discovery, bootstrap, manager continuity and dynamic write-back.

## OPEN — first natural immutable report publication

Observe the first naturally generated post-change `.agent/reports/published/*.md` report and confirm Telegram sends it exactly once.

The active iOS project's technical blocker is not duplicated here; read live object/target evidence.

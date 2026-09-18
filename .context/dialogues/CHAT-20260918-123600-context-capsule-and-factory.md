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

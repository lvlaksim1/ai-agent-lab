# CHAT-20260917-autonomous-wake-research

- **Period:** 2026-09-17
- **Topic:** autonomous wake/orchestration research.
- **Source quality:** semantic reconstruction, not verbatim transcript.

User wanted external GitHub events to initiate heavy ordinary-Chat work without Work and without separately billed OpenAI API.

Explored Work webhooks, scheduled tasks, re-arm tests, GitHub writes and quota observations.

Decisions/findings:
- Work is not production intelligence.
- Scheduler is immutable.
- GitHub is mutable dispatcher/memory/state.
- Ordinary Chat is intelligence.
- External events write queue/wake; periodic Scheduled Chat notices it.
- Native scheduled ordinary Chat showed no visible agentic-feature quota change in experiments at UI resolution.
- Same-repo autonomous E2E later succeeded.

Resulting model:
`GitHub event → Actions intake → queue/wake → immutable Scheduled Chat → ordinary Chat → GitHub state/code/journal`.

# DEC-20260917-architecture

- **Status:** ACTIVE
- **Type:** DECISION
- **Decision:** ordinary Chat performs reasoning; GitHub holds durable mutable orchestration; native recurring Scheduled Chat is only an immutable clock; GitHub Actions handles deterministic intake/reporting.
- **Constraints:** no Work for production reasoning; no separately billed OpenAI API dependency; runtime does not mutate scheduler.
- **Reason:** external events become durable queue/state while heavy reasoning remains ordinary Chat.
- **Evidence:** same-repository autonomous E2E later succeeded GitHub comment → intake → Scheduled Chat → ordinary Chat → GitHub state/change.
- **Observation:** native scheduled ordinary Chat showed no visible agentic-feature quota change in experiments at UI resolution; this is not a pricing guarantee.

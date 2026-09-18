# Project Architecture

## Core

```text
GitHub event
→ GitHub Actions intake
→ .agent/queue/pending + .agent/wake.json
→ immutable native Scheduled Chat
→ ordinary Chat reasoning
→ GitHub code/state/journal/done
```

## Production topology

Production relay clocks: :02, :17, :32, :47.
Manager: :59.

Eight workers: Петрович, Саныч, Михалыч, Борисыч, Иваныч, Федорыч, Кузьмич, Палыч.

One global production/OTK lease forbids worker+worker concurrency. Manager has separate management state, so worker+manager concurrency is allowed.

Relay: a run may do one production event, or independently accept previous shift through ОТК and then sequentially execute at most one next production shift. Self-review is forbidden.

## Management/object layer

- `.agent/management/` — manager identity/state.
- `.agent/assignment.json` — active object.
- `.agent/objects/` — object mission/state/handoff.
- `.agent/transfer/` — reassignment protocol.

## Context layer

`.context/` is semantic memory of interactive development conversations. It complements, not replaces, `.agent/`.

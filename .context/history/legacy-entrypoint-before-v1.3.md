# Project Context Capsule — Bootstrap Entry Point

Authoritative branch: `work-webhook-test`.

## Bootstrap order

Read in this order:

1. `.context/manifest.json`
2. `.context/project/identity.md`
3. `.context/project/goals.md`
4. `.context/project/constraints.md`
5. `.context/current/state.md`
6. `.context/current/blockers.md`
7. `.context/current/next.md`
8. `.context/handoffs/latest.md`
9. `.context/rules/user-rules.md`
10. `.context/rules/development-rules.md`
11. `.context/rules/ai-rules.md`
12. `.context/decisions/index.md`
13. `.context/dialogues/index.md`

Then read historical decisions/dialogues/evidence only when needed.

## Integration with autonomous runtime

Project Context Capsule stores conversational/project memory.
The autonomous shop runtime remains authoritative for live mutable execution state.

For current status inspect as needed:
- `.agent/assignment.json`
- `.agent/state.json`
- `.agent/wake.json`
- `.agent/management/state.json`
- `.agent/management/wake.json`
- `.agent/brigade.json`
- `.agent/objects/index.json`
- active object's mission/state/handoff.

If invoked as «начальник участка», also follow `.agent/management/interactive-bootstrap.md`.

## Persistence

During every substantial interactive project Chat follow `.context/protocol.md`.
Significant semantic changes must be committed back unless the user explicitly forbids repository writes.

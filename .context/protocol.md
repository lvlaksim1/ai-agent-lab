# Context Persistence Protocol

## Principle

This repository is the persistent memory for AI Agent Lab. Individual chats are ephemeral.

`.context/` stores human/AI development history and project semantics.
`.agent/` stores live autonomous runtime state.

## Start of a substantial interactive Chat

1. bootstrap via `ENTRYPOINT.md`;
2. create or continue one dialogue record for the current substantial session;
3. if the Chat is the Начальник участка, also materialize the manager identity from `.agent/management/`;
4. do not infer missing historical facts.

## Dynamic sync triggers

Persist semantic changes when they occur: owner decision, requirement, persistent preference, architecture change, blocker/root cause, rejected approach, milestone/release, plan/priority change, important verified finding, major runtime policy change, transfer/topology/reporting policy change.

Do not commit every conversational turn.

## What belongs where

- `.context/decisions/` — durable decisions.
- `.context/dialogues/` — semantic history of substantial user/AI chats.
- `.context/rules/` — durable requirements/preferences.
- `.context/current/` — compact project working set.
- `.context/handoffs/latest.md` — next interactive Chat.
- `.agent/` — current queue, leases, worker/OTK runtime, manager state and object execution state.

Do not copy volatile runtime values into Capsule as if they remained authoritative.

## End/handoff

Before a substantial work segment finishes, synchronize current state, blockers, next, rules/decisions, session dialogue record, latest handoff and manifest.

## History discipline

Do not rewrite history. Supersede old decisions. Keep current working state compact.

## Concurrency

Use SHA/version-aware writes. On conflict, re-read and merge.

## Privacy

Never persist secret values, credentials, cookies, private keys or sensitive personal data.

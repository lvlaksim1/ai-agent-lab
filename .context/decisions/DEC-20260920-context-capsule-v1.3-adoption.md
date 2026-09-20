# DEC-20260920 — Adopt Context Capsule Core v1.3

- Status: active
- Date: 2026-09-20

## DECISION

Adopt the repository's existing rich Project Context Capsule into Context Capsule Core v1.3 without reinstalling or flattening project-owned context.

The authoritative durable context remains on `work-webhook-test`; `main` remains the discovery branch. Live mutable execution state remains authoritative in `.agent/` and is not copied into durable semantic context except for meaningful consequences.

The migration preserves project identity, goals, architecture, constraints, current state, rules, decisions, dialogues, and handoff. Legacy bootstrap/protocol files are archived under `.context/history/` before the active v1.3 system files replace them.

Core provenance: `822fb8500ae2c1b0192f4d0863a72678c877c928`.

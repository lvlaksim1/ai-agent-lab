# DEC-20260919 — P0 control-plane stabilization

Status: ACTIVE

## Decision

Keep immutable historical reports unchanged. Enforce the current Reporting v2 contract only on newly created/live artifacts and audit historical shape drift separately.

Introduce a machine-readable report contract with tests and require the exact immutable start-report commit to pass Agent Runtime Check before a worker performs substantive target-repository work.

Synchronize runtime JSON schemas with the actual current state/event/done shapes without changing the live schema_version numbers during this stabilization.

## Evidence

- shifts 57 and 58 reproduced the same current-format defect;
- stabilization branch Runtime Check: SUCCESS;
- stabilization History Audit: SUCCESS;
- authoritative runtime commit `3acdc72905d024d525ff63bdc1fbe0f09d425217`: Runtime Check SUCCESS and History Audit SUCCESS.

## Consequence

A permanently red validator is no longer accepted as normal operation. Historical nonconformance is visible but does not mask new runtime defects.

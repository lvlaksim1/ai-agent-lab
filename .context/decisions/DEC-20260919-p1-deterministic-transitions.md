# DEC-20260919 — Deterministic runtime transitions

Status: ACTIVE

## Decision

Keep ChatGPT responsible for reasoning, engineering judgment and evidence interpretation, but move deterministic runtime bookkeeping into pure transition plans applied by one non-force CAS Git tree commit.

Every transition must read its inputs from one immutable parent SHA. If branch HEAD changes before application, discard the plan, re-read and rebuild it.

GitHub time-pulse commits are the deliberate exception to transition collapsing: the exact `commit.committer.date` of the pulse is authoritative time evidence, so derived runtime state is committed afterward against that pulse SHA.

New supervisor reviews use `otk_finalize_policy_version: 1`. Their non-time-anchor finalization is one atomic transition containing review, immutable OTK report, latest mirror, brigade/rating, object state, management state/wake when applicable, continuation reconciliation, done record, pending-review deletion, wake reconciliation and OTK state release.

## Evidence

- control-plane replay tests pass on isolated branches and production commits;
- intake adapter replay proves assignment/index/wake/event-existence are all read at one parent SHA;
- CAS replay proves expected-head and update-ref conflicts cannot overwrite newer state;
- pulse-only commit `351698ceccd9682ac96b3d00490abaceab248ec5` launched zero workflows after CI path narrowing;
- production commits `6ec4d28cafa374a34d738cbbcabdb59455431f20` and `1ba0e4d46a1c03705acb0e92e6904671c31f857b` passed Runtime Check / Control Plane Tests / recovery checks;
- shift 59 showed the start-report barrier prevented target work on a control-plane validation failure;
- contract fix `ebd8e97930f56b7c6ad94c79c10f0a2741b7f960` passed Runtime Check on the exact blocked-state snapshot.

## Consequence

Do not reintroduce multi-commit bookkeeping sequences when the steps share one semantic transition and do not require separate authoritative time anchors. New transition classes require replay coverage before production use.

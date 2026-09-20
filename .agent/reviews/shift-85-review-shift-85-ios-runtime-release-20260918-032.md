# OTK Review — Shift 85

- Worker: Иваныч (`ivanych`)
- Production event: `ios-runtime-release-20260918-032`
- Review event: `review-shift-85-ios-runtime-release-20260918-032`
- Runtime boundary: 2026-09-20T04:36:21Z; stale at 04:39:21Z; recovery anchor 4d583f6118a8cc3c9737fae996f3c871cc31d647.
- Target HEAD after shift: `b5d83ecb7f4d914c00cc0ac7e568ecb724d8c567`; no target commit landed during shift 85.

## Independent assessment
The immutable v2 start report is present and states an evidence-first plan: inspect pinned APSB reader/writer mapping, mutate only if causal mapping is proven, then run focused/Windows/E2E verification. The verified last heartbeat says the pinned mapping established that the two discriminating fields are not preserved by the current writer path and that a bounded preservation change was the next action. Independent pinned-upstream inspection confirms the reader exposes `MetaCryptoKeyOSVersion`; writer `CreateOptions` exposes `FixedTime`, documented as the source for volume-superblock last-modified time, while no corresponding MetaCrypto create option is exposed in the inspected API. Runtime disappeared before the bounded mutation was saved. This is useful causal narrowing, not a voluntary handoff.

The recovery evidence is internally consistent: last verified worker heartbeat 04:36:21Z, stale boundary 04:39:21Z, recovery later at 04:46:01Z with fence generation 161. Runtime loss therefore qualifies under shift policy v4.

## Score
- Verified useful progress: 2/4 — causal writer mapping narrowed the two APSB differences; no target mutation/test result landed.
- Engineering quality: 3/3 — evidence-first, pinned API, no speculative XID/writer mutation.
- Efficiency/focus while alive: 2/2 — worker attacked the stated blocker until runtime loss.
- Start assessment/plan: 1/1 — accurate predecessor assessment and explicit success criterion.
- Total: 8/10.
- Verdict: APPROVED.
- Progress class: incremental.
- Rating delta: +30.

## Continuation
Preserve exactly one continuation for the same object. Next worker should use the pinned mapping already established, implement only a bounded preservation path for the discriminating APSB metadata that is actually supported/justified, checkpoint the target SHA immediately, then run focused tests, Windows gate and exact Windows E2E. Checkpoint/XID semantics remain frozen absent separate structural proof.

# OTK review — shift 81

Worker: petrovich
Verdict: APPROVED
Score: 9/10
Progress: substantial

Runtime loss is independently verified. The last production heartbeat is anchored at `5a3d234d679786c03303d5dae881598333259553` with GitHub committer time 2026-09-20T02:06:37Z; the stored stale threshold is 02:09:37Z; recovery pulse `238200d602e324a1f8b192d41b596f328cf19a5d` occurred at 02:10:02Z and fenced the execution. This was not a voluntary handoff.

The immutable v2 start report exists and records the correct inherited boundary from shift 80: verify the evidence-only checkpoint instrumentation first, then consume exact Windows E2E evidence without speculative writer changes. The target remains exactly `f56c1d563f73c2621b4e3a5dac95330741d2b98c`, so no unreviewed target mutation occurred during shift 81.

Petrovich consumed terminal verification: Ramdisk Tool Windows and Windows Build passed, while exact Windows E2E still failed at APFS mountroot error 79. The new descriptor-ring evidence proved that block-0 NXSB was not hiding a later checkpoint: source latest checkpoint is XID 9 / nextXID 10 at block 43214, rebuilt latest checkpoint is XID 1 / nextXID 2 at block 2. He then checked the pinned writer semantics and correctly rejected a blind XID rewrite because the writer intentionally emits a single static checkpoint with formatXID=1. This materially narrows the causal chain without weakening writer semantics.

The next discriminating evidence is source/rebuilt APSB semantic comparison: volume superblock features, crypto/tree types, flags, role/group and snapshot/revert metadata. That step was checkpointed but not executed before runtime loss.

Scoring v2: verified useful progress 4/4; engineering quality 2/3; efficiency/focus while alive 2/2; start assessment/plan 1/1. Total 9/10. Rating +40 to 1190.

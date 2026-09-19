# OTK review — shift 40

Verdict: APPROVED
Score: 7/10
Progress class: incremental
Worker: Палыч
Event: ios-runtime-release-20260918-032
Stop: runtime_loss

Runtime-loss is independently verified. The last production heartbeat anchor `04b4bd872487b36feeeb9a70e13702f747f952cf` has GitHub committer time 2026-09-19T02:53:23Z. With the configured 180-second stale threshold, the heartbeat became stale at 02:56:23Z. Recovery anchor `ff7b6b591ee8e9caae0a5bbb0fbfc6a87cb1cb92` is later at 02:58:11Z and the recovery guard fenced generation 32. This was not a voluntary handoff.

The immutable start report existed and correctly targeted the inherited blocker: wire the already verified decoded NXSB reader/serializer into source and rebuilt staging flow, then run exact E2E before any writer correction. The last heartbeat confirms useful narrowing to the exact main.go wiring sites and serializer API, but no target-repository mutation or new terminal CI evidence was completed before runtime loss. Therefore progress is real but incremental rather than substantial.

No evidence shows proof-gate weakening, speculative APFS writer changes, or anti-cheat behavior. The continuation remains valid and must be preserved exactly once.

Scoring: progress 1/4; engineering quality 3/3; efficiency/focus 2/2; start assessment/plan 1/1. Runtime loss carries no automatic efficiency penalty.

Continuation: wire source snapshot through the decoded reader and rebuilt snapshot after rawFile.Sync(), route both through the stable evidence serializer, replace/bypass the obsolete raw-DMG C# abort only after replacement evidence exists, then run mandatory gates and exact Windows E2E before any writer-semantic change.

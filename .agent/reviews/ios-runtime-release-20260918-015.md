# OTK review — ios-runtime-release-20260918-015

Verdict: APPROVED
Score: 8/10
Progress: incremental
Worker: ivanych
Shift: 13
Object: ios-research-runtime

## Independent evidence

- Target commit cbd8783869c11857a8042cac834461051daf8031 changes only `QemuCommandBuilder.cs` and only extends the first producer-search dfilter from `0xfffffff0070b2000+0x1b60` to `0xfffffff0070b1000+0x2b60`.
- `tcg,one-insn-per-tb=on` is unchanged and both SPTM proof windows remain exactly `0xfffffff0070d7b50+0x50` and `0xfffffff0070dad50+0x20`.
- Exact-commit Windows Build run 35313621011 completed successfully, including build and tests.
- No exact-commit workflow_dispatch E2E run is available through the inspected Actions evidence at review time. Therefore the shift correctly did not claim that the newly added page exposes the producer.
- No offset-vs-absolute-PA semantic fix was attempted, so the evidence gate was preserved.

## Assessment

The shift attacked the first real blocker with a minimal evidence-only diagnostic change and preserved all proof gates. Useful progress is incremental because exact E2E evidence for the new trace window is still missing; the producer-chain hypothesis is not yet validated. The continuation must obtain exact cbd8783 E2E evidence before any semantic fix. If the producer remains outside the executed trace, change the diagnostic method toward write/source tracing rather than guessing address semantics.

# OTK review — shift 120 — Палыч

Verdict: APPROVED
Score: 9/10
Progress class: substantial

## Independent evidence
- Runtime-loss record: worker last heartbeat 2026-09-20T23:54:32Z; stale boundary 23:57:32Z; recovery anchor 23:58:01Z, after stale boundary, with generation 266 fenced.
- Immutable v2 start report exists and correctly targets DIR-028 packaging trace with an explicit success criterion.
- Target commit `4306296b15b7fd9081f02f699a25c10b23c32e03` is a minimal evidence-only change: six added lines log source and patched ramdisk byte sizes; no APFS writer semantics were changed.
- Exact Windows E2E `35545935392` for that target completed FAILURE and produced artifact `10615713868`.
- Artifact evidence logs `patched_dmg_bytes=192298899`. Boot reports md0 block size 512 and block count 375584, giving md0 capacity 192299008 bytes. This is exactly the patched DMG rounded up to the next 512-byte sector (109 bytes padding), so the alleged size mismatch is not a causal packaging divergence.
- Boot still reaches `BSD root: md0` and repeatedly fails `apfs_vfsop_mountroot` with error 79. Structural evidence preserves corrected KeyOSVersion and the existing APFS semantic constraints.

## Scoring
- Verified useful progress: 3/4 — conclusively eliminated the current size-mismatch discriminator and consumed terminal E2E evidence; mountroot remains unresolved.
- Engineering quality: 3/3 — instrumentation was minimal/read-only and preserved APFS proof constraints.
- Efficiency/focus while alive: 2/2 — followed DIR-028 directly and remained in active evidence wait until verified runtime loss.
- Start assessment and plan: 1/1 — accurate predecessor assessment, bounded plan, explicit success criterion.

Total: 9/10. Rating delta: +40.

DIR-028 explicitly requires return to management when packaging size consistency is proven while error 79 remains. Exactly one continuation is preserved, but it forbids broadening APFS semantics until management supplies the next course.
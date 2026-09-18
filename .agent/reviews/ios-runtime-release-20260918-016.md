# OTK review — ios-runtime-release-20260918-016

Verdict: APPROVED
Score: 8/10
Rating delta: +30
Progress: incremental
Worker: fedorych
Shift: 14
Object: ios-research-runtime

## Independent evidence

The reviewed target commit cbd8783869c11857a8042cac834461051daf8031 is a diagnostic-only change in `QemuCommandBuilder.cs`: it extends the caller dfilter upstream to 0x...0b1000+0x2b60 while preserving `tcg,one-insn-per-tb=on` and both existing SPTM proof windows. It does not alter target address semantics, tests, timeouts, Definition of Done, or proof gates.

The exact Windows End-to-End Boot run 35313620919 is tied to cbd8783869c11857a8042cac834461051daf8031 and completed with the expected boot-proof failure. The production journal records inspection of its exact `ios-darwin-windows-e2e` artifact: the newly included 0x...0b1000 page executed, but the first observed transition to X2=0x12ed0000 still occurs immediately after 0x...0b3978. Thus the wider linear execution window did not reveal an earlier carrier/producer.

No target code was changed after that evidence. Refusing another blind dfilter-page extension was appropriate: repeated linear widening has now ruled out the traced interval without proving the write that populates the boot-state slot. The next safe step is to trace the slot write/source directly using a supported QEMU mechanism or narrowly scoped instrumentation. Address-semantics changes remain prohibited until the producer chain proves whether the value is an offset or absolute physical address.

## Scoring

- Verified useful progress: 2/4 — exact evidence ruled out another upstream page and, importantly, established diminishing value of further blind range expansion.
- Engineering quality: 3/3 — no speculative fix; all proof gates preserved.
- Efficiency/focus: 2/2 — stopped an unproductive diagnostic pattern instead of extending it indefinitely.
- Handoff: 1/1 — next evidence target is precise and safe.

No anti-cheat violation found.

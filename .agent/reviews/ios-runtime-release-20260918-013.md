# OTK review — ios-runtime-release-20260918-013

Verdict: APPROVED
Score: 9/10
Rating delta: +40
Progress: incremental
Worker: mikhalych
Shift: 11
Object: ios-research-runtime

## Independent evidence

The reviewed commit ffaa8cb changes only the QEMU diagnostic comments and expands the first caller dfilter from 0x...0b3600+0x560 to 0x...0b3000+0xb60. One-insn TCG and both SPTM proof windows remain unchanged; no test, timeout, Definition of Done or proof gate is weakened.

Windows Build for the exact commit passed. Windows End-to-End Boot completed with the expected failure and produced the exact `ios-darwin-windows-e2e` artifact with digest `sha256:1db7e6a0e5ba8796cecc30904a54f45e6f6750e523dca36cc072e9096db7042f`; Windows Full Package was skipped because boot proof still fails.

Independent inspection of qemu-debug.log confirms the prior evidence remains stable: at PC 0x...0b3978 X19 points into the boot-state structure and X2 is still pointer-like; at the immediately following PC 0x...0b397c X2 is 0x12ed0000. The newly widened caller window does not expose an earlier traced register carrying 0x12ed0000 before that load, so the producer of the boot-state slot is still earlier than the diagnostic window. This validates the diagnostic hypothesis but does not yet prove offset-vs-absolute-PA semantics.

The shift correctly avoided an unsupported address fix. The highest-value continuation is therefore one more evidence-only step targeted farther upstream at initialization of the boot-state slot, preserving all existing SPTM proof windows.

## Scoring

- Verified useful progress: 3/4 — exact new artifact confirms the producer remains earlier than the expanded window and rules out this interval.
- Engineering quality: 3/3 — minimal diagnostic-only change, gates preserved.
- Efficiency/focus: 2/2 — directly tested the stated producer hypothesis without unrelated work.
- Handoff: 1/1 — precise next proof target and explicit prohibition on speculative root fix.

No anti-cheat violation found.

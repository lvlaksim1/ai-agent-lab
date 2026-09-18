# OTK review — ios-runtime-release-20260918-014

Verdict: APPROVED
Score: 9/10
Rating delta: +40
Progress: incremental
Worker: borisych
Shift: 12
Object: ios-research-runtime

## Independent evidence

The reviewed commit b1295ce changes only the diagnostic commentary and expands the first QEMU caller/producer dfilter from 0x...0b3000+0xb60 to 0x...0b2000+0x1b60. `tcg,one-insn-per-tb=on` is preserved and both SPTM proof windows remain unchanged. No test, timeout, Definition of Done or proof gate is weakened.

Windows Build for exact b1295ce passed. Windows End-to-End Boot for the same commit completed with the expected failure and produced exact artifact `ios-darwin-windows-e2e`, digest `sha256:41a5eccb9d16e375490d3e9228329b61fc2905757a3efce4a5054a3a32a43e37`; Windows Full Package remained skipped because boot proof is still absent.

Independent inspection of that artifact's qemu-debug.log confirms the widened interval executed from at least 0x...0b25f8 onward. The first observed `0x12ed0000` still appears only after the load at 0x...0b3978: at that PC X2 is still pointer-like (`0xfffffff007090000`), while at 0x...0b397c X2 is `0x12ed0000`. No earlier traced register in the newly added upstream page carries `0x12ed0000`. Thus this additional page is ruled out as the producer interval, while the producer/initialization of the boot-state slot remains earlier or outside the executed traced range.

The shift correctly avoided converting the value into an assumed absolute physical address. The next safe step remains evidence-only: extend the producer search farther upstream while preserving one-insn TCG and both SPTM proof windows, and do not alter address semantics until the slot producer chain is proven.

## Scoring

- Verified useful progress: 3/4 — exact new artifact rules out another upstream page and keeps the producer boundary moving in the right direction.
- Engineering quality: 3/3 — minimal diagnostic-only change with all proof gates preserved.
- Efficiency/focus: 2/2 — directly tested the stated producer hypothesis without unrelated changes.
- Handoff: 1/1 — explicit next proof target and explicit guard against a speculative root fix.

No anti-cheat violation found.

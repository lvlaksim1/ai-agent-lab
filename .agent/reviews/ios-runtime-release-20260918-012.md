# OTK review — ios-runtime-release-20260918-012

Verdict: APPROVED
Score: 9/10
Rating delta: +40
Progress: substantial
Worker: sanych
Shift: 10
Object: ios-research-runtime

## Independent evidence

The reviewed commit 9651ad5 changes only the QEMU diagnostic filter/comments: 5 additions and 4 deletions in QemuCommandBuilder, preserving one-insn TCG and both SPTM trace windows. No proof gate, test, Definition of Done, or timeout was weakened.

The exact Windows E2E run for 9651ad5 completed with the expected boot-proof failure while Windows Build passed and Full Package remained skipped. Its exact `ios-darwin-windows-e2e` artifact has digest `sha256:98f982a4fdc29687449cf6277420b7bad581a2add5cce364ab75b2e9b032e7a3`.

Independent inspection of that artifact confirms the previous shift's key claim. At PC 0xfffffff0070b3978, X19 is 0xfffffff007090b70 and X2 is still a pointer-like value. At the immediately following PC 0xfffffff0070b397c, X2 has become 0x12ed0000, proving the instruction at 0x...3978 loads the value from the boot-state structure. At 0x...3980 the value remains X2=0x12ed0000 while X20 becomes the global base used by the following store. The later trace still carries the same 0x12ed0000 into the SPTM path and reaches the known FAR failure.

The diagnostic move is therefore the smallest justified next step: it obtains earlier caller execution without changing root address semantics before the offset-vs-absolute-PA contract is proven. The new artifact now supplies the evidence needed for the next shift to trace formation of the boot-state slot itself.

## Scoring

- Verified useful progress: 4/4 — producer of the bad SPTM argument was narrowed from caller preparation to a specific boot-state load, independently reproduced in the exact artifact.
- Engineering quality: 3/3 — diagnostic-only, minimal, gates preserved.
- Efficiency/focus: 1/2 — correct focused move, but another trace iteration is still required before root correction.
- Handoff: 1/1 — precise next proof target and no unsupported fix.

No anti-cheat violation found.

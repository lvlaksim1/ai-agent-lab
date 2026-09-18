# ios-runtime-release-20260918-004 — technical journal

Worker: sanych (Саныч)
Proposed shift: 2
Target: lvlaksim1/iOS-Research-Runtime main

## Evidence inspected

- Target main remained at e724be378cd4c398d64b7b386c24461c1730e94c at shift start.
- Windows Build run 35297668265 succeeded.
- Windows End-to-End run 35297667872 failed at the genuine boot proof and uploaded artifact ios-darwin-windows-e2e (artifact 10528189166).
- The E2E qemu-debug.log captured the previously hidden 0x...0dad50/0x...0dad6c path.

## Finding

The high-bit-looking value is constructed inside the 0xfffffff0070dad50 block, not merely passed through it.

Decoded seven-instruction block:

- 0x...0dad50 ADRP X8 -> page 0xfffffff007092000
- 0x...0dad54 LDR X8,[X8,#0x1f8] -> global at 0xfffffff0070921f8
- 0x...0dad58 ADRP X9 -> page 0xfffffff007091000
- 0x...0dad5c LDR X9,[X9,#0x40] -> global at 0xfffffff007091040
- 0x...0dad60 SUB X8,X22,X8
- 0x...0dad64 ADD X0,X8,X9
- 0x...0dad68 branch back toward the caller path

At TB entry X22=0x0000000012ed0000 and X0=0x0000010006f64000. At the next TB, X0=0x0000400012ed0000. The later data abort reports FAR=0x00003ef012ed0000. Therefore the unexplained 0x400000000000-scale contribution comes from the loaded globals/arithmetic in this SPTM block.

The TB-level trace does not expose the two LDR results individually, so it is not yet safe to label the transformation intentional or defective.

## Change

Target commit 8d7dc0c21c850a94e4899ddd1c6e95f57bcecb55 changes only QemuCommandBuilder diagnostics:

- adds `-one-insn-per-tb`;
- narrows dfilter to `0xfffffff0070dad50+0x20`;
- keeps the same CPU/instruction evidence categories.

Purpose: produce a register snapshot after each instruction in the exact construction block, exposing both loaded globals and arithmetic intermediates without changing proof gates.

## Verification state

Commit was pushed; CI was newly triggered and not yet complete at handoff. No success claim is made. The previous Build is green and previous E2E remains a legitimate failure at the boot proof.

## Handoff

Continuation ios-runtime-release-20260918-005 must inspect the new Build/E2E artifact first. If the single-instruction option is unsupported or too slow, correct only the diagnostic. Once the two global values are known, establish their semantic provenance before making any root-cause fix.

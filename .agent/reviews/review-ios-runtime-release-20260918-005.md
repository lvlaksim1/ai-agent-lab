# OTK review — ios-runtime-release-20260918-005

Verdict: APPROVED
Score: 10/10
Progress: substantial
Worker: mikhalych (Михалыч)

The shift correctly identified that the prior top-level `-one-insn-per-tb` diagnostic was the observation failure rather than a new Darwin boot failure, and replaced only that diagnostic with the supported TCG accelerator property `-accel tcg,one-insn-per-tb=on`. No proof gate or timeout was weakened.

Independent CI evidence from Windows End-to-End Boot run 35300689969 confirms the correction worked: provisioning passes, QEMU remains alive for the full 5-minute progress window and exits normally when the harness stops it, and the uploaded `qemu-debug.log` now contains per-instruction register snapshots for the narrowed SPTM block.

The new trace materially advances the blocker. At 0xfffffff0070dad50..6c it shows X8 progressing from `fffffff007092000` to `0000010000000000`, X9 from `fffffff007091000` to `fffffff000000000`, then X8 becoming `ffffff0012ed0000` and X0 becoming `fffffef012ed0000` before the following path reaches the first Data Abort with FAR `0x3ef012ed0000`. This is the evidence the continuation requested; the observation mechanism no longer needs correction.

The mission is not complete: Windows E2E still fails because no XNU/launchd/root-shell progress appears within five minutes, and Full Package is therefore skipped. The continuation is corrected only to incorporate the newly available register evidence and require semantic provenance/root-cause analysis before changing platform logic.

No anti-cheat issue found.

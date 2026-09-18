# OTK review — ios-runtime-release-20260918-025

Verdict: APPROVED
Score: 9/10
Progress: substantial
Worker: Кузьмич (kuzmich)
Shift: 23

## Verification
- qemu-sptm Windows Gate 35339282982 completed successfully on target commit 20ef7d96ec4546d2d6ff678f37223bf1173f386e.
- Windows E2E 35340724080 completed with failure at the unchanged boot progress gate; provisioning was not claimed as full success.
- The journal records `topOfKernelData=0x12ed0000` and `physBase=0x10000000000`; therefore the prior hypothesis that subtracting physBase should yield 0x12ed0000 is numerically false because the field already equals that value and subtraction underflows.
- The worker correctly declined a semantic repair without proving the producer/ABI contract. Proof gates and timeout were preserved.

## Assessment
This shift attacked the first evidentiary blocker and converted an attractive but false address hypothesis into a concrete producer-side question. No code change was justified, but avoiding a speculative consumer patch is engineering progress rather than inactivity. The continuation is focused and preserves the same object.

Scoring: useful verified progress 4/4; engineering quality 3/3; efficiency/focus 1/2; handoff 1/1 = 9/10.

## Continuation
APPROVED unchanged: `ios-runtime-release-20260918-026`. Next work must prove `blob_head` / `boot_args.topOfKernelData` producer and ABI semantics before any semantic repair.
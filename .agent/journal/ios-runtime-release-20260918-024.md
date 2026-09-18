# Production journal — ios-runtime-release-20260918-024

Object: ios-research-runtime
Worker: fedorych (Федорыч)
Proposed shift: 22
Target: lvlaksim1/iOS-Research-Runtime@main
Shift start authority: lease-claim commit 3e521192bd1ab4023f223393369099c77d63763d, GitHub server time 2026-09-18T11:19:36Z.

## Predecessor assessment

Иваныч correctly repaired only the malformed unified-diff hunk metadata and preserved the diagnostic code/proof gates. That repair was subsequently vindicated: the qemu-sptm Windows Gate for d57d803331e5bea685f9221b9b400b0230d1c818 passed. The remaining gap was that the exact E2E had not yet been analyzed after that gate completed.

## Original plan / success criterion

Use run 35325375683 as the primary evidence, find the first actual failure after SPTM_MAP, and avoid speculative semantic changes. Success means either a directly justified fix or one minimal diagnostic that distinguishes the remaining address-semantics hypotheses while preserving the 5-minute progress gate and Definition of Done.

## Evidence

Downloaded artifact ios-darwin-windows-e2e (artifact 10538674440, SHA-256 digest 6dbc5f684add05d71ed6caf1e6f882dbc2dba7b07df5741b2210da0c2e999385) from run 35325375683.

The concise boot log reaches SPTM_MAP and arms CPU0, then the integration gate times out after five minutes with no XNU/launchd/root-shell progress.

The retained qemu-debug.log gives the first concrete post-map failure:
- first exception: Data Abort at EL2;
- ESR: 0x96000045;
- FAR: 0x00003ef012ed0000;
- immediately before the abort, X22 is 0x0000000012ed0000 while the runtime DRAM base is 0x0000010000000000;
- the executed instruction stream transforms that value through `sub x8, x22, x8` (X8 held dram_base) and then `add x0, x8, x9`, producing the malformed high address before the fault.

The value 0x12ed0000 is therefore highly suspicious as a DRAM-relative offset: adding the proven DRAM base yields 0x0000010012ed0000. However, changing guest semantics now would still be premature because the producer/contract for that value has not yet been tied to a loader field.

Upstream xnuboot_sptm.c sets boot_args.physBase from info->dram_base and boot_args.topOfKernelData from the absolute blob_head. The next evidence question is whether `topOfKernelData - physBase` equals the observed 0x12ed0000.

## Change

Target commit 20ef7d96ec4546d2d6ff678f37223bf1173f386e adds only `runtime/qemu/patches/0010-sptm-boot-args-address-diagnostics.patch`.

The patch prints `SPTM_BOOTARGS` with physBase, topOfKernelData, their difference (`topOffset`), and args physical address. It changes no guest memory, no boot argument, no timeout, no proof gate, and no Definition of Done.

## Verification state

The push triggered both Windows Build run 35339282917 and qemu-sptm Windows Gate run 35339282982. Both were in progress at handoff time; no PASS is claimed.

## Safe continuation

After the mandatory qemu-sptm gate is terminal, inspect its result. If PASS, run/inspect the exact E2E for target commit 20ef7d96ec4546d2d6ff678f37223bf1173f386e and compare SPTM_BOOTARGS topOffset with the previously observed 0x12ed0000. Only if the equality and subsequent instruction flow establish the address contract should the next shift alter semantics. If the gate fails, use its patch-application/build evidence and fix only the proven defect.

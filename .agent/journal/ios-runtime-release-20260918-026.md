# Production journal — ios-runtime-release-20260918-026

Worker: palych (Палыч)
Proposed shift: 24
Object: ios-research-runtime
Target: lvlaksim1/iOS-Research-Runtime main
Shift started (GitHub server): 2026-09-18T12:17:07Z

## Predecessor assessment

The preceding work established the decisive runtime fact: `boot_args.topOfKernelData` itself reaches SPTM as `0x12ed0000` while `physBase` is `0x10000000000`, so the earlier theory that a later subtraction created the bad value is disproven. That was useful narrowing; the unresolved question was whether the low value was intentional ABI semantics or corruption in the producer.

## Original plan / success criterion

Prove the contract from independent producer and consumer sources before touching semantics. If the ABI requires an absolute physical address, inspect the canonical qemu-sptm producer and add the smallest diagnostic that distinguishes whether Windows loses the DRAM base at initialization or at the first layout skip. Do not repair the address until the exact corruption boundary is observed.

## Evidence and result

1. Apple/XNU `pexpert/pexpert/arm64/boot.h` defines `topOfKernelData` as the "Highest physical address used in kernel data area". This is direct consumer-ABI evidence: it is an absolute physical address, not a size/offset.
2. Canonical `jprx/qemu-sptm` initializes `hwaddr blob_head = info->dram_base`, advances that absolute cursor through the SPTM blob layout, and finally assigns `args.topOfKernelData = blob_head`. The upstream producer therefore independently confirms the same absolute-physical contract.
3. The current Windows E2E evidence (`topOfKernelData=0x12ed0000` with `physBase=0x10000000000`) is therefore not intentional ABI semantics. The producer state has lost the DRAM base somewhere before boot-args publication.
4. I did not apply a speculative `+ physBase` repair. That could mask an earlier width/arithmetic defect and diverge from upstream semantics.
5. Target commit `93ed5429484fdc1b266488b3c1c9130d5067e450` adds diagnostic-only patch `0011-sptm-blob-head-producer-diagnostics.patch`. It logs `blob_head` immediately after initialization from `dram_base`, and again immediately after the first layout `SKIP`, together with the values used by that arithmetic. Guest semantics, proof gates and Definition of Done are unchanged.
6. At handoff, GitHub had not yet surfaced terminal checks for the new target commit. No CI PASS is claimed.

## Next evidence boundary

Run/inspect the existing Windows Build and qemu-sptm gate for the diagnostic commit, then obtain the exact E2E log. `SPTM_BLOB_INIT` vs `SPTM_BLOB_POST_SKIP` will tell us whether the high DRAM bits are already lost on initialization or are destroyed by the first layout arithmetic. Only then make the minimal semantic/type fix at the proven boundary; retain the 5-minute XNU/launchd/root-shell progress gate.

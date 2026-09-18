# Production journal — ios-runtime-release-20260918-027

Worker: petrovich (Петрович)
Proposed shift: 25
Object: ios-research-runtime
Target: lvlaksim1/iOS-Research-Runtime main
Shift started (lease claim): 2026-09-18T12:24:00Z

## Predecessor assessment

Палыч сделал важную часть правильно: доказал absolute-physical ABI `topOfKernelData` и не замаскировал дефект добавлением `physBase`. ОТК обнаружил, что его новый diagnostic commit не проходит обязательный qemu-sptm gate, поэтому первым делом требовалось разобрать именно gate, а не продолжать E2E вслепую.

## Original plan / success criterion

Inspect the durable patch-application evidence from the failed qemu-sptm Windows Gate. Repair only the proven diagnostic patch/build defect, preserve all gates, and wait for the replacement qemu-sptm gate if it can be observed in this live shift. Do not run or interpret E2E until the diagnostic gate is green.

## Evidence and result

1. Failed qemu-sptm run 35343938235 stopped specifically at `Apply Windows portability patch`; build/configuration never started.
2. Its durable `qemu-sptm-patch-application` artifact names the exact failure: patches 0001..0010 apply, while `0011-sptm-blob-head-producer-diagnostics.patch` fails its second hunk at `hw/arm/xnuboot_sptm.c:177`.
3. Existing patch 0006 already modifies that same post-SKIP context and already logs `blob_after_skip`. Therefore 0011's second hunk was both conflicting and diagnostically redundant.
4. Target commit `3b530ed2946a6ee401fd17a0935999bdae1fbfbc` removes only the redundant second hunk from 0011. The new `SPTM_BLOB_INIT` diagnostic remains; existing 0006 continues to provide the post-SKIP blob value. No guest semantics, timeout, Definition of Done or proof gate changed.
5. Replacement Windows Build and qemu-sptm Windows Gate started for the new commit and were still in progress at the persistence boundary. No PASS is claimed.

## Natural stop / continuation

External CI evidence is now the only blocker. Next shift must preflight qemu-sptm run 35344637665. If successful, confirm Windows Build and then obtain exact E2E using `SPTM_BLOB_INIT` plus existing `sptm-layout: blob_after_skip`; only then localize and repair the producer corruption. If the gate fails, inspect its patch/build evidence before any further code change.

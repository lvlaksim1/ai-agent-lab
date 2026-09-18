# ios-runtime-release-20260918-028 — Саныч

## Predecessor assessment
Кузьмич оставил полезное доказательство: replacement qemu-sptm Windows Gate для 3b530ed прошёл, а предыдущий E2E уже печатал одновременно SPTM_BLOB_INIT и SPTM_BOOTARGS. Его гипотеза о producer-side corruption была достаточно узкой, чтобы проверить её без правки consumer.

## Original plan
Сначала подтвердить terminal gate, затем сопоставить SPTM_BLOB_INIT, sptm-layout blob_after_skip и SPTM_BOOTARGS. Если high DRAM bits теряются внутри loader arithmetic, найти конкретную LLP64-sensitive операцию и сделать минимальную типовую правку; после этого дождаться нового qemu gate и E2E.

## Evidence and finding
- inherited qemu-sptm Windows Gate 35344637665: completed/success on 3b530ed2946a6ee401fd17a0935999bdae1fbfbc.
- inherited Windows E2E 35346057716: completed/failure, artifact ios-darwin-windows-e2e.
- boot evidence: `SPTM_BLOB_INIT dramBase=0x10000000000 blobHead=0x10000000000`; `sptm-layout ... blob_after_skip=0x0000010002af4000`; later `SPTM_BOOTARGS physBase=0x10000000000 topOfKernelData=0x12ed0000`.
- Upstream `ROUND_NEXT_PAGE` is built from `DARWIN_PAGE_SIZE`; `DARWIN_PAGE_SIZE` is built from `ONE_KB`, and `ONE_KB/ONE_MB/ONE_GB` use QEMU `BIT()`. Under Win64/LLP64, `unsigned long` is 32-bit. The complement mask in ROUND_UP_POW2 therefore becomes a zero-extended 32-bit mask when combined with 64-bit `hwaddr`, dropping the high DRAM bits at a page-rounding operation. This exactly explains why blob_head starts and survives the first skip with high bits, but is low by boot-args publication.

## Change
Target repository commit `7e6ecb9a15b1a0252ad02b0f82d2e71b1fb1737f` adds `0012-win64-page-rounding-mask.patch`, changing only ONE_KB/ONE_MB/ONE_GB from BIT to BIT_ULL. This preserves 64-bit masks without adding physBase at publication and without changing proof gates/timeouts/Definition of Done.

## Verification status / forced recovery
New qemu-sptm Windows Gate 35347936254 started and successfully passed checkout, patch application, MSYS2 setup, cache restore and configure; it remained in the QEMU build step when this automation runtime could no longer safely stay open for the external wait. This is an emergency recovery boundary, not a normal CI handoff.

Continuation must preflight run 35347936254. If successful, consume companion Windows Build and the resulting E2E; verify that SPTM_BOOTARGS topOfKernelData retains the 0x100... DRAM high bits and continue boot diagnosis from the new terminal evidence. If the gate fails, inspect its durable evidence and repair only the proven failure.

Authoritative shift start: 2026-09-18T13:00:54Z (lease-claim commit server timestamp).

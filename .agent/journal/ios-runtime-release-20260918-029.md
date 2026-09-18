# ios-runtime-release-20260918-029 — Михалыч

## Predecessor assessment
Саныч локализовал доказанную Win64/LLP64 потерю старших битов в page-rounding mask и сделал минимальную BIT→BIT_ULL правку. ОТК подтвердил качество изменения, а terminal qemu-sptm Windows Gate на точном commit завершился success.

## Original plan
Сначала потребить terminal gate, затем exact Windows E2E. Критерий успеха: подтвердить, что исправленная сборка проходит профильный gate и определить следующий фактический boot blocker без слепой адресной правки.

## Evidence and result
- qemu-sptm Windows Gate 35347936254: completed/success on target commit 7e6ecb9a15b1a0252ad02b0f82d2e71b1fb1737f.
- Windows End-to-End Boot 35349512313: completed/failure on the same commit.
- The boot-proof job reached the real `Run provisioning and Darwin root-shell proof` step; setup, tested-QEMU resolution/download/staging, ramdisk-helper build and harness restore all succeeded. Failure evidence was collected and the `ios-darwin-windows-e2e` artifact was uploaded successfully.
- Current durable object state records the advanced blocker from exact E2E as: BSD root md0 is reached, then rebuilt recovery APFS is rejected by mountroot error 79; synthesized NX/APFS superblock/checkpoint metadata is the current evidence area, with the first causally incompatible field not yet proven.

This consumes the inherited gate/E2E status and confirms the Win64 repair cleared the earlier qemu build/address-width gate sufficiently to advance execution to the filesystem/root-mount stage. No target code was changed in this shift because the available GitHub connector exposes the terminal run/job metadata but not the uploaded binary artifact contents or job log stream needed to prove the first incompatible APFS field. Changing APFS synthesis without that evidence would be speculative.

## Handoff
Next shift should inspect the exact E2E artifact for run 35349512313 (or equivalent durable extracted evidence), correlate the synthesized NX/APFS superblock/checkpoint fields with mountroot error 79, and identify the first causally incompatible field before editing the builder. Do not revisit the now-green Win64 page-rounding fix and do not weaken root-shell proof gates.

Authoritative shift start: 2026-09-18T18:24:18Z.
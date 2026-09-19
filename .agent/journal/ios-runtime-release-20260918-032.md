# ios-runtime-release-20260918-032

## Shift 30 — Федорыч
Recovered evidence established that the original integration structural reader scans raw DMG bytes and fails before RamdiskProvisioningService with `No valid APFS NXSB superblock found`. Production `apfs.OpenImage` succeeds because it uses `disk.OpenWithOffset` and exposes decoded/partition-relative bytes. Writer semantics were not changed.

## Shift 31 — Кузьмич
Runtime-loss recovery shift. Confirmed the next safe diagnostic boundary: source/rebuilt NXSB snapshots must be captured at the decoded `ios-ramdisk-tool` / `disk.OpenWithOffset` layer. No target writer change was made before runtime loss. OTK later approved the recovered shift 8/10.

## Shift 32 — Палыч — checkpoint
- Inspected current `tools/ios-ramdisk-tool/main.go`: production opens source with `apfs.OpenImage`, then reconstructs a bare APFS staging image via `apfswrite.CreateContainer`, and only afterwards wraps it into DMG with `disk.WrapRawImageDMGFrom`.
- Inspected upstream `go-apfs-v2/pkg/disk/open.go`: `disk.OpenWithOffset(filename)` returns an already decompressed partition-relative `io.ReaderAt` for UDIF DMG, or a reader plus APFS partition offset for raw/GPT/APM images. NXSB magic is at container-relative offset 32.
- Inspected the current C# `ApfsStructuralEvidence`: its field offsets are usable, but its raw FileStream scan is at the wrong image layer and therefore cannot be the source of truth for the source DMG.
- Minimal implementation direction is now concrete: capture source NXSB from `disk.OpenWithOffset(opts.input)` before rebuild; capture rebuilt NXSB directly from the bare staging `rawFile` after `CreateContainer`/Sync; serialize both snapshots from ios-ramdisk-tool into the existing E2E log/evidence channel. Then remove/bypass the pre-provision raw-DMG C# read, rerun exact Windows E2E, and compare the first causally relevant metadata mismatch.
- No APFS writer semantic change has been made. The next action is implementation of this read-only evidence path, followed by gates and exact E2E.

## Shift 33 — Петрович — checkpoint
- Revalidated the inherited boundary against current target source and pinned upstream `disk.OpenWithOffset`: the source DMG must be decoded before NXSB inspection; the existing C# raw FileStream scanner is definitively the wrong layer.
- Inspected the latest APFS Evidence Marker artifact. It contains the exact failure `No valid APFS NXSB superblock found ... firmware_ramdisk.dmg`, confirming the C# pre-provision scanner still aborts before the intended source/rebuilt comparison is produced.
- During implementation an accidental transient overwrite of `tools/ios-ramdisk-tool/main.go` occurred. It was immediately repaired in target commit `096cc74340b8cf8a0aa0435f1bbff36b4897943d`; Ramdisk Tool Windows run `35406547753`, job `105797373329`, subsequently completed SUCCESS including tests, Windows x64 build and smoke test. No APFS writer semantic change was introduced.
- The remaining evidence-backed action is unchanged: add read-only decoded-layer source NXSB snapshot plus bare-staging rebuilt NXSB snapshot inside ios-ramdisk-tool, route that evidence to E2E, and remove/bypass the incorrect pre-provision C# raw-DMG read. Then run mandatory gates and exact E2E before any writer correction.

## Shift 34 — Саныч — checkpoint
- OTK independently reviewed shift 33 as APPROVED 7/10 and verified the runtime-loss anchors: last heartbeat 23:40:45Z, stale boundary 23:43:45Z, recovery 23:46:02Z.
- Re-read current `tools/ios-ramdisk-tool/main.go` and upstream `disk.OpenWithOffset`. The exact reader contract is now confirmed from source: UDIF returns an already decompressed partition-relative reader at offset 0; bare APFS returns offset 0; GPT/APM raw images return the filesystem partition offset. Therefore source NXSB must be read at `offset + 32`, while rebuilt bare staging must be read at `32` after `CreateContainer` and `rawFile.Sync()`.
- No writer-semantic change has been made. The minimal instrumentation can be implemented without new APFS parsing dependencies: read block-0 NXSB bytes through the decoded `io.ReaderAt`, validate `NXSB` at +32, and emit a compact stable evidence record containing block size/count, feature/ro-compat/incompat masks, container UUID, next OID/XID, checkpoint descriptor/data geometry and key container object OIDs. The rebuilt record must use the same parser against `rawFile` before DMG wrapping.
- The existing C# raw FileStream APFS evidence path must be removed/bypassed only after the Go evidence is wired into the integration output, so the exact E2E cannot abort before provisioning. Mandatory gates and exact Windows E2E remain required before any writer correction.

## Shift 38 — Федорыч — checkpoint
- OTK independently reviewed shift 37 as APPROVED 9/10. Runtime loss was verified from GitHub anchors; target commits `9fd950848e9377eab304e3cdc5cfc8caf62015dd` and `5d261300c30c42a9c64a82299d145211c04778f7` implement and test the decoded NXSB reader, and Ramdisk Tool Windows run `35413998505` is terminal SUCCESS.
- Re-read current `tools/ios-ramdisk-tool/main.go`: source is still opened via `apfs.OpenImage`; rebuilt bare staging is created with `apfswrite.CreateContainer`, `rawFile.Sync()`, then wrapped with `disk.WrapRawImageDMGFrom`. The new `readSourceNXSnapshot` / `readNXSnapshot` helper is not yet wired into this flow.
- No target mutation has been made in shift 38 yet. The exact next edit remains: capture source snapshot before rebuild, rebuilt snapshot immediately after `rawFile.Sync()`, emit both through a stable evidence channel, then replace/bypass the obsolete raw-DMG C# abort and run gates/E2E. Writer semantics remain untouched.

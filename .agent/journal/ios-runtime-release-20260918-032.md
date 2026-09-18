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

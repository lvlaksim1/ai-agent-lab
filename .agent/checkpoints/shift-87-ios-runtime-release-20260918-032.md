# Shift 87 — Кузьмич — checkpoint

- Shift-87 immutable start report commit `e58c2080f7b91b05aea3c5e0dc8c3fa779d25a53` passed both exact-commit GitHub checks SUCCESS before target work.
- Current target `tools/ios-ramdisk-tool/main.go` blob is `f31534635096b173809b52057bad83635ea032e6`; snapshot preservation is already present and `CreateOptions` still has no `FixedTime` assignment.
- Pinned `go-apfs-v2` reader at `36ec4f53a3fecc5692eb6bf85f399a48729a77f1` exposes `VolumeSuperblock.ModificationTime uint64` as nanoseconds since Unix epoch; pinned writer documents `CreateOptions.FixedTime` as the timestamp used for the volume-superblock last-modified time.
- Therefore the exact bounded mutation is now fully pinned: set `FixedTime: time.Unix(0, int64(volume.Superblock.ModificationTime))` in the existing `apfswrite.CreateOptions`, with no XID/checkpoint or MetaCrypto mutation.
- No target write has yet occurred. The available GitHub write primitive still requires whole-file replacement; the full blob has been fetched, so the next action is to apply that one-field whole-file-preserving replacement, checkpoint exact target SHA immediately, then focused tests, Windows gate and exact Windows E2E.

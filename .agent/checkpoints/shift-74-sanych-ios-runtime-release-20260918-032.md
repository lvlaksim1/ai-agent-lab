# Shift 74 checkpoint

- Worker: sanych
- Event: ios-runtime-release-20260918-032
- Start-report commit: 2a63ab68916788acdf30891b4256f14b6d03bd8e
- Agent Runtime Check: 35473119320 SUCCESS.
- Target main at engineering entry: 2b1003bb7e123b696e513c0ef9ec736477c2271f.
- Confirmed bounded insertion: `tools/ios-ramdisk-tool/main.go`, populate `apfswrite.CreateOptions.Snapshots` before `CreateContainer`.
- Upstream API independently re-verified at dependency commit 36ec4f53a3fecc5692eb6bf85f399a48729a77f1: `Volume.NumberOfSnapshots()`, `Volume.Snapshot(index)`, and `Snapshot.SnapshotMetadata` with fields `Name`, `ChangeTime`, `CreationTime`; writer `SnapshotSpec{Name, ModTime}`.
- Required conversion: `ModTime = time.Unix(0, int64(ChangeTime))`, falling back to `CreationTime` when `ChangeTime == 0`.
- No target mutation has been written yet. APFS writer remains unchanged.
- Next action: perform the non-truncating main.go mutation, commit exact target SHA, then focused tests, Windows gate, exact Windows E2E.

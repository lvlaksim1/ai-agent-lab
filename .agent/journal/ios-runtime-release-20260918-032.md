# ios-runtime-release-20260918-032

## Shift 62 — Федорыч — checkpoint
- Exact Windows E2E on target HEAD `2b1003bb7e123b696e513c0ef9ec736477c2271f` reaches APFS mountroot after successful provisioning but repeatedly fails rebuilt ramdisk mount with error 79.
- Decoded NXSB evidence: source XID 9/nextXID 10 versus rebuilt XID 1/nextXID 2; UUID/features match. Source snapshot history is the first evidence-backed semantic lead; APFS writer remained unchanged.

## Shift 63 — Кузьмич — checkpoint
- OTK closed shift 62 APPROVED 10/10 and independently verified runtime loss plus the decoded structural diagnosis.
- Immutable shift-63 start report commit `75ae226a1e539fd6b30cec864a43edfb46578432` passed unchanged Agent Runtime Check run `35452607775` SUCCESS.
- Re-read current target `tools/ios-ramdisk-tool/main.go`: `CreateOptions` still preserves volume name, case sensitivity, container/volume UUID, role, volume group and root tree but leaves `Snapshots` empty.
- Verified pinned upstream go-apfs-v2 API rather than guessing: `Volume.NumberOfSnapshots()` and `Volume.Snapshot(index)` exist; each `Snapshot` exposes `UTF8Name()` and `SnapshotMetadata`; metadata contains nanosecond `CreationTime` and `ChangeTime`; `apfswrite.SnapshotSpec` accepts `Name string` and `ModTime time.Time`; `CreateOptions.Snapshots []SnapshotSpec` emits spec-compliant snapshots.
- Therefore the bounded implementation is now exact: enumerate source snapshots, map each to `SnapshotSpec{Name: name, ModTime: time.Unix(0, int64(metadata.ChangeTime))}` (falling back to CreationTime only if ChangeTime is zero), assign to `createOpts.Snapshots`, then focused tests/gate/E2E. No other writer geometry change is justified yet.
- Target mutation has not yet occurred in this shift; next action remains the implementation above.

## Shift 65 — Петрович — checkpoint
- Independent OTK finalized shift 64 APPROVED 5/10; runtime loss was verified from heartbeat/recovery anchors and no target mutation was attributed to Palych.
- Immutable shift-65 start report commit `e7d369adfaebe00b3a3cf4b021a3a23399616f74` passed unchanged Agent Runtime Check run `35454933528` SUCCESS.
- Re-read target `tools/ios-ramdisk-tool/main.go` at `2b1003bb7e123b696e513c0ef9ec736477c2271f`: `CreateOptions` still has no `Snapshots`; exact insertion remains immediately before `CreateContainer` after source volume metadata is collected.
- Re-verified pinned upstream API from deploymenttheory/go-apfs-v2: `Volume.NumberOfSnapshots()` and `Volume.Snapshot(i)` are present; `Snapshot.SnapshotMetadata` is a pointer containing `CreationTime`, `ChangeTime`, and `Name`; writer `CreateOptions.Snapshots` accepts `[]apfswrite.SnapshotSpec`.
- No target mutation has been made yet. The next safe action remains the bounded snapshot-preservation edit followed by focused tests, Windows gate, and exact E2E; do not broaden writer changes.

## Shift 70 — Федорыч — control-plane checkpoint
- OTK finalized shift 69 APPROVED 5/10 after independently verifying runtime loss; continuation remained DIR-017.
- Shift-70 immutable start report was created at commit `b2aa87d1675b8c22c7aeec579e43bfd488208453`.
- Mandatory Agent Runtime Check run `35466573056` failed before any target work. Exact validator errors: missing required v2 literal markers `Проект:`, `Работник:`, `Смена:`, `Начало смены:`, `СТАРТОВЫЙ ДОКЛАД:`, `ОЦЕНКА ПРЕДШЕСТВЕННИКА:`, `МОЙ ПЛАН:`.
- Workflow forbids rewriting the immutable start report after this failure. Therefore DIR-017 target mutation was not attempted; target remains untouched.
- Manager/control-plane attention is required to define a legal remediation path for the invalid immutable shift-70 report without weakening the report-contract gate.

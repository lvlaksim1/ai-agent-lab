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
- Re-verified pinned upstream API from deploymenttheory/go-apfs-v2: `Volume.NumberOfSnapshots()`, `Volume.Snapshot(i)`, `Snapshot.SnapshotMetadata` is a pointer containing `CreationTime`, `ChangeTime`, and `Name`; writer `CreateOptions.Snapshots` accepts `[]apfswrite.SnapshotSpec`.
- No target mutation has been made yet. The next safe action remains the bounded snapshot-preservation edit followed by focused tests, Windows gate, and exact E2E; do not broaden writer changes.

## Shift 70 — Федорыч — control-plane checkpoint
- OTK finalized shift 69 APPROVED 5/10 after independently verifying runtime loss; continuation remained DIR-017.
- Shift-70 immutable start report was created at commit `b2aa87d1675b8c22c7aeec579e43bfd488208453`.
- Mandatory Agent Runtime Check run `35466573056` failed before any target work. Exact validator errors: missing required v2 literal markers `Проект:`, `Работник:`, `Смена:`, `Начало смены:`, `СТАРТОВЫЙ ДОКЛАД:`, `ОЦЕНКА ПРЕДШЕСТВЕННИКА:`, `МОЙ ПЛАН:`.
- Workflow forbids rewriting the immutable start report after this failure. Therefore DIR-017 target mutation was not attempted; target remains untouched.
- Manager/control-plane attention is required to define a legal remediation path for the invalid immutable shift-70 report without weakening the report-contract gate.

## Shift 71 — Кузьмич — checkpoint
- OTK finalized shift 70 BLOCKED 4/10 and preserved exactly one DIR-018 continuation; Федорыч lost 10 rating points because the malformed immutable start report caused an avoidable control-plane-only shift, while target safety remained intact.
- Shift-71 immutable start report commit `28360f02da5a46c4e3c3441b9ddda1e41701f054` contains every canonical v2 literal marker and exact Agent Runtime Check run `35467954824` completed SUCCESS. DIR-018 control-plane remediation is therefore proven.
- Re-read target `tools/ios-ramdisk-tool/main.go`: `CreateOptions` still leaves `Snapshots` empty. No target mutation has yet occurred in shift 71.
- Re-verified pinned upstream go-apfs-v2 API at commit `36ec4f53a3fecc5692eb6bf85f399a48729a77f1`: `Volume.NumberOfSnapshots()`, `Volume.Snapshot(index)`, `Snapshot.UTF8Name()`, `Snapshot.SnapshotMetadata.ChangeTime/CreationTime`, and `apfswrite.SnapshotSpec{Name string, ModTime time.Time}` are exact available APIs.
- Immediate next action remains the bounded edit only: enumerate source snapshots, derive ModTime from ChangeTime with CreationTime fallback, assign `createOpts.Snapshots`, commit target, then checkpoint exact target SHA before tests/gate/E2E.

## Shift 75 — Михалыч — checkpoint
- Canonical immutable start report commit `889861fac1487f8eaa3439ebd29676dc426f2dcd` passed the exact report-commit validation checks SUCCESS before target work.
- DIR-019 target-first boundary was re-read without architecture/API rediscovery: target `tools/ios-ramdisk-tool/main.go` blob is `502659e5a7f0b1a5a0a46374be2a6abd3cef3270`; `CreateOptions` still leaves `Snapshots` empty immediately before `CreateContainer`.
- The GitHub connector available in this execution exposes whole-file replacement for existing files but no bounded patch operation. The target blob was fetched intact; applying only a partial replacement would truncate the file and is forbidden. No target write was attempted, so target remains unchanged.
- Exact required edit remains unchanged: enumerate `volume.NumberOfSnapshots()`, read each `volume.Snapshot(i)`, use `UTF8Name()`, choose `SnapshotMetadata.ChangeTime` with `CreationTime` fallback when zero, append `apfswrite.SnapshotSpec{Name: name, ModTime: time.Unix(0, int64(modTime))}`, and assign the slice to `createOpts.Snapshots` before `CreateContainer`.

## Shift 79 — Кузьмич — control-plane checkpoint
- OTK finalized shift 78 APPROVED 9/10 after verifying runtime loss. Shift 78 durably landed bounded snapshot preservation at target `8288dfabeefd069066d931d09cb4508421eedf29`; Ramdisk Tool Windows run `35480398952` succeeded and exact Windows E2E run `35480398951` later failed in provisioning/Darwin root-shell proof.
- Shift-79 immutable start report was created at commit `df0c791a1bafa518946f3c44ed01d0645689985f` with all canonical v2 literal markers.
- Mandatory exact-commit Agent Runtime Check run `35481415797` nevertheless completed FAILURE in `Validate agent runtime invariants` before any target work.
- Workflow forbids rewriting the immutable report after gate failure. No target-repository mutation or evidence-changing engineering action was performed in shift 79.
- This is a control-plane defect requiring manager/recovery attention; the terminal E2E failure evidence remains the next engineering input once the report gate is legally restored.

## Shift 80 — Палыч — checkpoint
- OTK finalized shift 79 APPROVED 5/10 and attached authoritative shift-79 review/OTK paths to the continuation.
- Production claim used canonical `heartbeat.activity_kind=starting`; immutable shift-80 report commit `25804b53aad19b547f0d44e85e82fef7df36af73` passed unchanged Agent Runtime Check run `35482467879` SUCCESS. DIR-022 control-plane proof is therefore satisfied without weakening invariants.
- Consumed exact Windows E2E run `35480398951` and artifact `ios-darwin-windows-e2e`: boot still reaches `BSD root: md0` and repeatedly fails `apfs_vfsop_mountroot` with error 79 until the 5-minute no-progress timeout. Snapshot preservation did not remove the mount failure.
- Existing `apfs-structural-evidence.json` compares only the block-0 NXSB (`source xid=9/nextXid=10`, `rebuilt xid=1/nextXid=2`). After snapshots are emitted, block 0 is not sufficient evidence for the active checkpoint transaction; the rebuilt descriptor ring may contain a later NXSB.
- Nearest evidence-backed step landed at target commit `f56c1d563f73c2621b4e3a5dac95330741d2b98c`: evidence-only instrumentation now scans the checkpoint descriptor ring and records `latestCheckpointXid`, `latestCheckpointNextXid`, and `latestCheckpointBlock` for source and rebuilt containers. APFS writer semantics are unchanged.
- Next verification chain: focused Go tests / Windows gate, then exact Windows E2E to obtain active-checkpoint evidence and decide whether the remaining error-79 boundary is transaction/checkpoint history or another structural semantic.

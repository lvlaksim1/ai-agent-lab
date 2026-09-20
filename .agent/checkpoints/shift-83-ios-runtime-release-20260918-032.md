# Shift 83 checkpoint — Михалыч

- Immutable start report commit `c00d8710b23d504360fc29834b8639e4ce54a16a` passed exact Agent Runtime Check run `35486216214` SUCCESS.
- Consumed shift-82 terminal E2E artifact and localized the missing APSB output: `tools/IOSResearchRuntime.Integration/ApfsStructuralEvidence.cs` modified by shift 82 is not the producer of `apfs-structural-evidence.json`; `Program.cs` explicitly says the file is produced by `ios-ramdisk-tool`.
- Authoritative producer is `tools/ios-ramdisk-tool/apfs_evidence.go` / `apfs_evidence_output.go`. Target commit `3dd7a993b907c5775b3c5e310d549ce97884852a` now extends the actual Go evidence producer with parsed `VolumeSuperblock` APSB semantics using the pinned go-apfs-v2 public `VolumeSuperblock` parser; APFS writer semantics are unchanged.
- Exact verification is active: Ramdisk Tool Windows run `35486307859` and Windows End-to-End Boot run `35486307872` are in progress for target `3dd7a993b907c5775b3c5e310d549ce97884852a`.
- Next action after terminal evidence: consume the E2E artifact, verify `source.volume` and `rebuilt.volume` are present, compare APSB fields, and continue only from the nearest evidence-backed difference.

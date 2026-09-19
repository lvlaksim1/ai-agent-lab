# Shift 52 checkpoint — ios-runtime-release-20260918-032

Worker: borisych
Fence generation: 66
Directive: DIR-013

Persisted target mutation: `lvlaksim1/iOS-Research-Runtime@main` commit `a71c2af2fe3ba8f0534d6b0fc3cb89b873a8c85c`.

The non-truncating route is now proven: Git blob fetch returned the complete 19,847-byte `tools/ios-ramdisk-tool/main.go` from blob `2aa440e1aed86417c464d43451160baac37e3932`.

First bounded evidence mutation is persisted in `tools/ios-ramdisk-tool/apfs_evidence_output.go`: `writeNXEvidenceFile` now connects `readSourceNXSnapshot`, `readNXSnapshot(rebuilt, 0)`, and the existing `writeNXEvidence` serializer to a concrete evidence file. No APFS writer code was changed.

Next actionable step: invoke this helper from rebuild flow after `rawFile.Sync()` with a CLI evidence-output path, then pass that output through provisioning/E2E and remove the obsolete raw-DMG C# pre-provision abort. Run mandatory Windows gates and exact E2E before considering any writer change.
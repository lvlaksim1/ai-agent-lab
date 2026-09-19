# Production checkpoint — shift 58

object_id: ios-research-runtime
worker: sanych
event: ios-runtime-release-20260918-032
directive: DIR-014

## Saved target progress

The first substantive DIR-014 action is complete. `lvlaksim1/iOS-Research-Runtime` `main` commit `bccdfb7ac63b3e2fdd160311d6a7dfa44f89a6f0` updates `tools/ios-ramdisk-tool/main.go` from authoritative blob `2aa440e1aed86417c464d43451160baac37e3932` via exact contents/CAS.

The tool now accepts optional `--nx-evidence-out`. After `apfswrite.CreateContainer` and `rawFile.Sync()`, it calls the existing `writeNXEvidenceFile`, which reads the source through decoded `disk.OpenWithOffset` and the rebuilt bare APFS staging image directly at offset 0. This is read-only evidence wiring; APFS writer semantics were not changed.

## Next action

Refresh heartbeat, then inspect the known C# raw-DMG pre-provision abort and replace/bypass only that wrong-layer check as needed so the decoded NX evidence can be collected in Windows E2E. Then run mandatory Windows gates and exact E2E and consume terminal evidence.

# Production checkpoint — shift 58

object_id: ios-research-runtime
worker: sanych
event: ios-runtime-release-20260918-032
directive: DIR-014

## Saved target progress

The first substantive DIR-014 action is complete. `lvlaksim1/iOS-Research-Runtime` `main` commit `bccdfb7ac63b3e2fdd160311d6a7dfa44f89a6f0` updates `tools/ios-ramdisk-tool/main.go` from authoritative blob `2aa440e1aed86417c464d43451160baac37e3932` via exact contents/CAS.

The tool now accepts optional `--nx-evidence-out`. After `apfswrite.CreateContainer` and `rawFile.Sync()`, it calls the existing `writeNXEvidenceFile`, which reads the source through decoded `disk.OpenWithOffset` and the rebuilt bare APFS staging image directly at offset 0. This is read-only evidence wiring; APFS writer semantics were not changed.

The wrong-layer C# scan has also been removed from the E2E path. Target commits `8c1d126b039cbbb0712d356078b19c405c8f3764` and `2b1003bb7e123b696e513c0ef9ec736477c2271f` pass `--nx-evidence-out` from `RamdiskProvisioningService` into the Go helper, require the decoded evidence file to exist, and make the integration harness consume that produced evidence path instead of scanning raw DMG bytes before/after provisioning.

## Next action

Consume the mandatory Windows CI triggered by the target commits. Inspect exact workflow/job results and E2E evidence. Keep APFS writer frozen unless decoded structural evidence proves a causal mismatch.

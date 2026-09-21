# Shift 146 — Саныч — DIR-029 checkpoint

- Exact Reporting v2 start report commit `7147d9124e7bb8b9eefdffa9a97ab4c23dd7057f` passed Agent Runtime Check run `35609587682` SUCCESS.
- Consumed exact shift-145 E2E artifact for target `bbe4b9748466ed243f9ba595c2dd22018c9fd65f`: extentref source root has flags=1, level=1, NumberOfKeys=7; rebuilt has flags=1, level=1, NumberOfKeys=13. Snapmeta shape matches flags=3, level=0, NumberOfKeys=0. Checksums are valid.
- Re-read target `tools/ios-ramdisk-tool/apfs_evidence_output.go`: `readMappedTreeSnapshot` currently stops after raw node header fields and checksum; it does not parse or emit root entries.
- Re-read pinned `go-apfs-v2 v0.3.0`: `apfs.BTreeNode.ReadData(block)` parses root entries and exposes each `BTreeEntry.KeyData` and `ValueData`. This is the exact bounded API needed for the next discriminator; no writer-semantic mutation is required.
- Next action: extend read-only evidence for extentref root to emit deterministic key/value records (raw hex plus decoded child physical address where applicable), run focused Go tests, Windows gate, then exact E2E. Compare source/rebuilt records to explain 7 vs 13 before any APFS semantic mutation.

# Shift 50 checkpoint — Саныч

- OTK shift 49 fully persisted as APPROVED 5/10; runtime-loss anchors independently verified.
- Active directive: DIR-012.
- Start report for shift 50 persisted before target work.
- Re-read current target `tools/ios-ramdisk-tool/main.go`, `apfs_evidence.go`, and `apfs_evidence_output.go`.
- Exact bounded edit remains valid: call `readSourceNXSnapshot(opts.input)` before normal `apfs.OpenImage`; after `rawFile.Sync()` call `readNXSnapshot(rawFile, 0)`; emit the pair through existing `writeNXEvidence` to a machine-readable output channel. APFS writer semantics remain frozen.
- Current GitHub connector exposes whole-file replacement but no patch primitive; `main.go` is large and connector responses are range-readable. No target write has been attempted with incomplete content, avoiding accidental truncation. The next live action is to obtain/reconstruct the complete current file safely, apply only the bounded wiring edit, then immediately persist a post-edit checkpoint as required by DIR-012.

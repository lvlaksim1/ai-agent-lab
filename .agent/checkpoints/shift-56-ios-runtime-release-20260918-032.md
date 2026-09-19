# Shift 56 checkpoint — Palych

- OTK shift 55 is fully persisted: APPROVED 5/10, verified runtime loss, no target commit during the factual shift interval.
- Re-read current target `tools/ios-ramdisk-tool/main.go`: source still opens directly through `apfs.OpenImage(opts.input, nil)`; rebuilt staging still calls `apfswrite.CreateContainer`, `rawFile.Sync()`, then immediately `Stat`/`WrapRawImageDMGFrom`. The existing NX evidence helpers are still not wired into this flow.
- The required edit remains exactly bounded by DIR-013: source snapshot before normal APFS open/rebuild; rebuilt snapshot immediately after `rawFile.Sync()`; persist the pair through the existing writer/output helper. No APFS writer semantic change is justified.
- The connected GitHub write surface exposes full-file Contents API replacement for existing files. `main.go` is large enough that the fetched response is truncated by the connector; reconstructing/replacing it from a truncated body risks repeating the prior accidental overwrite. Do not perform a lossy replacement.
- Next evidence-acquisition action is to obtain a non-truncating exact-content write route for the existing target file (or an equivalent repository-native patch route) while preserving the current blob SHA, then apply only the two localized wiring insertions and checkpoint the target commit immediately.

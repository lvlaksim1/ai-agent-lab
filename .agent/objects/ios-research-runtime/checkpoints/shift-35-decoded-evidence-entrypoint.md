# Shift 35 checkpoint — decoded APFS evidence entrypoint

Worker: mikhalych
Event: ios-runtime-release-20260918-032
Fence generation: 17

Verified repository facts:
- target main head observed at tree/commit lineage headed by `096cc74340b8cf8a0aa0435f1bbff36b4897943d` during inspection;
- `tools/ios-ramdisk-tool/main.go` opens the source through `apfs.OpenImage(opts.input, nil)`, then later creates a temporary bare raw staging file and calls `apfswrite.CreateContainer(rawFile, 0, createOpts)` followed by `rawFile.Sync()` before DMG wrapping;
- therefore the inherited decoded-reader boundary is directly implementable at those two points: source snapshot before mutation from the decoded source device/container path, rebuilt snapshot immediately after `rawFile.Sync()` and before `disk.WrapRawImageDMGFrom`;
- upstream dependency is `github.com/deploymenttheory/go-apfs-v2 v0.3.0`; its public tree contains `pkg/disk/open.go` and `pkg/apfs/container_superblock.go`, confirming the intended decoded layer exists in the pinned dependency;
- no APFS writer semantic change has been made.

Next action in this same shift:
1. add a small read-only Go evidence helper and wire calls at the two verified points in `main.go`;
2. emit stable machine-readable source/rebuilt NXSB fields for E2E collection;
3. run ramdisk-tool/Windows gates and exact Windows E2E;
4. only after a causal mismatch is proven consider a minimal writer correction.

Constraint: do not fall back to the known-wrong raw-DMG C# scan and do not weaken proof gates.

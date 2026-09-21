# Shift 142 DIR-029 checkpoint

- Reporting v2 start report commit `eb3dc85c8e5d61cad2bacb58ca9edb53005c97c3` passed exact Agent Runtime Check run `35597646789` SUCCESS.
- Inherited exact E2E evidence already excludes extentref/snapmeta root-block header subtype and Fletcher checksum as the immediate mismatch.
- Re-read current target `tools/ios-ramdisk-tool/apfs_evidence_output.go`: `readMappedTreeSnapshot` currently stops after object header fields (OID/XID/type/subtype) and block checksum; it does not expose the APFS B-tree node header or any key/value/content semantics.
- Re-read pinned upstream go-apfs-v2 B-tree parser. `BTreeNodeHeader` immediately decodes `Flags` (u16), `Level` (u16), and `NumberOfKeys` (u32) from the node-header bytes. This is the nearest bounded read-only discriminator behind the already-green object header/checksum boundary.
- Next action: extend `apfsTreeSnapshot` and `readMappedTreeSnapshot` with node flags/level/key-count for source/rebuilt extentref and snapmeta roots, then run focused Go tests/Windows gate and exact E2E. Do not mutate APFS semantics before this discriminator is consumed.

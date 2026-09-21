# Shift 129 — Петрович — DIR-029 checkpoint

- Mandatory start-report barrier passed: exact `Agent Runtime Check` run `35561902803` for immutable report commit `6f0421f90ba141bbbd079f119c347f7832f61463` completed SUCCESS.
- Re-consumed the exact E2E artifact from run `35551527247` rather than repeating the already-proven high-level marker.
- The first mount attempt is already more specific than the published marker: kernel reaches `container_rootmount`, initializes `/dev/md0`, reports `device_handle block size 512 block count 375584`, then `apfs_vfsop_mount:2650` returns error 79 immediately. There is no intervening logged APFS object/lookup discriminator.
- The same artifact's `apfs-structural-evidence.json` proves the rebuilt raw APFS image is parseable by the pinned reader and exposes its live volume through the corrected object-mapping path. Rebuilt volume superblock fields include OMAP OID 20, root tree OID 1029, extentref tree OID 23 and snapshot metadata tree OID 24; the tool had already traversed the rebuilt source tree during construction, so another generic superblock diff is not the next discriminator.
- The artifact also records `patched_dmg_bytes=192298879`; kernel md0 capacity is 375584*512=192299008 bytes. This 129-byte rounded-device delta is consistent with md0 exposing the packaged DMG byte stream and is not by itself evidence of an APFS raw-container truncation; DIR-030 packaging contract remains preserved.
- Next evidence step under DIR-029: add narrow read-only validation around the rebuilt live volume's object-map resolution chain (volume OMAP -> root-tree OID -> resolved physical block -> object header/checksum/type/XID) and emit it into exact-E2E evidence before boot. This should distinguish whether kernel error 79 occurs before or at the first live-volume object lookup without changing writer semantics.

No target mutation has been made in shift 129 at this checkpoint.

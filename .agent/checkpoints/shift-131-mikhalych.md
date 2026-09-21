# Shift 131 — Михалыч — checkpoint

- Immutable start report `b1471fd1bcaefcde0d9b2bc80a864a2f9f57e9c4` passed exact Agent Runtime Check `35564949297` SUCCESS before substantive work.
- Consumed terminal exact Windows E2E `35563857728` for target `b75810a9ede0557205bd5948313d9687e4fdeca5`; run is FAILURE and artifact `ios-darwin-windows-e2e` was downloaded and inspected.
- New DIR-029 root-tree discriminator is conclusive for this layer: source root-tree OID 1028 resolves to paddr 51206, header OID 1028/XID 5/type 2/subtype 14, stored checksum equals computed checksum and `rootTreeChecksumValid=true`; rebuilt root-tree OID 1029 resolves to paddr 22, header OID 1029/XID 1/type 2/subtype 14, stored checksum equals computed checksum and `rootTreeChecksumValid=true`.
- Therefore the rebuilt live-volume OMAP -> root-tree lookup, physical mapping, object identity/type and Fletcher checksum are structurally valid; this layer does NOT explain errno 79. Generic mountroot/md0 analysis must not be repeated.
- Boot evidence still reaches `apfs_vfsop_mountroot` and fails errno 79.
- Next evidence-backed step is read-only validation of the immediately adjacent required live-volume trees (extentref OID 23 and snapshot-metadata OID 24 in rebuilt; source extentref 51196 and snap-meta 1466) through their OMAP mappings and object header/checksum/type/XID. No APFS semantic mutation is justified yet.

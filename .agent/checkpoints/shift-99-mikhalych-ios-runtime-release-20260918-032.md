# Shift 99 checkpoint — iOS Research Runtime

- Reporting v2 start gate: exact Agent Runtime Check run 35511683462 for immutable report commit `31cbe77ba3a5ae29e7dc472cace128f48e57707d` completed SUCCESS.
- DIR-024 mechanism proof: pinned go-apfs-v2 v0.3.0 `apfsSuperblock` contains typed `LastModTime uint64`; override `CreateOptions.FixedTime` resolves to `b.timestamp`; `volumeSuperblock()` is the shared constructor for live and snapshot APSB; `setObjectHeaderXID()` seals the fully marshalled object with Fletcher-64 after all fields are written. Therefore assigning `vsb.LastModTime = b.timestamp` before marshal is the minimal typed checksum-safe path.
- Bounded target mutation applied only in `tools/ios-ramdisk-tool/_overrides/go-apfs-v2/pkg/apfswrite/super.go`: `vsb.LastModTime = b.timestamp` immediately after `vsb.VolUUID`.
- Exact target commit: `699c240af49b00ca2168d0761700d4eb274e0ab8` on `lvlaksim1/iOS-Research-Runtime/main`.
- XID/checkpoint semantics and `metaCryptoKeyOsVersion` were not changed.
- Next: consume focused/Windows CI for exact target SHA, then exact Windows E2E if gates pass.

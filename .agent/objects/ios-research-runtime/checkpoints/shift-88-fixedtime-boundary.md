# Shift 88 checkpoint — FixedTime mutation boundary

- Exact target repository: `lvlaksim1/iOS-Research-Runtime`
- Exact target ref at checkpoint: `main`
- Exact target commit: `b5d83ecb7f4d914c00cc0ac7e568ecb724d8c567`
- `tools/ios-ramdisk-tool/main.go` blob at that commit: `f31534635096b173809b52057bad83635ea032e6`
- Reporting v2 start barrier passed: Agent Runtime Check run `35492144870` concluded `success` for exact start-report commit `c14df0c71c42b030fe602dba773ad3e0533ceef3`.
- Bounded mutation remains: preserve `volume.Superblock.ModificationTime` by mapping its APFS nanoseconds-since-Unix-epoch value to `apfswrite.CreateOptions.FixedTime` with `time.Unix(0, int64(...))`.
- Do not change MetaCryptoKeyOSVersion or XID/checkpoint semantics.
- Current connector returns the large `main.go` safely only in line ranges; never use a truncated fetch as whole-file replacement. Continue only through a whole-file-preserving/CAS-safe write route.
- After mutation: checkpoint exact target SHA, focused tests, Windows gate, exact Windows E2E, consume terminal evidence.

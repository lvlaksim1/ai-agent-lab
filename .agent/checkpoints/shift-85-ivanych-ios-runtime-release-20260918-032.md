# Shift 85 checkpoint — Иваныч

Start-report gate passed: exact report commit `d83ef6b7cd126f9363dc0e99839c7f754f8749e0`, Agent Runtime Check run `35489491505` = success.

Target remains `lvlaksim1/iOS-Research-Runtime@b5d83ecb7f4d914c00cc0ac7e568ecb724d8c567`; no target mutation has been made in this shift yet.

Pinned dependency is `github.com/deploymenttheory/go-apfs-v2 v0.3.0`. Reader mapping is exact: `Volume.Superblock` exposes `MetaCryptoKeyOSVersion` parsed from APSB bytes 108..112 and `ModificationTime` parsed from 256..264. Writer mapping is also exact: `apfswrite.fillMetaCrypto` hardcodes `KeyOSVersion = 0`; `volumeSuperblock()` never assigns `LastModTime`, leaving it zero. `CreateOptions` exposes neither field. Therefore the two discriminating source/rebuilt differences from exact run 35486388059 are proven writer losses, not evidence-decoder artifacts.

Next causal action: implement the smallest safe preservation mechanism for these two APSB fields, preserving checksums and snapshot/live volume-superblock consistency; do not alter checkpoint/XID semantics. Then focused tests -> Windows gate -> exact Windows E2E and consume terminal evidence.

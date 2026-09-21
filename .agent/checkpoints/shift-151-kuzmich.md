# Shift 151 — Кузьмич — checkpoint

- Immutable Reporting v2 start report commit `46a603f1ed35db9c7853c2e30f553ed0f5122703` passed exact Agent Runtime Check `35634796785` SUCCESS.
- DIR-033 is not repeated; production resumed DIR-029.
- Exact Windows E2E for prior target `a4897aa79186d0e492ca0e5f8fbdd0ad4338bcc9` is run `35613817116`, terminal FAILURE, artifact `ios-darwin-windows-e2e` id `10645357976` remains available.
- Existing root-only evidence records raw B-tree index entries but not the child nodes needed to validate whether extentref root NumberOfKeys 7-vs-13 is only layout-dependent fanout.
- Evidence-only instrumentation was extended on target `lvlaksim1/iOS-Research-Runtime/main`: commit `d9ef0a964bd1d898b6262410489921597f1442bd` adds child snapshots to the evidence model; commit `3b0f5648f004f58daef526082b3d2a32d132edcf` recursively resolves non-leaf child OIDs and emits their headers/checksums/records. No APFS writer semantics were changed.
- Next action: consume focused/Windows CI for target `3b0f5648f004f58daef526082b3d2a32d132edcf`, then exact E2E child-leaf evidence. If child resolution fails, use that exact failure to correct only the evidence resolver; if it succeeds, compare source/rebuilt extentref leaf key/value semantics before any APFS mutation.

# Shift 21 — Иваныч

Event: ios-runtime-release-20260918-023
Object: ios-research-runtime

## Evidence
- OTK independently verified the fresh Windows patch-application artifact from shift 20: patches 0001–0008 APPLIED; patch 0009 fails mandatory `git apply --check` as `corrupt patch ...:26`.
- Direct inspection of patch 0009 showed the single hunk contains 5 unchanged context lines and 14 added lines, but its header declared old/new counts 6/22. That mismatch makes the unified diff structurally corrupt before applicability can even be evaluated.

## Change
Target commit `d57d803331e5bea685f9221b9b400b0230d1c818` changes only the hunk header in `runtime/qemu/patches/0009-sptm-runtime-mapping-diagnostics.patch` from `-252,6 +252,22` to the actual `-252,5 +252,19`.

No diagnostic C line changed. No proof gate, test, timeout or runtime/address semantics changed.

## Verification/status
The patch text now has internally consistent unified-diff counts. A fresh GitHub check suite was not yet visible immediately after the commit, so no CI PASS is claimed. Per continuation constraints, exact E2E was not attempted. The next authority is the fresh qemu-sptm Windows Gate and its durable patch-application artifact.

## Handoff
OTK should verify the hunk counts independently and inspect fresh checks when available. If the full qemu-sptm Windows Gate passes, continuation may advance to exact E2E and SPTM_MAP evidence; if it fails, use the durable artifact to repair only the newly proven blocker.

# OTK review — shift 116

Worker: Борисыч
Production event: `ios-runtime-release-20260918-032`
Verdict: CORRECTED
Score: 7/10
Progress class: substantial

## Independent findings
- Runtime loss is valid: last verified heartbeat 2026-09-20T21:02:20Z, stale boundary 21:05:20Z, recovery 21:10:02Z; recovery fenced generation 256.
- Immutable v2 start report exists and states the correct bounded DIR-027 plan.
- Target commit `ef22d889c400add80c28544e309160c816e0382f` landed before runtime loss and preserves source `MetaCryptoKeyOSVersion` in rebuilt APSB.
- Terminal validation for that exact target: Ramdisk Tool Windows `35537412299` SUCCESS; Windows Build `35537412446` SUCCESS; Windows End-to-End Boot `35537412314` FAILURE.
- The landed implementation deviated materially from the established DIR-027 path: it scans physical blocks for the first `APSB` instead of resolving the rebuilt live volume paddr, and uses a new local `apfsFletcher64` plus a self-equality check instead of the already-established library checksum validation path. This deviation was not justified by new discriminating evidence and leaves the repair insufficiently proven.
- Runtime loss itself is not penalized as premature handoff. A corrected continuation is required to consume the terminal E2E failure and repair/verify the bounded APSB write path before any broader APFS mutation.

## Score v2
- Verified useful progress: 3/4
- Engineering quality: 1/3
- Efficiency/focus while alive: 2/2
- Start assessment/plan: 1/1
- Total: 7/10

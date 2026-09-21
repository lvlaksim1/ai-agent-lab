# Shift 149 — DIR-033 Reporting v2 gate diagnosis

- Shift 149 lease claim anchor: `984b9f0d5faf1749d06fc710ec170de219a018aa` at `2026-09-21T16:34:24Z`.
- Canonical immutable start report: `.agent/reports/starts/shift-149-ivanych-ios-runtime-release-20260918-032.md`, commit `842709f4cd543075d2ccb3dd539c0c954f69ee4f`.
- Exact Agent Runtime Check `35626501531` for that report commit failed at `Validate agent runtime invariants` even though the report itself uses the literal Reporting v2 fields and section markers.
- Root cause localized in the producer transition: the lease-claim state inherited by the report commit used heartbeat `activity_kind: lease_claim`. `.agent/liveness.md` and `tools/validate-agent-runtime.mjs` permit `starting`, `working`, `external_wait`, `persisting`, `closing`, `otk_review`, or `blocked_control_plane`; `lease_claim` is not a legal processing heartbeat activity kind. The pulse `purpose` may be `lease_claim`, but projected processing state must use `activity_kind: starting` before the start-report barrier.
- This explains why a canonically serialized shift-149 report still failed the exact gate and demonstrates that the recurrent defect is in runtime producer-state projection, not the report marker validator.
- Target repository `lvlaksim1/iOS-Research-Runtime` was not mutated and no target CI was launched.
- Because the immutable shift-149 report commit already has a terminal failed exact gate, this shift cannot legally cross into target work. Next control-plane repair must make lease-claim state project `starting` before publication, then a new shift/report must prove exact Agent Runtime Check SUCCESS before DIR-029 resumes.

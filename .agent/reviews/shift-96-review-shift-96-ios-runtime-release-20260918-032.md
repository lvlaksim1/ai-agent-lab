# OTK review — shift 96 — review-shift-96-ios-runtime-release-20260918-032

Verdict: APPROVED
Score: 9/10
Progress: substantial
Worker: palych
Stop: runtime_loss

Runtime-loss evidence independently verifies: heartbeat anchor `a151b7488bc435cc10a8b9fc5372400f150eee3d` has GitHub committer time `2026-09-20T11:06:14Z`, exactly matching worker_last_seen_at; stale threshold is `2026-09-20T11:09:14Z`. Recovery anchor `746be7647d28780b4fb2344dacc956f333683224` is `2026-09-20T11:10:01Z`, after stale_at, and recovery fenced generation 194. Runtime loss is therefore genuine and is not treated as voluntary premature handoff.

The immutable v2 start report exists and states the correct evidence-driven plan: trace the pinned writer mapping behind the disproved FixedTime assumption before any new APFS mutation. The last verified heartbeat records the resulting source-level proof: FixedTime feeds builder.timestamp and FormattedBy.Timestamp, while volumeSuperblock omits LastModTime; v0.3.1/main has the same omission. Object state preserves the exact consequence: reader VolumeSuperblock.ModificationTime maps to LastModTime at offset 256, so a dependency upgrade alone does not solve the defect.

This is substantial diagnostic progress because it replaces the disproved DIR-023 field-mapping assumption with a precise primitive-level defect and narrows the next safe action to an evidence-backed LastModTime write mechanism. No speculative APFS mutation, XID/checkpoint rewrite, or proof-gate weakening occurred before runtime loss.

Continuation remains exactly one same-object event and is corrected to inherit this proof plus the authoritative predecessor review/report paths.

Scoring: verified useful progress 3/4; engineering quality 3/3; efficiency/focus while alive 2/2; start assessment/plan 1/1. Total 9/10. Rating +40.

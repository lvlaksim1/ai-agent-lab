# OTK review — shift 149

- Review event: `review-shift-149-ios-runtime-release-20260918-032`
- Worker: Иваныч (`ivanych`)
- Object: `ios-research-runtime`
- Production event: `ios-runtime-release-20260918-032`
- Shift: 149
- Verdict: **BLOCKED**
- Score: **8/10**
- Progress class: **incremental**

## Independent evidence

The immutable Reporting v2 start report exists at `.agent/reports/starts/shift-149-ivanych-ios-runtime-release-20260918-032.md` from commit `842709f4cd543075d2ccb3dd539c0c954f69ee4f`. It contains the canonical metadata lines and required section markers, gives a fair predecessor assessment, targets DIR-033 first, and states a concrete success criterion before returning to DIR-029.

Exact `Agent Runtime Check` run `35626501531` for that immutable report commit is terminal **FAILURE** at `Validate agent runtime invariants`. The report itself is canonical; the triggering state at that exact commit independently shows processing heartbeat `activity_kind: lease_claim`.

`.agent/liveness.md` permits processing activity kinds including `starting`, but not `lease_claim`. The pulse purpose may be `lease_claim`; the projected processing heartbeat must be `starting` before the start-report barrier. Shift checkpoint `.agent/checkpoints/shift-149-dir033-report-gate.md` therefore localizes the recurrent control-plane failure to producer-state projection rather than Reporting v2 marker serialization.

The mandatory report-contract barrier forbade target mutation after the failed exact gate. No target repository mutation or target CI was launched. Target remains `a4897aa79186d0e492ca0e5f8fbdd0ad4338bcc9`.

## Closure audit

The shift stopped at a valid control-plane barrier. The immutable report commit already had a terminal failed mandatory gate, so target work could not legally continue in this shift. The next legal transition must repair the producer projection and prove a fresh immutable report with exact Runtime Check SUCCESS. The supplied BLOCKED exhaustion evidence is concrete and the external/control-plane action is precise.

## Scoring

- Verified useful progress: **2/4** — localized the exact recurrent producer/validator mismatch from authoritative state and exact failed run, but did not yet land the producer repair or advance APFS evidence.
- Engineering quality: **3/3** — evidence is exact, minimal, preserves all gates, and correctly separates pulse purpose from legal processing heartbeat state.
- Efficiency/focus while alive: **2/2** — followed DIR-033, did not touch the target after the failed mandatory gate, and persisted the diagnosis.
- Start assessment and plan quality: **1/1** — canonical immutable report, fair predecessor assessment, correct blocker ordering and concrete success criterion.

Total: **8/10 — BLOCKED**.
Rating delta: **+30**.

## Continuation decision

Preserve exactly one same-object continuation. It must first repair the demonstrated producer-state projection so a production lease claim projects `activity_kind: starting`, then publish a fresh canonical immutable Reporting v2 start report and require exact Agent Runtime Check SUCCESS. Only after that proof gate may DIR-029 resume from target `a4897aa79186d0e492ca0e5f8fbdd0ad4338bcc9` with the extentref NumberOfKeys 7-vs-13 discriminator.

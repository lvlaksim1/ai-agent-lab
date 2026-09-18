# OTK review — ios-runtime-release-20260918-018

Verdict: APPROVED
Score: 9/10
Rating delta: +40
Progress: incremental
Worker: palych
Shift: 16
Object: ios-research-runtime

## Independent evidence

The shift correctly stopped before inventing a physical address for the boot-state slot. The pinned qemu-sptm mapping contract requires runtime load information (`physlo` together with Mach-O `virtlo`) before the slot VA can be translated to a proven PA. The journal therefore improves the evidence chain rather than repeating blind execution-window widening.

The proposed instrumentation layer is sound: translated guest stores are handled in TCG qemu store/TLB machinery, while the already-reviewed Windows gate disables plugins. A narrow runtime-derived store probe is therefore a justified next diagnostic step, provided it remains observational and derives the watched PA from the actual loaded SPTM mapping.

The target commit attached to the review is the existing diagnostic-only QEMU dfilter change; its patch only widens the upstream trace window and preserves one-insn TCG plus both proof windows. No address-semantics or proof-gate weakening is present. The production shift itself made no additional target change.

## Scoring

- Verified useful progress: 3/4 — established the missing mapping prerequisite and selected a defensible instrumentation layer, but has not yet captured the producer store.
- Engineering quality: 3/3 — explicitly rejected speculative hard-coded PA/address changes.
- Efficiency/focus: 2/2 — redirected work away from repeated blind dfilter widening.
- Handoff: 1/1 — next diagnostic sequence is precise.

No anti-cheat violation found. Continue by emitting the actual SPTM runtime mapping and using only that derived PA for a narrow diagnostic TCG-store probe.
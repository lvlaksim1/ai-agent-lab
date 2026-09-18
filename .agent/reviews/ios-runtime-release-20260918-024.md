# OTK review — ios-runtime-release-20260918-024

Object: ios-research-runtime
Worker: fedorych (Федорыч)
Shift: 22
Verdict: APPROVED
Score: 9/10
Progress: substantial
Rating delta: +40
New rating: 1060

## Independent assessment

The shift attacked the first real blocker after the previously repaired qemu-sptm patch gate rather than changing address semantics speculatively. Exact E2E evidence identifies a first EL2 Data Abort after SPTM_MAP and ties the malformed address construction to X22=0x12ed0000 while the proven DRAM base is 0x10000000000. The hypothesis that 0x12ed0000 is a DRAM-relative offset is plausible but was correctly kept as a hypothesis.

The target change is diagnostic-only: it adds SPTM_BOOTARGS logging for physBase, topOfKernelData, topOffset and args physical address. No timeout, proof gate, Definition of Done or guest-memory semantics was weakened. The continuation is narrow and carries a wait_for on the mandatory qemu-sptm Windows Gate.

At review time qemu-sptm Windows Gate run 35339282982 is still in_progress, so no PASS is awarded or claimed. The continuation must remain queued and must not consume a brigade turn until that run becomes terminal.

## Score rationale

- Verified useful progress: 4/4 — localized the first concrete post-map failure and produced a discriminator for the remaining address-contract question.
- Engineering quality: 3/3 — minimal diagnostic-only change; no semantic leap or gate weakening.
- Efficiency/focus: 1/2 — strong focus, but the diagnostic patch is not yet validated by its mandatory gate.
- Handoff quality: 1/1 — continuation and wait_for are precise and evidence-bound.

No anti-cheat violation found.

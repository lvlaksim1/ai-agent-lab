# OTK review — ios-runtime-release-20260918-021

Verdict: APPROVED
Score: 8/10
Rating delta: +30
Progress: incremental
Worker: mikhalych
Shift: 19
Object: ios-research-runtime

## Independent evidence

The target commit remains f992023. Independent GitHub checks confirm ordinary Windows Build passed, while the authoritative qemu-sptm Windows Gate failed specifically in `Apply Windows portability patch`; configure, build, Darwin-machine verification and proof-artifact upload were skipped. Full Package and exact E2E consequently did not run.

The shift made no unsupported target change. Its key conclusion is sound: after the prior 0009 hunk-count correction, job metadata still identifies only the aggregate patch-application step and does not expose which patch or `git apply --check` stderr failed. Therefore another speculative patch edit is not justified. Making the failing patch name and stderr durable CI evidence, without weakening `git apply --check`, is the correct next move before any runtime/address work.

The continuation is approved unchanged. Exact E2E, TCG-store instrumentation and address-semantics changes remain gated on a fully passing qemu-sptm Windows Gate and SPTM_MAP evidence.

## Scoring

- Verified useful progress: 2/4 — independently eliminated an unsupported 0009-specific assumption and narrowed the next action to missing durable failure evidence.
- Engineering quality: 3/3 — preserved proof gates and refused speculative target edits.
- Efficiency/focus: 2/2 — stayed on the first authoritative blocker.
- Handoff: 1/1 — continuation is precise and evidence-ordered.

No anti-cheat violation found.

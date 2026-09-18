# OTK review — ios-runtime-release-20260918-004

Verdict: CORRECTED
Score: 8/10
Progress: incremental
Worker: sanych (Саныч)
Proposed/global shift: 2
Object: ios-research-runtime

## Independent evidence

- Reviewed journal/report and target commit `8d7dc0c21c850a94e4899ddd1c6e95f57bcecb55`.
- Target diff is diagnostic-only: it adds `-one-insn-per-tb` and narrows `-dfilter` to the seven-instruction SPTM block. No proof gate, test, Definition of Done or timeout was weakened.
- Windows End-to-End run `35299361157` completed FAILURE. Provisioning passed, but qemu-sptm exited code 1 almost immediately during the genuine boot proof.
- Uploaded artifact `10528749171` contains a one-byte boot log and integration log only; therefore the new diagnostic produced no register evidence. This means the continuation must not assume the option is usable on the tested qemu-sptm build.
- The prior decoded finding remains a useful narrowing hypothesis: the observed exit value from the 0x...0dad50 arithmetic block is consistent with the high contribution being introduced by the loaded globals/arithmetic. However, individual LDR values are still not evidenced, so semantic provenance and root cause remain unproved.

## Scoring

- Verified useful progress: 3/4 — narrowed the construction block from prior evidence, but the new run yielded no additional register sequence.
- Engineering quality: 3/3 — minimal diagnostic-only change, proof gates preserved, uncertainty stated.
- Efficiency/focus: 1/2 — tightly scoped, but the selected QEMU option failed before useful tracing.
- Handoff quality: 1/1 — continuation explicitly anticipated unsupported/no-useful-evidence behavior.

Total: 8/10. Rating delta: +30.

## Correction

Keep exactly one continuation, but make its first obligation evidence-driven: treat the current one-byte qemu log / immediate code-1 exit as a failed diagnostic, establish the exact CLI failure from available job/log evidence if possible, then replace only that diagnostic with a supported mechanism that exposes the two LDR results (for example a supported QEMU trace/plugin/debug path). Do not alter boot proof gates. Only after the two globals and arithmetic are observed may the next shift assign semantic provenance or implement a root-cause fix.

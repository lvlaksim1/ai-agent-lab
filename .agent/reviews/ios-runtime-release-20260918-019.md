# OTK review — ios-runtime-release-20260918-019

Verdict: CORRECTED
Score: 5/10
Rating delta: 0
Progress: none
Worker: petrovich
Shift: 17
Object: ios-research-runtime

## Independent evidence

The diagnostic intent is correct and remains observational: commit ebd101ae adds only a new patch that prints the loaded SPTM virtlo/physlo and a vtop-derived boot-state slot PA after macho_load. It does not change guest address semantics or weaken the existing proof gates.

However, the required qemu-sptm Windows Gate failed before compilation. The build-qemu job stopped at `Apply Windows portability patch`; every later configure/build/proof step was skipped. Therefore the shift's claim that exact E2E can next provide SPTM_MAP is not yet established, and the new patch cannot be accepted as buildable evidence. The ordinary Windows Build did pass, but that workflow does not validate application of the pinned qemu-sptm patch stack.

The continuation is corrected accordingly: first reproduce and repair the patch-stack application failure with the smallest context-only correction to 0009 (or identify an earlier patch if logs prove otherwise), then require qemu-sptm Windows Gate PASS before attempting exact E2E. Only after SPTM_MAP is actually emitted may a narrow runtime-derived TCG-store producer probe be added. No hard-coded PA and no address-semantics change are permitted.

## Scoring

- Verified useful progress: 0/4 — the intended runtime mapping evidence was not produced because the authoritative qemu patch gate failed before build.
- Engineering quality: 2/3 — diagnostic-only design and vtop derivation are sound, but patch applicability was not verified before handoff.
- Efficiency/focus: 2/2 — the change targeted the correct evidence gate without speculative semantics changes.
- Handoff: 1/1 — the intended next evidence sequence was clear, now corrected to include the failed patch gate first.

No anti-cheat violation found.
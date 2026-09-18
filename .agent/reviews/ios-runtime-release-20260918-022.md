# OTK review — ios-runtime-release-20260918-022

Verdict: APPROVED
Score: 9/10
Rating delta: +40
Progress: substantial
Worker: borisych
Shift: 20
Object: ios-research-runtime

## Independent evidence

The target commit changes only the qemu-sptm Windows workflow to preserve patch-application evidence while keeping `git apply --check` mandatory. Fresh checks show Windows Build PASS and qemu-sptm Windows Gate FAIL in build-qemu; downstream E2E/package checks were correctly skipped.

The new durable artifact exists and independently resolves the previously opaque blocker. Patches 0001 through 0008 report APPLIED. Patch `0009-sptm-runtime-mapping-diagnostics.patch` fails `git apply --check` with `error: corrupt patch ...:26` and RESULT=CHECK_FAILED. Inspection of the patch shows its sole hunk header declares `+252,22`; this is now the proven patch/applicability defect to repair before any E2E work.

The shift did exactly what its continuation required: it did not weaken the gate, did not guess at runtime semantics, and converted an aggregate CI failure into durable patch-specific evidence. No anti-cheat violation found.

## Scoring

- Verified useful progress: 4/4 — the exact failing patch and check error are now durable and independently verified.
- Engineering quality: 3/3 — mandatory applicability checking remains intact and failure evidence survives.
- Efficiency/focus: 1/2 — workflow instrumentation is slightly more machinery than a direct local patch audit, but it produces authoritative Windows-run evidence.
- Handoff: 1/1 — next action is now unambiguous.

## Continuation

Repair only the proven corruption/applicability defect in patch 0009 around its hunk metadata/content, without changing diagnostic C semantics or weakening `git apply --check`. Then require the full qemu-sptm Windows Gate to PASS before attempting exact E2E. If the gate still fails, use the durable artifact as the next source of truth.

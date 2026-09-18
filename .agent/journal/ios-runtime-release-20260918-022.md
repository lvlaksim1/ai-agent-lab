# Shift 20 — Борисыч

Event: ios-runtime-release-20260918-022
Object: ios-research-runtime

## Evidence
- Target head before shift: f99202345d6268727416c839d416cc70cff8ed2a.
- Windows Build check passed, but qemu-sptm Windows Gate build-qemu failed at `Apply Windows portability patch`; all subsequent gate stages were skipped.
- The workflow ran `git apply --check` directly, so stderr disappeared with the failed step and there was no durable patch-specific artifact.

## Change
Commit `0b2e12834fa595294a5d727e82dd1766b76dc139` changes only `.github/workflows/qemu-sptm-windows.yml`.
- Keeps `git apply --check` mandatory and unchanged as the applicability gate.
- Captures patch name plus stdout/stderr from both check and apply into `qemu-proof/patch-application.txt`.
- Records explicit CHECK_FAILED/APPLY_FAILED/APPLIED result markers.
- Adds an `if: always()` artifact upload so the exact evidence survives a failing apply step.

## Verification/status
The previous failure is proven to be patch-stack application, not QEMU compilation or E2E. The diagnostic workflow change itself triggers a fresh qemu-sptm Windows Gate. No patch applicability defect was guessed or repaired in this shift because the required durable stderr evidence did not exist before the change. Per event constraints, exact E2E is not attempted until the full gate passes. No TCG-store instrumentation or address semantics were changed.

## Handoff
Next shift must inspect the fresh `qemu-sptm-patch-application` artifact, identify the exact failing patch/hunk from `git apply --check`, repair only that proven defect, and require the full qemu-sptm Windows Gate to pass before exact E2E.

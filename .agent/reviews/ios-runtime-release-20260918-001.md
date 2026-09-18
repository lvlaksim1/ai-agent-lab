# Supervisor review: ios-runtime-release-20260918-001

## Verdict
CORRECTED

## Evidence independently checked
- Worker journal and done record for `ios-runtime-release-20260918-001`.
- Target commit `a36d2b00fa538bd713594bb68bbf9fb94abc46bc` and its complete one-file diff.
- Windows Build run `35294190796`: completed successfully on that exact commit.
- Windows End-to-End Boot run `35294190788`: completed with failure at `Run provisioning and Darwin root-shell proof` on that exact commit.
- New E2E artifact `10527486163` (`ios-darwin-windows-e2e`, SHA-256 digest `be29370fdaab8bae58c9e9a024d7b149587d16db6a7eaa67d024b70a62c439ec`).
- `integration.log`: provisioning validates successfully; boot then times out without XNU/launchd/root-shell progress.
- New `qemu-debug.log`: captures the previously missing TB and the first causal Data Abort.

## Independent technical finding
The diagnostic change was justified and minimal: it only moves QEMU `-dfilter` from `0xfffffff0070b0000+0x20000` to `0xfffffff0070a3000+0x2000`; no proof gate or runtime semantics were weakened.

The new artifact answers the question the previous worker queued for the next run. At `ELR=0xfffffff0070a3bc4`, the captured OBJD-T begins `000000ac...`; little-endian AArch64 instruction `0xac000000` is `STNP Q0, Q0, [X0]`. At the failing execution, `X0=0x00003ef012ed0000`, and QEMU reports `FAR=0x00003ef012ed0000` exactly. Thus the Data Abort is directly caused by this vector store through X0. The later Prefetch Abort loop remains secondary.

The trace also contains an earlier execution of the same block with a valid high virtual X0 (`0xfffffff006f60000`) that proceeds beyond `0xfffffff0070a3bc4`, strengthening the conclusion that the bad destination value—not the instruction itself—is the differentiator.

## Review questions
- First real blocker vs symptom: yes, the worker correctly moved attention from the secondary Prefetch loop to the first Data Abort.
- Evidence support: yes for the diagnostic hypothesis; the new run now strengthens it to a specific faulting store through X0.
- Minimal/aligned change: yes; diagnostic filter only.
- Gates preserved: yes.
- Diagnostic code cleanup: the narrow `-dfilter` is temporary instrumentation and should be reconsidered/removed after root cause is fixed.
- Highest-value next action: trace provenance/formation of the malformed X0 at the failing invocation, using the captured caller/control-flow context; do not spend another iteration rediscovering the instruction.
- Continuation quality: previous continuation became stale once run `35294190788` completed, so it was corrected.
- CI validation: Build PASS; E2E still FAIL, but the diagnostic objective succeeded and produced actionable evidence.
- Definition of Done: not reached.

## Disagreements/corrections
The prior continuation said the next worker should first identify the instruction at/around the ELR. That is no longer necessary: the new evidence identifies it as `STNP Q0, Q0, [X0]` and proves FAR equals X0. Continuation `ios-runtime-release-20260918-002` was updated to begin with provenance of malformed X0 and root-cause analysis.

## Target-repo commits reviewed
- `a36d2b00fa538bd713594bb68bbf9fb94abc46bc` — approved as a narrow diagnostic commit; no remediation/revert needed.

## CI runs reviewed
- `35294190796` Windows Build — PASS.
- `35294190788` Windows End-to-End Boot — FAIL at root-shell proof; diagnostic artifact successfully captured the missing TB.
- Prior `35263107244` remains the baseline failure referenced by the worker.

## Continuation action
Updated the existing single continuation `ios-runtime-release-20260918-002`; no competing continuation was created.

## Exact next recommendation
Trace how the failing call path forms `X0=0x00003ef012ed0000` (notably caller LR/X30 `0xfffffff0070d7d04`, X3 equal to X0, and X8 `0x00003f0012ed0000`), compare it with the earlier successful invocation of the same block, prove the Win64/qemu-sptm-specific source of the malformed destination, then apply the smallest root-cause fix and rerun E2E.

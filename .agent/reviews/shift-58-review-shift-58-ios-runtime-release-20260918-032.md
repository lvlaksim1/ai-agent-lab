# OTK review — shift 58

- Review event: `review-shift-58-ios-runtime-release-20260918-032`
- Worker: `sanych`
- Stop: `runtime_loss`
- Verdict: **APPROVED**
- Score: **10/10**
- Progress class: **substantial**

## Independent evidence

Runtime-loss anchors verify exactly: the worker heartbeat anchor `8725c9f80588f3272487615a40be8b684db4c6fb` is GitHub-timestamped `2026-09-19T12:53:55Z`; with the 180-second stale threshold the stale boundary is `12:56:55Z`. Recovery anchor `0982ee03f517acf2cb7e1f1720b663536d06a965` is timestamped `12:58:01Z`, after the stale boundary, and the guard fenced the old generation.

The worker's immutable start report targeted the inherited real blocker and stated the correct success criterion: persist decoded source/rebuilt NXSB wiring, replace the wrong-layer C# abort only after replacement evidence exists, then run mandatory Windows gates/E2E without speculative writer changes.

Target evidence shows three directly related changes before runtime loss: `bccdfb7` wired `--nx-evidence-out` and evidence-file creation in `ios-ramdisk-tool`; `8c1d126` routed that decoded evidence through `RamdiskProvisioningService`; `2b1003b` removed the wrong-layer raw-DMG C# pre-provision scan and required the decoded evidence file in Integration. No APFS writer semantic change is present in these reviewed patches.

The last worker heartbeat accurately recorded Windows Build run `35444138118` as still `in_progress`. Independent OTK observation now sees that exact run terminal `completed/success` for target `2b1003bb7e123b696e513c0ef9ec736477c2271f`, updated at `2026-09-19T12:55:40Z`. Thus the mandatory Windows build gate for the new evidence path is verified green; the worker did not voluntarily hand off while waiting, but was lost by runtime.

## Scoring

- Verified useful progress: **4/4** — decoded NX evidence is wired end-to-end and the wrong-layer abort is replaced; exact Windows Build is terminal success.
- Engineering quality: **3/3** — bounded diagnostic changes, explicit evidence-file validation, no speculative APFS writer mutation, and the mandatory build gate passed.
- Efficiency/focus while alive: **2/2** — worker executed the inherited bounded plan and remained in active evidence wait until runtime loss.
- Start assessment and plan: **1/1** — fair predecessor assessment, correct blocker, concrete success criterion.

Total: **10/10 — APPROVED**. Rating delta: **+50**.

## Continuation

The causal package is not yet closed: the exact Windows E2E still must consume the newly wired structural evidence. Preserve exactly one same-object continuation. Its first action is to run/inspect the exact E2E with the decoded evidence path; if it fails, compare source/rebuilt NXSB evidence and make only the smallest evidence-proven correction. APFS writer remains frozen until a causal mismatch is demonstrated.

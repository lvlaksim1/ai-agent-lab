# OTK review — ios-runtime-release-20260918-017

Verdict: APPROVED
Score: 8/10
Rating delta: +30
Progress: incremental
Worker: kuzmich
Shift: 15
Object: ios-research-runtime

## Independent evidence

The reviewed journal correctly identifies that the pinned qemu-sptm Windows Gate configures QEMU with `--disable-plugins`; independent inspection of `.github/workflows/qemu-sptm-windows.yml` confirms that exact configure flag. The pinned upstream `system/trace-events` does expose `memory_region_ops_write`, `memory_region_subpage_write`, and `memory_region_ram_device_write`, but those named MemoryRegion paths are not evidence that ordinary translated TCG guest-RAM stores will pass through them. Treating them as a proven watchpoint would therefore be unsound.

The target HEAD remains cbd8783869c11857a8042cac834461051daf8031, the same diagnostic-only commit already reviewed for shift 14. No target/proof-gate/address-semantics change was introduced by shift 15. Windows Build for that HEAD succeeded; Full Package remains skipped because the required boot proof is not complete.

The proposed next step is technically safer than further blind dfilter widening: first prove the boot-state slot virtual-to-physical mapping from existing Darwin/QEMU mapping evidence, then add narrowly scoped diagnostic instrumentation in the pinned qemu-sptm TCG store path that reports only stores hitting that physical slot, including guest PC and value. This must remain diagnostic-only and must not change guest semantics or proof gates.

## Scoring

- Verified useful progress: 2/4 — ruled out two tempting but unsupported tracing mechanisms and identified the correct instrumentation layer.
- Engineering quality: 3/3 — no speculative address fix and no gate weakening.
- Efficiency/focus: 2/2 — stopped repeated blind execution-window widening.
- Handoff: 1/1 — next evidence target and ordering are explicit.

No anti-cheat violation found.

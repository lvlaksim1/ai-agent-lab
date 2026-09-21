# OTK review — shift 129 — Петрович

Verdict: APPROVED
Score: 9/10
Progress class: substantial

## Evidence
- Runtime loss independently verified: heartbeat anchor `14c4655cb921a129936c925a598fe87baedda820` is GitHub-timestamped 2026-09-21T04:42:48Z; stale boundary was 04:45:48Z; recovery anchor `e0bb22b468a29707fa70ff0e5d9be1a24108c6ba` is 04:46:02Z, later than stale boundary, and the recovery guard fenced the execution.
- Immutable start report exists at `.agent/reports/starts/shift-129-petrovich-ios-runtime-release-20260918-032.md`; its predecessor assessment is consistent with shift-128 OTK evidence and its DIR-029 plan states a concrete success criterion.
- Exact checkpoint commit `4fd2e45508ac4ce7fb6753296cfa54604382bf0e` durably records new evidence from exact E2E artifact run `35551527247`: mount proceeds through `container_rootmount`, `/dev/md0` initialization and device geometry before `apfs_vfsop_mount:2650` returns errno 79, with no intervening logged object/lookup discriminator.
- The same checkpoint records that the rebuilt raw APFS image is parseable by the pinned reader and exposes the live volume through corrected object mapping; OMAP OID 20, root tree OID 1029, extentref tree OID 23 and snapshot metadata tree OID 24 are available. It also rejects the 129-byte DMG/device rounding delta as unsupported truncation evidence.
- The next narrow discriminator is therefore concrete and read-only: live-volume OMAP -> root-tree OID -> resolved physical block -> object header/checksum/type/XID instrumentation. No speculative target mutation occurred before causality was established.

## Scoring
- Verified useful progress: 3/4 — produced a durable, materially deeper discriminator boundary and ruled out two weaker branches, but did not yet implement/consume the new instrumentation.
- Engineering quality: 3/3 — exact artifact was re-consumed, conclusions were bounded by evidence, writer semantics stayed frozen, and the next probe is minimal and causal.
- Efficiency/focus while alive: 2/2 — moved directly from the report barrier into exact artifact analysis and checkpointed the result before externally verified runtime loss.
- Start assessment/plan: 1/1 — accurate predecessor assessment, correct DIR-029 scope and explicit success criterion.

No anti-cheat issue. Preserve exactly one same-object DIR-029 continuation carrying this review as authoritative predecessor evidence.
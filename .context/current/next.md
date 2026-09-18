# Next Priorities

1. Verify the explicitly re-anchored :32 production tick actually runs and claims event 024.
2. Verify shift 22/OTK creates the first immutable `.agent/reports/published/*.md` file and Telegram sends it exactly once.
3. Confirm subsequent :47/:02/:17 cadence continues without manual scheduler mutation.
4. Keep one-worker runtime stable; do not add worker+worker parallelism without explicit owner reversal.
5. Validate fresh-chat Capsule bootstrap/dynamic write-back once production continuity is stable.
6. Eventually complete a real cross-repository forwarding E2E proof.

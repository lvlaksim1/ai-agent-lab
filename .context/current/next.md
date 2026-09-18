1. Empirically verify Variant C-5 generic clock dispatch at :24/:36/:48/:00/:12, including OTK/worker routing and manager+worker concurrency when attention exists.
2. If the generic dispatcher proves unreliable, roll back to documented Variant A without reverting project state.

1. Observe the next **natural** worker report after shift #22 and confirm its immutable published-file commit triggers Telegram without a redelivery request.
2. Continue event 025: its required qemu-sptm Windows Gate is already terminal and successful, so the next production tick may proceed with exact E2E evidence.
3. Confirm subsequent :47/:02/:17/:32 exact-schedule cadence continues without manual scheduler mutation, and verify a production worker can remain active across clock slots under the renewable natural-boundary shift policy.
4. Keep one-worker runtime stable; do not add worker+worker parallelism without explicit owner reversal.
5. Validate fresh-chat Capsule bootstrap/dynamic write-back once production/reporting continuity is stable.
6. Eventually complete a real cross-repository forwarding E2E proof.

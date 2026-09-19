# Next

1. Observe the first natural supervisor-review carrying `otk_finalize_policy_version: 1` and confirm Runtime Check proves one atomic OTK-finalize commit from immutable report creation through state release.
2. Observe the next production shift after the heartbeat contract fix and confirm its literal Reporting-v2 start-report commit gets a green Runtime Check before any target-repository mutation.
3. Keep the deterministic transition/replay suite green; any new state-machine mutation class must receive replay coverage before production use.
4. After those live P1 proofs, begin P2 design: separate stable control-plane code from mutable runtime state and define a private/security boundary for private target repositories.
5. Complete an explicit real cross-repository forwarding E2E proof.
6. Do not add worker+worker parallelism, mutable scheduler orchestration or Work-based wakeups.

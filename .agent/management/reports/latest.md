# Manager report — DEC-084

Object: `ios-research-runtime`
Health: ORANGE
Decision: CHANGE_COURSE
Active directive: DIR-033

Production is idle (NO_WORKER). Shift 148 was correctly blocked before target mutation because its immutable Reporting v2 start report omitted the canonical literal metadata/marker lines and exact Agent Runtime Check `35620263457` failed at `Validate agent runtime invariants`.

This is a recurrence of the same control-plane defect class previously closed by DIR-032 after the barrier had been proven green. DIR-033 therefore temporarily supersedes DIR-029 for one bounded recovery objective: identify why the canonical Reporting v2 producer path regressed or was bypassed, repair only the demonstrated producer/validator contract, and prove a newly produced canonical start report with an authoritative successful exact Agent Runtime Check. The validator and all safety invariants must remain intact.

After that proof, production returns directly to DIR-029 at the preserved engineering boundary: exact E2E extentref root-record comparison at target `a4897aa79186d0e492ca0e5f8fbdd0ad4338bcc9`. No APFS hypothesis reset or speculative semantic mutation is authorized.

No owner decision, transfer, STOP or scheduler change is required.

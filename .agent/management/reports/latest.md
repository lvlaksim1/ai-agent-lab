# Manager report — DEC-074

Object: `ios-research-runtime`
Health: ORANGE
Decision: CHANGE_COURSE
Active directive: DIR-030

Shift 124 did not reach iOS target work. Its immutable start report was published at `5b8120358e51610f53328c94fd6780bce8b2ddb5`, and exact `Agent Runtime Check` run `35554810708` failed in `Validate agent runtime invariants`. At that triggering commit the production claim state used `heartbeat.activity_kind = "lease_claim"`, while the authoritative validator's allowed activity list does not include `lease_claim`.

This is a concrete control-plane contract mismatch: the runtime can author a state that its mandatory gate rejects. Stale recovery correctly fenced the abandoned execution and returned production to idle. No new APFS conclusion follows from this failure.

DIR-030 therefore temporarily gates target work. The next shift must repair the producer/validator activity contract at the narrowest authoritative source without weakening scheduler immutability, single-worker fencing, GitHub time authority, stale recovery, Reporting v2, OTK, or start-report gates; focused validation and a successful authoritative Agent Runtime Check are required. After that proof, production resumes the existing DIR-029 APFS localization course.

No owner decision, STOP or transfer is required. Existing authorization covers this control-plane repair and automatic resumption after successful verification.

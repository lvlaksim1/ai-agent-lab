# Manager report — DEC-077

Object: `ios-research-runtime`
Health: ORANGE
Decision: CHANGE_COURSE
Active directive: DIR-031

Production is idle after shift 132. The APFS technical investigation itself remains convergent under DIR-029, with the next evidence boundary already narrowed to read-only extentref/snapshot-metadata tree mapping/header/checksum validation.

Shift 132 could not reach that work because its mandatory exact start-report Agent Runtime Check `35566785730` failed in `Validate agent runtime invariants` for commit `55f29e4c5560511a18e8add6bb80f18bf70e6e3b`. This is now the immediate blocker.

DIR-031 therefore temporarily prioritizes the control-plane gate: identify the exact rejected invariant, make only the smallest compatible correction without weakening any safety/proof invariant, and obtain an authoritative successful Agent Runtime Check. After that proof, production resumes DIR-029 at the existing extentref/snapshot-metadata discriminator rather than reopening prior APFS hypotheses.

No owner decision, STOP or transfer is required.

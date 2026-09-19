# CHAT-20260919 — P1 transition/replay hardening

The owner authorized execution of the P1 roadmap after P0 stabilization.

Implemented:
- shared atomic non-force CAS tree commit primitive;
- pure runtime transition reducer;
- snapshot-consistent intake;
- stale recovery through deterministic plans;
- replay suite for CAS conflict, heartbeat race, zombie fencing, duplicate intake, production/OTK runtime-loss recovery and immutable file semantics;
- narrower live Runtime Check paths plus separate Control Plane Tests;
- atomic OTK-finalize policy v1 with Git-history enforcement;
- adapter-level intake snapshot replay;
- pulse-only CI-noise proof.

The real shift-58 OTK history was used to quantify write amplification: after one OTK claim/time anchor, roughly ten bookkeeping commits were used for review/report/rating/object/management/continuation/queue/done/release. P1 replaces that class with one atomic finalize transition for new reviews.

Live shift 59 then exposed a contract drift: lease claim used legitimate `starting`, and the safety response used `blocked_control_plane`, but those phases were absent from validator/schema. The worker correctly froze target work under the P0 report barrier. Its immutable start report was valid. The contract was extended, verified on the exact blocked-state snapshot, and integrated without rewriting evidence.

Remaining proof: observe the first natural new-policy OTK finalize commit in production.

# CHAT-20260919 — Project audit and P0 stabilization

The owner requested an expert assessment of AI Agent Lab and then authorized execution of the P0 remediation.

Verified findings:
- control-plane architecture is strong in lease/fencing/heartbeat/recovery/OTK separation;
- Agent Runtime Check had become permanently red because current report markers were applied retroactively to immutable history;
- this was not only historical noise: fresh shifts 57 and 58 also violated the current Reporting v2 literal field contract;
- legacy JSON schemas no longer described the actual runtime state machine.

Work completed:
- isolated stabilization branch from a live-runtime boundary;
- added machine report contract, render helpers and contract tests;
- changed live validation to current/new artifacts while preserving immutable history;
- added separate history audit;
- synchronized state/event/done schemas;
- added mandatory report-contract CI barrier before target mutations;
- validated both workflows green;
- waited for shift 58 stale recovery to reach an idle boundary;
- fast-forward integrated P0 over the fresh runtime state without reverting shift data.

Next agreed direction: P1 deterministic transition engine/replay testing and reduction of write/CI amplification before adding new factory features.

# Shift 78 checkpoint — Fedorych

Object: ios-research-runtime
Event: ios-runtime-release-20260918-032
Directive: DIR-021
Start report commit: c53eb04c5f94179af309952b118694ee48ac79e1
Agent Runtime Check: SUCCESS (run 35480288508)

## Durable target mutation

Target repository: lvlaksim1/iOS-Research-Runtime
Target ref: main
Previous main.go blob: 502659e5a7f0b1a5a0a46374be2a6abd3cef3270
Committed target SHA: 8288dfabeefd069066d931d09cb4508421eedf29
New main.go blob: f31534635096b173809b52057bad83635ea032e6

The complete current main.go was recovered authoritatively, including ranged fetch evidence and the exact source blob SHA. The bounded mutation is now durable: source APFS snapshots are enumerated; SnapshotMetadata.Name is preserved; ModTime uses ChangeTime with CreationTime fallback; CreateOptions.Snapshots receives the resulting SnapshotSpec list. No unrelated APFS writer semantics were intentionally changed.

## Next action

Run focused tests, then the required Windows gate, then exact Windows E2E. Consume terminal evidence in this same shift and continue the causal chain.

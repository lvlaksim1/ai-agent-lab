# Journal — review-ios-runtime-release-20260918-002

## Event/source
Supervisor review of `ios-runtime-release-20260918-002`.

## Evidence inspected
- Agent report/journal for reviewed event.
- Target commit `311187181363ed039df28b2e9d99d9d9eda2c38d` patch.
- Windows Build `35295897094`.
- Windows E2E `35295897176` and artifact `10528396915`.
- `qemu-debug.log` caller trace.
- Continuation `ios-runtime-release-20260918-003`.

## Reasoning summary
The diagnostic dfilter move was justified and minimal. The resulting artifact proves the caller window was useful: X0 changes from `0xfffffef012ed0000` at `0x...0d7c1c` to `0x00003ef012ed0000` at `0x...0d7cf4`, after which the known callee store faults with FAR equal to X0. Root cause remains unresolved, but evidence is now sufficient to skip another diagnostic rerun and analyze the captured transformation directly.

## Root cause
Not yet proven. Current narrow blocker is the exact instruction/data-flow transformation of the high virtual address in the caller path.

## Changes
No target-repository change. Existing continuation was corrected to consume artifact `10528396915` immediately and avoid redundant CI work.

## Verification
Build for reviewed commit passed. E2E failed but produced the intended diagnostic artifact. No gates were weakened.

## Blockers
No external blocker.

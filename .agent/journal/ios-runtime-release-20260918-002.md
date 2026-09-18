# Journal — ios-runtime-release-20260918-002

## Event/source
Continuation of autonomous `lvlaksim1/iOS-Research-Runtime` v0.1.0 mission after supervisor review.

## Evidence inspected
- Windows E2E run `35294190788`, job `105443211801`.
- E2E artifact `10527486163`, especially `boot-logs/qemu-debug.log`.
- Current `QemuCommandBuilder.cs` at target commit `a36d2b00fa538bd713594bb68bbf9fb94abc46bc`.

## Reasoning summary
The artifact independently confirms two executions of the same SPTM block around `0xfffffff0070a3ba0`. An earlier successful execution enters with `X0=0xfffffff006f60000` and returns to `X30=0xfffffff0070b282c`. The failing execution enters with `X0=X3=0x00003ef012ed0000`, `X8=0x00003f0012ed0000`, `X22=0x00800000`, and `X30=0xfffffff0070d7d04`. At `0xfffffff0070a3bc4`, bytes `000000ac...` execute the non-temporal vector store and QEMU raises EL2 Data Abort with `FAR=0x00003ef012ed0000`, exactly the malformed `X0`.

The existing dfilter covers only `0xfffffff0070a3000+0x2000`, so it cannot expose the caller at `0x...0d7d04` that formed/passed the bad destination. A root-cause patch is therefore not yet justified from evidence.

## Root cause/current blocker
Immediate fault is proven: a memset-like SPTM block stores through malformed/unmapped `X0`. The unresolved root cause is upstream construction of that `X0` at the caller returning to `0xfffffff0070d7d04`.

## Changes
Target commit `311187181363ed039df28b2e9d99d9d9eda2c38d` changes only `QemuCommandBuilder.cs` diagnostic dfilter from the already-solved callee window to `0xfffffff0070d7000+0x2000`, preserving all boot proof and release gates.

## Verification
The change is source-local and diagnostic-only. No tests/gates were weakened. At the time of persistence, GitHub Actions had not yet registered runs for the new commit, so the next continuation must inspect the resulting Build/E2E evidence rather than assume success.

## Blockers
No external blocker. More CI evidence is required before a root-cause fix can be justified.

# ios-runtime-release-20260918-001

## Event/source
User-delegated autonomous continuation of `lvlaksim1/iOS-Research-Runtime` to verified v0.1.0.

## Evidence inspected
- Failed Windows E2E run `35263107244` artifact `10515742786`.
- `integration.log`: all tool/resource/firmware/ramdisk provisioning completed and validated before boot timeout.
- `qemu-debug.log` (3,447,829,209 bytes): first causal exception before the terminal loop is a Data Abort at EL2: ESR `0x96000045`, FAR `0x00003ef012ed0000`, ELR `0xfffffff0070a3bc4`.
- Immediately after that Data Abort, the exception vector target is unmapped and QEMU enters repeated Prefetch Aborts at `0xfffffef000000000` then `0xfffffef000000200`.
- Register trace immediately before the abort includes `X22=0x0000000012ed0000`; this is evidence to investigate, not yet a proven root cause.
- Existing `QemuCommandBuilder` filter covered `0xfffffff0070b0000+0x20000`, so it did not record the faulting TB around `0xfffffff0070a3bc4`.

## Reasoning/root cause status
The previous visible Prefetch Abort loop is secondary. The first actionable blocker is the Data Abort at `0xfffffff0070a3bc4`. Its exact instruction was absent from the old filtered trace, so changing ABI/layout code without capturing that instruction would be guessing.

## Changes
Committed `a36d2b00fa538bd713594bb68bbf9fb94abc46bc` to `iOS-Research-Runtime/main` (`diag: capture first SPTM data-abort instruction`). It narrows `-dfilter` to `0xfffffff0070a3000+0x2000`, which includes the faulting ELR and avoids tracing the later multi-gigabyte exception loop.

## Verification
GitHub Actions accepted the commit. At handoff, Windows Build run `35294190796` and Windows End-to-End Boot run `35294190788` were queued.

## Continuation
Mission is not complete because the new E2E evidence is still pending. Enqueued exactly one continuation event: `ios-runtime-release-20260918-002`. Next worker must inspect the new trace, prove how FAR `0x3ef012ed0000` is formed at ELR `0xfffffff0070a3bc4`, apply the smallest root-cause Win64 fix, and continue toward root-shell proof/package/release.

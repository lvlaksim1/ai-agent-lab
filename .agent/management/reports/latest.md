# Manager report — DEC-072

Object: `ios-research-runtime`
Health: ORANGE
Decision: CORRECT_COURSE
Active directive: DIR-029

Shift 120 produced a decisive negative discriminator. Independent OTK evidence from exact Windows E2E `35545935392` shows `patched_dmg_bytes=192298899` and md0 capacity `192299008`: the 109-byte difference is exactly 512-byte sector rounding, not a causal packaging truncation. Boot still reaches `BSD root: md0`, then `apfs_vfsop_mountroot` repeatedly returns error 79.

DIR-028 is therefore complete and superseded. DIR-029 resumes investigation without speculative APFS mutation: the next shift must use the narrowest read-only mountroot evidence channel available to identify the first failing APFS object, lookup, validation or invariant. Only a defect directly localized by that evidence may be corrected, after which the normal focused tests → Windows gate → exact Windows E2E proof chain applies.

No owner decision, STOP or transfer is required. Production may resume automatically on the existing continuation under DIR-029. Health remains ORANGE until error 79 is localized and the resulting bounded correction, if any, is verified by terminal evidence.

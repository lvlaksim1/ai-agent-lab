# OTK review — ios-runtime-release-20260918-028

Verdict: APPROVED
Score: 9/10
Progress: substantial
Worker: sanych

Independent evidence confirms the shift attacked the first demonstrated Win64 address-corruption mechanism rather than patching the consumer blindly. The target diff is limited to changing ONE_KB/ONE_MB/ONE_GB from BIT() to BIT_ULL(), preserving 64-bit masks under LLP64. The inherited trace showed blobHead with the high DRAM bits present and topOfKernelData with those bits lost after page-rounding-related arithmetic, making this a tightly evidenced type-width repair. No proof gate, timeout, or Definition of Done was weakened.

The mandatory qemu-sptm Windows Gate 35347936254 subsequently completed successfully on the exact target commit. The shift's recovery handoff is accepted because the journal explicitly records forced automation-runtime termination while the external build remained observable only beyond the available runtime; this is the protocol's recovery exception, not an ordinary voluntary CI handoff.

Scoring: verified useful progress 4/4; engineering quality 3/3; efficiency/focus 1/2; handoff 1/1. One efficiency point is withheld because terminal E2E evidence was not consumed in the shift, even though the forced-stop recovery itself was valid. Continuation 029 is correctly scoped to consume the terminal gate and exact E2E before any further semantic change.
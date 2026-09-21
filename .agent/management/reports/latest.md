# Manager report — DEC-087

Object: `ios-research-runtime`
Health: RED
Decision: CHANGE_COURSE
Active directive: DIR-035

Production is idle (NO_WORKER). Manager review confirmed a control-plane fencing integrity defect, not an ambiguous timestamp ordering: stale-worker recovery/fence commit `d8681f004c84d1536c5c1cc65a557aa0a45c9c73` landed at 2026-09-21T19:46:02Z, then the fenced shift-154 execution published checkpoint `fde4f271641096f20249686f0bd730c2d1a7241f` at 2026-09-21T19:46:15Z as a descendant of that recovery anchor.

The checkpoint contains useful APFS evidence (extentref conservation explains the earlier 719-vs-1360 divergence), but its post-fence publication proves that stale execution could still mutate orchestration state. That integrity defect takes precedence over further APFS work.

DIR-035 therefore stops NEW production shifts until the exact stale-worker write path is made fail-closed against current fence/generation ownership and a regression plus exact runtime validation prove the fix. No validator, stale-recovery, Reporting v2, OTK, lease, GitHub-time, or scheduler invariant may be weakened.

After that gate is green, independently revalidate the useful shift-154 APFS evidence and resume DIR-029 from the new discriminator boundary; do not repeat closed extentref-count/conservation hypotheses.

No owner decision or transfer is required. Scheduled Tasks remain untouched.

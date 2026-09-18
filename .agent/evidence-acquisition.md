# Evidence Acquisition and Shift Closure Policy

## Purpose

A production event is an entry point into a causal engineering chain, not a micro-task boundary.
A worker keeps the same shift while there is a directly justified next action that the current live Chat can perform.

Discovering the next blocker is not, by itself, a natural stop condition.

## Actionable-next-step test

Before ending a production shift, the worker MUST answer:

> Is there any evidence-backed next action on the same active object that I can perform now with the available tools?

If YES, the shift continues.

Examples of actionable next steps:
- inspect terminal CI/build/test evidence;
- inspect the failing stage or exact diff that produced the failure;
- test the next directly implied hypothesis;
- make a minimal evidenced repair and verify it;
- add a safe diagnostic needed to distinguish remaining hypotheses;
- obtain equivalent evidence through another available GitHub/API/repository route.

The worker may stop only when the answer is NO and a natural stop condition from `.agent/workflow.md` is proven.

## Evidence-acquisition ladder

Before claiming that required evidence is unavailable or declaring BLOCKED, exhaust the applicable routes below:

1. exact workflow/run/job status and step metadata;
2. job logs or durable extracted log fragments available through current tools;
3. workflow artifacts or artifact metadata available through current tools;
4. repository-persisted diagnostics, reports, journals, generated dumps or test outputs;
5. producer/consumer source inspection that can prove or eliminate a hypothesis without the missing artifact;
6. related prior runs, diffs and known-good/known-bad evidence;
7. a safe diagnostic change or workflow instrumentation that can generate the missing evidence without weakening gates;
8. any equivalent evidence route already available in the connected GitHub/tool surface.

Do not repeat a route that is already proven unavailable unless circumstances changed.

## BLOCKED standard

BLOCKED is valid only when:
- the exact missing evidence or external capability is named;
- the applicable ladder routes were attempted or explicitly shown inapplicable;
- no directly actionable next step remains;
- the required external/owner/manager action is stated precisely.

"Artifact not available through the first attempted call" is not enough.

## Shift-end record

For shift policy v2, every supervisor-review event created by production MUST include:

```json
{
  "shift_policy_version": 2,
  "stop": {
    "kind": "project_or_phase_complete | blocked | forced_stop | speculation_boundary",
    "actionable_next_step": false,
    "reason": "specific evidence-based reason"
  }
}
```

Additional requirements:
- `blocked`: include non-empty `exhaustion_evidence` array and `external_action`;
- `speculation_boundary`: include non-empty `exhaustion_evidence` array;
- `forced_stop`: identify the platform/tool/runtime constraint;
- if duration is under the configured short-shift review threshold and unresolved work/continuation remains, include `short_shift_justification`.

Time is a review trigger, not a work quota. A 40-second shift can be valid only if its closure is genuinely proven.

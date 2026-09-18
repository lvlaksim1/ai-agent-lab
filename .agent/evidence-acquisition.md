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

## Forced-stop standard

`forced_stop` means the runtime/tooling has objectively begun preventing the current worker from continuing. It is NOT a prediction that the turn may end soon.

Valid forced-stop evidence must be independently reviewable and must contain at least one observed signal such as:
- an explicit platform/runtime execution-deadline, cancellation or termination signal;
- an actual tool call that fails because the execution environment is terminating or the required tool surface has become unavailable;
- another concrete platform/tool signal that makes continued polling or engineering action impossible now.

The following are NOT forced-stop evidence:
- elapsed wall-clock time;
- an approaching scheduler tick;
- the fact that the Chat is non-interactive or scheduled;
- CI/build/test still being pending;
- a belief that the automation turn will probably end soon;
- choosing a convenient clean handoff while GitHub/tool calls still work.

If the worker can still read GitHub, write GitHub, poll CI, inspect evidence, or perform another justified tool call, the worker is still operational and MUST continue.

Before a potentially long external wait, the worker SHOULD persist an intermediate checkpoint without releasing the lease or ending the shift. If the platform then terminates abruptly before the worker can write a normal shift end, recovery is performed from the checkpoint after the lease expires. Abrupt termination does not need to be predicted in advance.

For policy v3, a forced-stop review record MUST contain a non-empty `stop.forced_stop_evidence` array. Each item must contain:
- `kind`: `platform_signal`, `tool_timeout`, `tool_termination` or `tool_unavailable`;
- `observed_at_utc`: timestamp of the observed signal;
- `detail`: the concrete signal/error, sufficient for OTK to verify it independently.

OTK must independently verify the evidence. If the worker continued making successful ordinary tool/GitHub calls after the claimed forced-stop signal without a documented reason those calls were recovery-only, the forced-stop claim is presumptively invalid.

## Shift-end record

For shift policy v3, every supervisor-review event created by production MUST include:

```json
{
  "shift_policy_version": 3,
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
- `forced_stop`: include non-empty objective `forced_stop_evidence` as defined above; a prediction of termination is invalid;
- if duration is under the configured short-shift review threshold and unresolved work/continuation remains, include `short_shift_justification`.

Time is a review trigger, not a work quota. A 40-second shift can be valid only if its closure is genuinely proven.

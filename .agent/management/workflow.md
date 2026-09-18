# Manager Workflow

This workflow is executed only by the dedicated manager Scheduled Chat.

## 0. Idle path

First read ONLY .agent/management/wake.json.

If attention=false:
- read nothing else;
- change nothing;
- finish exactly MANAGER_IDLE.

If attention=true, remember its generation and continue.

## 1. Load management context

Read:
- .agent/management/charter.md
- .agent/management/state.json
- .agent/assignment.json
- .agent/objects/index.json
- .agent/transfer/request.json
- active object's object.json, mission.md, state.json and handoff.md
- .agent/brigade.json
- .agent/reports/latest.md
- applicable management directive
- recent OTK/repository evidence only as needed
- .agent/state.json to know whether a production/OTK event is processing
- pending queue metadata only when transfer/drain status requires it

## 2. Transfer request has first managerial priority

If .agent/transfer/request.json has active=true, process the transfer before ordinary management review.

### 2.1 Validate/register target

Target object must either:
- already exist in objects/index.json, or
- be registered from explicit request metadata: object id/name, repository/ref and owner goal/handoff.

Never invent a product goal merely to complete a transfer.
If essential target identity/goal is missing, set owner_decision_required=true, keep request active and report the missing owner decision.

### 2.2 Start NORMAL transfer

For mode NORMAL:
- set assignment.transfer_state=requested if still working;
- set requested_object/mode/request metadata;
- do not start new production work on old object.

If .agent/state.json says processing, set transfer_state=draining and wait.

If an eligible supervisor-review for the old active object is still pending, set transfer_state=draining and wait.

During draining, do not alter the running worker's instructions.
OTK remains allowed to finish the last shift.

### 2.3 Complete NORMAL transfer when drained

When production state is idle AND no supervisor-review for the old active object remains:

1. set assignment.transfer_state=switching;
2. write a fresh conservation checkpoint:
   .agent/objects/<old>/checkpoints/<timestamp-or-sequence>.md
3. replace old object's handoff.md with a concise, evidence-based resume package:
   - mission/DoD reference;
   - verified current state;
   - current blocker;
   - useful evidence/recent progress;
   - dead ends / things not to repeat;
   - active directive if any;
   - exact recommended next action;
   - stale assumptions that must be revalidated on return.
4. update old object state/status to PAUSED and paused_at.
5. update registry old object status to PAUSED.
6. update target object status to ACTIVE, activated_at and activation_count.
7. update registry target status to ACTIVE.
8. set assignment.active_object to target and clear requested fields; keep switching until wake is reconciled.
9. load target object's saved phase/health/blocker into .agent/management/state.json and set active_object.
10. inspect pending queue for target object:
    - old queued continuations are NOT blindly trusted after a pause;
    - revalidate them against target handoff/current repo before allowing direct execution.
11. if no safe eligible target event exists, create exactly one object-intake event with object_id=target:
    goal = read mission/handoff, verify current external state, identify first real blocker/highest-value action, then continue only from verified evidence.
12. set .agent/wake.json pending=true and advance generation for the new active object.
13. close transfer/request.json.
14. set assignment.transfer_state=working and record last_transfer.
15. clear stop_production unless the target itself has an independent STOP condition.

### 2.4 EMERGENCY transfer

For mode EMERGENCY:
- set stop_production=true and assignment away from working immediately;
- do not forcibly interrupt an already executing Chat;
- wait for its safe persistence;
- OTK may complete/review the last shift if needed for evidence integrity;
- then conserve and switch using the same checkpoint rules.

Emergency mode is only for proven integrity/destructive/owner-goal violations.

## 3. Ordinary project review

If no active transfer request, assess the active object:
- progress toward owner goal/DoD;
- whether recent shifts produced verified new information;
- repeated blocker cost;
- OTK correction/remediation pattern;
- architecture/scope drift;
- milestone/release readiness;
- need for owner decision.

Health:
GREEN, YELLOW, ORANGE, RED or BLOCKED.

## 4. Decide

Write one management decision:
.agent/management/decisions/DEC-<sequence>.md

If no intervention is needed: KEEP_COURSE.

If intervention is needed, create/update exactly one directive:
.agent/management/directives/DIR-<sequence>.md

Every directive MUST name object_id.
Normal directive effective_from=NEXT_SHIFT.
Emergency STOP requires evidence.

## 5. Update state

SHA/CAS update .agent/management/state.json:
- active_object;
- project/project_name/target_ref from active object;
- health;
- current_phase;
- current_blocker_summary;
- manager_review_count += 1 for an actual management review;
- last_manager_review_at;
- last_manager_decision;
- active_directive;
- owner_decision_required;
- stop_production;
- shifts_since_manager_review reset after review;
- consecutive counters handled according to evidence.

Also mirror meaningful active-object status into:
.agent/objects/<active>/state.json

Write concise manager report:
.agent/management/reports/latest.md

Do not alter brigade ratings.

## 6. Reconcile manager wake

Re-read .agent/management/wake.json.
Set attention=false only if its generation is unchanged AND no transfer remains requested/draining/switching AND no owner decision remains pending.
Otherwise preserve attention=true and newer reasons.

Never overwrite a newer generation.

## 7. Stop

One manager tick performs at most one management review/transfer step.
Never process a production queue event as a worker.
Never mutate Scheduled Tasks.
Never use Work.

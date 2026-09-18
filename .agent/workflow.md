# Worker Workflow

This workflow is used only after .agent/wake.json says production/OTK work is pending.

## 0. Immutable scheduler rule

Never mutate Scheduled Tasks. Never use Work. Dynamic orchestration is GitHub state only.

## 1. Resolve eligible work

1. Read .agent/config.json, .agent/state.json, .agent/assignment.json, .agent/objects/index.json and list JSON files in .agent/queue/pending/.
2. Ignore .gitkeep and non-JSON files.
3. Resolve each event's object:
   - use event.object_id when present;
   - legacy fallback is allowed only when target.repository matches exactly one registered object.
4. Eligible events:
   - supervisor-review whose object is assignment.active_object;
   - ordinary production event whose object is assignment.active_object AND assignment.transfer_state=working.
5. If there is no eligible event, reconcile .agent/wake.json using .agent/protocol.md and stop.
6. Select exactly one eligible event: highest priority, then oldest created_at, then lexical id.
7. For a normal production event, read .agent/management/state.json.
   - If stop_production=true, do not claim it. Leave the event durable and stop with PRODUCTION_STOPPED_BY_MANAGER.
   - If active_directive is non-null, read it and apply it only if its object_id matches assignment.active_object and its effective boundary includes this new shift.
8. Claim by SHA/CAS update of .agent/state.json from idle to processing.
9. If state has an unexpired processing lease, stop. Expired lease recovery must be journaled.

## 2A. Normal production shift

1. Confirm the selected event belongs to assignment.active_object.
2. Read the active object's mission/state/handoff as needed:
   .agent/objects/<object-id>/
3. Read .agent/brigade.json and .agent/competition.md.
4. Assign the shift to next_member_id. Proposed shift number is shift_counter + 1. Worker does not score itself.
5. Read event, profile, applicable manager directive and only required target evidence.
6. Reconstruct intended behavior, attack the first real blocker, make the smallest justified change and verify it.
7. Never weaken tests, proof gates, Definition of Done or anti-cheat controls.
8. Any continuation event MUST inherit the same object_id.
9. Write technical journal and internal shift report. The internal shift report should also be in first person from the assigned worker, technically accurate but readable, so OTK can preserve that voice when producing the final human report.
10. ALWAYS enqueue exactly one supervisor-review with priority 100 and the same object_id. Include reviewed event, worker identity, proposed shift number, evidence references, target/ref and continuation id if any.
11. Do not update human latest.md during production. Telegram is emitted only after OTK.

## 2B. Supervisor review / OTK

For type=supervisor-review follow .agent/supervision.md and .agent/competition.md.

OTK remains eligible while a NORMAL transfer is draining so the last shift can be accepted cleanly.

## 3. Persist result

Create .agent/queue/done/<event-id>.json with durable result metadata including object_id.
Delete only the corresponding pending event.
Return .agent/state.json to idle.

## 4. Reconcile production wake

Use .agent/protocol.md object-aware eligibility rules.

Do not keep wake pending merely because paused-object backlog exists.
Do not erase a newer generation written concurrently.

## 5. Source reply

Reply to GitHub issue/PR sources only after persistent state is safe.

## 6. Stop

Process only one eligible event in one scheduled run.

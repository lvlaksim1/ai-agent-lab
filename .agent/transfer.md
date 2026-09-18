# Brigade Object Transfer Policy

## Principle

The brigade, OTK rules and worker ratings are global and persistent.
Project work is isolated into registered objects.
A transfer moves the assignment pointer; it never resets the brigade and never rewrites another object's history.

Authoritative files:
- .agent/assignment.json — where the brigade is assigned now
- .agent/objects/index.json — registered objects
- .agent/objects/<object-id>/ — durable project capsule
- .agent/transfer/request.json — owner/manager transfer request

Production events use the central transport queue but MUST carry object_id.
Paused-object events may remain queued; they are ineligible until that object is active again.

## Object states

NEW — registered but never worked.
ACTIVE — current brigade object.
PAUSED — conserved and waiting for reassignment.
ARCHIVED — no further work expected unless explicitly restored.

Exactly one object may be ACTIVE.

## Transfer states

working — normal production allowed on active_object.
requested — owner/manager requested another object; do not start a new production shift.
draining — current shift/OTK is being safely finished; do not start another production shift.
switching — manager is writing checkpoint and moving assignment.

## NORMAL transfer

1. Owner/interactive manager records the active transfer request, immediately sets assignment.transfer_state=requested with the target/mode metadata, and raises management wake. These three writes are one logical request operation and should be committed atomically when possible.
2. From that moment no NEW ordinary production shift is eligible on the old object.
3. Manager validates the request. If a production shift is already processing or its OTK review is still pending, manager sets transfer_state=draining and waits.
4. Current shift is allowed to finish. OTK scores it normally.
5. No new production shift starts on the old object.
6. Manager writes a fresh handoff/checkpoint for the old object.
7. Old object becomes PAUSED.
8. Target object becomes ACTIVE.
9. assignment.active_object changes atomically with the managerial switch as closely as GitHub CAS permits.
10. Manager loads the target object's saved mission/state into active management context.
11. Existing queued events for the target object become eligible.
12. If no eligible target event exists, manager creates exactly one object-intake production event.
13. Production wake is raised for the new active object.
14. Transfer request is closed and assignment returns to working.

## EMERGENCY transfer

Emergency transfer prevents any NEW production shift immediately by setting stop_production or transfer_state away from working.
A Chat already executing is not forcibly interrupted; it must finish safely and persist its journal.
Emergency mode is reserved for proven integrity, destructive-change or owner-goal violations.

## Resume rules

On return to a PAUSED object:
- read mission, saved state and handoff first;
- revalidate stale assumptions against current repository/CI state;
- do not blindly execute an old continuation if the external state changed;
- first shift may be an intake/revalidation shift and can score highly for removing uncertainty even without a code change.

## Ratings

Ratings never reset on transfer.
No bonus exists merely for changing projects.
Only independently verified useful work earns points.

## Wake behavior

Production wake concerns only events eligible for the currently active object.
Pending events belonging to PAUSED objects do not keep production awake.
The manager is responsible for raising production wake after activation/resume.

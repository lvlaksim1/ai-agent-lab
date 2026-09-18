# DEC-20260918-objects

- **Status:** ACTIVE
- **Type:** DECISION
- Global brigade/rating; project execution state is object-scoped under `.agent/objects/`.
- `.agent/assignment.json` points to one active object.
- Normal transfer drains current work + OTK, checkpoints/handoffs old object, then switches.
- Continuations/evidence never silently retarget across objects.

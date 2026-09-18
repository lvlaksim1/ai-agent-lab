# Manager Workflow

This workflow is executed only by the dedicated manager Scheduled Chat.

## 0. Idle path

First read ONLY `.agent/management/wake.json`.

If `attention=false`:
- read nothing else;
- change nothing;
- finish exactly with `MANAGER_IDLE`.

If `attention=true`, remember its `generation` and continue.

## 1. Load management context

Read:
- `.agent/management/charter.md`;
- `.agent/management/state.json`;
- `.agent/brigade.json`;
- `.agent/reports/latest.md`;
- the active management directive, if any;
- recent OTK reviews / journals only as needed;
- target repository evidence only as needed.

Read `.agent/state.json` to know whether a production event is currently processing.

## 2. Evaluate the project

Assess:
- progress toward the owner's goal and Definition of Done;
- whether recent shifts produced verified new information;
- whether the same blocker is consuming too many shifts;
- whether OTK corrections/remediations reveal process drift;
- whether the current technical direction is still justified;
- whether scope or architecture is drifting;
- whether a milestone or release candidate is genuinely reached;
- whether an owner decision is required.

Use health exactly:
- GREEN — verified progress, normal direction;
- YELLOW — progress exists but cost/risk is rising;
- ORANGE — repeated work, weak progress or course correction needed;
- RED — current direction is materially wrong or harmful;
- BLOCKED — genuine external blocker.

## 3. Decide

Write one management decision record under:
`.agent/management/decisions/DEC-<sequence>.md`

The decision must state:
- current health;
- evidence checked;
- managerial conclusion;
- whether course changes;
- whether owner action is required.

If no intervention is needed, record KEEP_COURSE.

If intervention is needed, create/update exactly one active directive under:
`.agent/management/directives/DIR-<sequence>.md`

A normal directive is `effective_from: NEXT_SHIFT`.
Never change instructions for a currently processing production event.

Emergency STOP is allowed only for a proven integrity/safety/goal violation. If used, set `stop_production=true` and explain why.

## 4. Update state

Update `.agent/management/state.json` with SHA/CAS:
- health;
- current_phase;
- current_blocker_summary;
- manager_review_count += 1;
- last_manager_review_at;
- last_manager_decision;
- active_directive;
- owner_decision_required;
- stop_production;
- shifts_since_manager_review = 0;
- consecutive_no_progress = 0 only if the managerial review explicitly changes course or confirms that the counter was no longer meaningful; otherwise preserve it;
- consecutive_corrected = 0 after the manager has reviewed the correction pattern.

Write a concise management report to:
`.agent/management/reports/latest.md`

Do not alter brigade ratings.

## 5. Reconcile manager wake

Re-read `.agent/management/wake.json`.

Set `attention=false` only if its generation is still the generation remembered at start.
If another producer advanced generation, preserve `attention=true` and the newer reasons.

Never overwrite a newer wake generation.

## 6. Stop

One manager tick performs at most one management review.
Never process production queue events.
Never modify Scheduled Tasks.
Never use Work.

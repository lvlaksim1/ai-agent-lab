# Worker Workflow

This workflow is used only after `.agent/wake.json` says work is pending.

## 0. Immutable scheduler rule

The scheduler is an immutable clock. Never create, update, re-arm, enable, disable or reschedule Scheduled Tasks during a worker run. All coordination happens through GitHub.

## 1. Claim

1. Read `.agent/config.json`, `.agent/state.json` and list JSON files in `.agent/queue/pending/`.
2. Ignore `.gitkeep` and non-JSON files.
3. If the queue is empty, reconcile `.agent/wake.json` according to `.agent/protocol.md` and stop.
4. Select exactly one event: highest numeric `priority` first; for equal priority, oldest `created_at` first.
5. If selected event is NOT `supervisor-review`, read `.agent/management/state.json`.
   - If `stop_production=true`, do not claim the production event; leave queue/wake intact and stop with `PRODUCTION_STOPPED_BY_MANAGER`.
   - If `active_directive` is non-null, read that directive and apply it if its effective boundary includes this new shift.
6. Claim work by updating `.agent/state.json` from `idle` to `processing` with `active_event`, `worker_id`, `started_at`, and `lease_until`.
7. Use current GitHub blob SHA. On conflict, another worker won: stop.
8. If state is already processing with an unexpired lease, stop. Expired lease recovery must be journaled.

## 2. Execute

### 2A. Normal production shift

For any event whose `type` is not `supervisor-review`:

1. Read `.agent/brigade.json` and `.agent/competition.md`.
2. Assign this shift to `next_member_id`. Proposed shift number is `shift_counter + 1`. Do NOT change brigade rating yet.
3. Read the selected event, `.agent/profile.md`, applicable manager directive, and only required target evidence.
4. Reconstruct intended behavior, identify the real blocker, make the smallest justified change, verify against relevant evidence.
5. Do not weaken tests/specifications/proof/release gates.
6. For a long mission, create at most one continuation event if more work remains.
7. Write technical journal `.agent/journal/<event-id>.md`.
8. Write concise internal shift report `.agent/reports/<event-id>.md` containing the assigned brigade member and proposed shift number plus a non-technical Russian summary.
9. ALWAYS enqueue exactly one `supervisor-review` event with priority 100 for every production shift. It must reference:
   - reviewed event id;
   - assigned brigade member id/name;
   - proposed shift number;
   - report/journal paths;
   - target repository/ref;
   - commits and CI evidence;
   - continuation event id, if any.
10. Do NOT update `.agent/reports/latest.md` during the production shift. Telegram report is published only after independent ОТК scoring.

### 2B. Supervisor review / ОТК

For `type=supervisor-review`, follow `.agent/supervision.md` and `.agent/competition.md`.

The supervisor independently checks evidence and scores the reviewed production shift. It must never accept the worker's self-assessment as proof.

After verdict/scoring:
1. update `.agent/brigade.json` using current blob SHA;
2. increment `shift_counter` exactly once for the reviewed production shift;
3. update that worker's rating/statistics;
4. advance `next_member_id` exactly one position;
5. write the private review to `.agent/reviews/<reviewed-event-id>.md`;
6. update `.agent/reports/latest.md` in the strict four-field human format defined in `.agent/competition.md`;
7. update management counters and manager wake exactly as defined in `.agent/supervision.md`.

This `latest.md` update is the Telegram notification trigger.

## 3. Persist result

Create `.agent/queue/done/<event-id>.json` with schema_version, id, status, completed_at, worker_id, summary, journal and optional result.

Delete the corresponding pending JSON file.
Return `.agent/state.json` to idle.

## 4. Reconcile wake flag

Use generation/CAS rules in `.agent/protocol.md`.

Keep pending=true if pending events remain or generation advanced.
Set pending=false only when queue is empty and generation did not advance.
On SHA conflict, re-read and preserve newer state.

## 5. Source reply

For GitHub issue/PR comment sources, report completion only after persistent state is safe. Never use `[AGENT_TASK]` in result replies.

## 6. Stop

Process only one event in one scheduled run.

# Worker Workflow

This workflow is used only after `.agent/wake.json` says work is pending.

## 0. Immutable scheduler rule

The scheduler is an immutable clock. Never create, update, re-arm, enable, disable or reschedule Scheduled Tasks during a worker run. All coordination happens through GitHub.

## 1. Claim

1. Read `.agent/config.json`, `.agent/state.json` and list JSON files in `.agent/queue/pending/`.
2. Ignore `.gitkeep` and non-JSON files.
3. If the queue is empty, reconcile `.agent/wake.json` according to `.agent/protocol.md` and stop.
4. Select exactly one event: highest numeric `priority` first; for equal priority, oldest `created_at` first.
5. Claim work by updating `.agent/state.json` from `idle` to `processing` with:
   - `active_event`;
   - `worker_id`;
   - `started_at`;
   - `lease_until`.
6. The state update must use the current GitHub blob SHA. If it conflicts, another worker won the claim: stop without processing the event.
7. If state is already `processing` and its lease has not expired, stop. If the lease expired, recovery is allowed and must be recorded in the journal.

## 2. Execute

1. Read the selected event, `.agent/profile.md` and only the repository files required by the event.
2. Reconstruct the intended behavior before changing anything.
3. Identify the root cause or required change.
4. Make the smallest justified modification.
5. Verify against every supplied test/evidence relevant to the event.
6. Do not weaken specifications, configuration or tests merely to make verification pass.

## 3. Persist result

Write `.agent/journal/<event-id>.md` containing:
- event/source;
- evidence inspected;
- reasoning summary;
- root cause;
- changes;
- verification;
- blockers, if any.

Create `.agent/queue/done/<event-id>.json` with:
- `schema_version`;
- `id`;
- `status` = `done` or `blocked`;
- `completed_at`;
- `worker_id`;
- short `summary`;
- `journal` path;
- optional `result` path/reference.

Delete the corresponding pending JSON file.
Return `.agent/state.json` to `idle`.

## 4. Reconcile wake flag

Use the generation/CAS rules in `.agent/protocol.md`.

- If another pending event exists, keep `pending=true`.
- Set `pending=false` only when the pending queue is empty and no producer advanced `generation` while this run was working.
- If a wake update conflicts, re-read it. Never overwrite a newer producer generation.

## 5. Report to source

After persistent state is safely written, report the outcome when the source supports a reply.

For `source.kind=github_issue_comment`:
- add one top-level comment to the same PR/issue;
- first line: `[AGENT_RESULT] <event-id> <status>`;
- second line: the same concise summary stored in the done record;
- do not use the `[AGENT_TASK]` prefix.

If reporting fails, do not roll back a successfully completed task. Record/reporting failure in the journal on the next recovery opportunity.

## 6. Stop

Process only one event in one scheduled run.

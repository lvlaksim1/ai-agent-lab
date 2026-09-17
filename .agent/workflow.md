# Worker Workflow

For each run:

1. Look in `.agent/queue/pending/` and select exactly one pending event.
2. Read the event and set `.agent/state.json` to `processing` with the event id.
3. Read only the repository files required by that event plus this profile/workflow.
4. Reconstruct the intended behavior before changing anything.
5. Identify the root cause and make the smallest justified code change.
6. Verify the resulting behavior against every test case supplied by the fixture. Show the calculations used for verification.
7. Write `.agent/journal/<event-id>.md` with evidence, root cause, change, and verification.
8. Move the queue item logically to done by deleting the pending file and creating `.agent/queue/done/<event-id>.json` with status `done` and a short result.
9. Set `.agent/state.json` back to `idle`.
10. Stop. Do not process a second event in the same run.

If blocked, do not modify the target code. Record the blocker in the journal and done event with status `blocked`, then return state to `idle`.

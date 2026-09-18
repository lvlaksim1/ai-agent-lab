# Cross-repository Agent Intake

The agent runtime lives in `lvlaksim1/ai-agent-lab`, but source events may originate from any GitHub repository.

## Transport

```text
source repository event
→ source GitHub Actions workflow
→ reusable forward-to-agent workflow
→ repository_dispatch: agent-task
→ ai-agent-lab Agent Intake
→ .agent/queue/pending + wake.json
→ next immutable native Scheduled Chat tick
```

No OpenAI API and no Work are involved.

## Required secret

Each source repository that forwards events needs a secret named:

```text
AI_AGENT_TOKEN
```

It must be a GitHub token that is allowed to create a `repository_dispatch` event in `lvlaksim1/ai-agent-lab`.

The token is used only by the deterministic GitHub Actions transport. It is never stored in the agent queue.

## Example: failed CI

Place this workflow in a source repository:

```yaml
name: Send failed CI to AI Agent

on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]

jobs:
  send:
    if: github.event.workflow_run.conclusion == 'failure'
    uses: lvlaksim1/ai-agent-lab/.github/workflows/forward-to-agent.yml@main
    with:
      event_id: ci-${{ github.event.workflow_run.id }}
      event_type: ci-failure
      priority: 80
      target_repository: ${{ github.repository }}
      target_ref: ${{ github.event.workflow_run.head_branch }}
      goal: >-
        Diagnose the failed CI run ${{ github.event.workflow_run.html_url }}.
        Find the first real root cause, make the smallest justified fix,
        verify it, and record the result.
      constraints_json: >-
        ["Do not weaken tests to make CI pass","Do not perform unrelated refactoring"]
    secrets:
      AGENT_TOKEN: ${{ secrets.AI_AGENT_TOKEN }}
```

## Example: explicit task comment in another repository

```yaml
name: Forward Agent Task Comment

on:
  issue_comment:
    types: [created]

jobs:
  send:
    if: >-
      github.event.comment.user.login == github.repository_owner &&
      startsWith(github.event.comment.body, '[AGENT_TASK]')
    uses: lvlaksim1/ai-agent-lab/.github/workflows/forward-to-agent.yml@main
    with:
      event_id: comment-${{ github.event.comment.id }}
      event_type: github-comment-task
      priority: 50
      target_repository: ${{ github.repository }}
      target_ref: main
      goal: ${{ github.event.comment.body }}
    secrets:
      AGENT_TOKEN: ${{ secrets.AI_AGENT_TOKEN }}
```

For task comments, the caller may keep the `[AGENT_TASK]` marker in the goal. The worker treats the queue event as authoritative.

## Normalized metadata

The central queue records:

- source repository;
- source event/action;
- source ref/SHA;
- source workflow run id and URL;
- source actor;
- target repository/ref;
- event type, goal, priority, files and constraints.

Thus the ordinary-Chat worker does not need to infer where the task came from.

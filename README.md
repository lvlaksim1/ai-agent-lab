# AI Agent Lab

Изолированная лаборатория для разработки автономного AI-агента на ChatGPT Plus без OpenAI API и без Work.

## Текущая архитектура

```text
external GitHub event
→ deterministic GitHub Actions intake
→ .agent/queue/pending + .agent/wake.json
→ immutable native recurring Scheduled Chat workers
→ ordinary Chat reasoning
→ GitHub state / code / journal / done
```

GitHub является внешним persistent state, очередью, state machine, журналом и event bus. Scheduled Tasks — только неизменяемые облачные часы. Ordinary Chat выполняет reasoning.

## Idle path

Каждый worker сначала читает только:

```text
.agent/wake.json
```

Если `pending=false`, run немедленно завершается. Полный профиль, workflow и очередь читаются только при наличии работы.

## Worker pool

Production topology рассчитана на пять неизменяемых hourly Scheduled Chat workers, сдвинутых примерно на 12 минут:

```text
:11
:23
:35
:47
:59
```

Каждый worker имеет тот же prompt и использует SHA-guarded lease в `.agent/state.json`. Поэтому одновременно обработать одно событие два worker не должны.

Максимальная ожидаемая задержка до следующего штатного tick после заполнения очереди — примерно 12 минут плюс фактический scheduler lag.

## Cross-repository intake

Другие GitHub repositories могут отправлять нормализованные события через reusable workflow:

```text
lvlaksim1/ai-agent-lab/.github/workflows/forward-to-agent.yml@main
```

Транспорт использует GitHub `repository_dispatch`. Подробности и готовые примеры: `docs/CROSS_REPO_INTAKE.md`.

## Первый автономный end-to-end

18 сентября 2026 года подтверждён полный цикл без Work:

```text
GitHub PR comment [AGENT_TASK]
→ Agent Intake GitHub Action
→ pending event + wake generation
→ immutable recurring native Scheduled Chat
→ ordinary Chat worker
→ target change
→ journal + done + state idle + wake false
```

Контрольный файл:

`.agent/e2e/first-autonomous-run.json`

содержит:

`{"status":"ok","executor":"native-scheduled-chat"}`

Подробный протокол: `.agent/protocol.md`.
Постоянный prompt worker: `.agent/scheduled-worker.md`.

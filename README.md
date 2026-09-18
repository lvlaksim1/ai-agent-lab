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

## Production topology v2

Цех использует пять активных Scheduled Tasks без увеличения лимита платформы:

```text
production relay: :02
production relay: :17
production relay: :32
production relay: :47
manager:          :59
```

Восемь логических работников ротируются независимо от clock slots: Петрович, Саныч, Михалыч, Борисыч, Иваныч, Федорыч, Кузьмич и Палыч.

Два production-worker одновременно никогда не работают: единый SHA-guarded lease в `.agent/state.json` допускает только одного сменщика.

Для устранения потерь времени введён эстафетный цикл. Если tick первым видит ОТК предыдущей смены, он сначала независимо завершает ОТК, а затем в том же Chat может последовательно запустить ровно одну следующую производственную смену. Если tick начал с production, он после своей смены останавливается и не имеет права проверять себя сам.

Начальник участка живёт на отдельном management-контуре и может работать одновременно с одним сменщиком. Это единственная разрешённая параллельность.

Штатный production clock теперь приходит каждые 15 минут плюс фактический scheduler lag.

Подробности: `.agent/production-topology.md`.

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

# AI Agent Lab

Изолированная лаборатория для разработки автономного AI-агента на ChatGPT Plus без OpenAI API и без Work.

## Текущая архитектура

```text
external event
→ GitHub intake
→ .agent/queue/pending + .agent/wake.json
→ native recurring Scheduled Chat
→ ordinary Chat worker
→ GitHub state / code / journal / done
```

Ключевой принцип: scheduler после создания не изменяется. Никаких re-arm/update для пробуждения worker.

GitHub является внешним persistent state агента. Ordinary Chat выполняет reasoning. Scheduled Task используется только как неизменяемые облачные часы.

## Быстрый путь

Worker на каждом штатном тике сначала читает только:

```text
.agent/wake.json
```

Если `pending=false`, run немедленно завершается. Полный профиль, workflow и очередь читаются только при наличии работы.

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

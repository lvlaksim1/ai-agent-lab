# AI Agent Lab

Лаборатория и управляющий репозиторий автономного AI-цеха на ChatGPT Plus и GitHub.

Актуальный runtime и Project Context Capsule живут в ветке `work-webhook-test`.

## Текущая архитектура

```text
GitHub event
→ GitHub Actions intake
→ durable queue/wake/state in GitHub
→ immutable native Scheduled Chat
→ ordinary Chat reasoning
→ GitHub code/state/journal
```

Work не используется как production reasoning path. Runtime не мутирует Scheduled Tasks.

## Project Context Capsule

Перед любой существенной работой новый Chat должен прочитать `AI_CONTEXT.md`.

Полная стандартная Project Context Capsule v1.0 находится в этом же репозитории, в ветке `work-webhook-test`, под `.context/`.

Обычная команда:

`восстанови Project Context Capsule и продолжи проект https://github.com/lvlaksim1/ai-agent-lab`

## Вызов начальника участка

```text
вызываю начальника участка https://github.com/lvlaksim1/ai-agent-lab
```

Точка входа: `MANAGER_ENTRYPOINT.md`. Она сначала восстанавливает Project Context Capsule, затем постоянную личность и live management/runtime state.

## Универсальный установщик Capsule

Универсальная инструкция для других репозиториев:
- `CONTEXT_CAPSULE_INSTALL_PROMPT.md`
- `docs/PROJECT_CONTEXT_CAPSULE_SPEC.md`

После установки каждый целевой репозиторий хранит свою Capsule локально и не зависит от AI Agent Lab как внешней памяти.

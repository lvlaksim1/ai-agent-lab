# AI Agent Lab

Изолированная лаборатория для разработки event-driven AI-агента на ChatGPT Plus без OpenAI API.

Текущая подтверждённая архитектура:

`GitHub event → Work dispatcher → re-arm ordinary Chat Scheduled Task → Chat worker → GitHub state/results`

Репозиторий используется только для безопасных инфраструктурных экспериментов и хранения состояния будущего агента.

## Вызов начальника участка

В новом обычном Chat достаточно написать:

```text
вызываю начальника участка https://github.com/lvlaksim1/ai-agent-lab
```

Точка входа: `MANAGER_ENTRYPOINT.md`. Она переводит Chat на актуальный runtime в ветке `work-webhook-test` и восстанавливает постоянную личность, управленческое состояние, активный объект, бригаду и текущие директивы из GitHub.

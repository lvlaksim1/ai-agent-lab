# Project Context Capsule — Specification v1.0

Project Context Capsule — это GitHub-backed persistent context protocol для продолжения разработки между независимыми ChatGPT-диалогами.

## Цель

Сделать конкретный Chat расходным вычислительным экземпляром. Долговременная память проекта принадлежит репозиторию.

Новый Chat должен быстро восстановить:
- identity проекта;
- goals/Definition of Done;
- constraints/rules;
- current state;
- blockers;
- latest handoff;
- активные решения;
- индекс прошлых диалогов;
а затем при необходимости углубиться в исторические records и Git evidence.

## Архитектурный принцип

```text
Chat N
  ↓ semantic persistence
GitHub Context Capsule
  ↓ bootstrap
Chat N+1
```

Bootstrap должен быть малым. История может быть большой.

```text
L0 Discovery     AI_CONTEXT.md
L1 Bootstrap     ENTRYPOINT + manifest
L2 Working set   current + rules + latest handoff
L3 History       decisions + dialogues
L4 Evidence      Git commits/PR/issues/CI/artifacts/raw exports
```

## Гарантия

Capsule гарантирует восстановление только того контекста, который:
- был сохранён одним из участвующих Chat;
- присутствует в GitHub;
- или был импортирован из предоставленных пользователем исторических источников.

Она не предоставляет скрытый доступ к разговорам ChatGPT, которые не были сохранены или импортированы.

## Ключевое свойство

Новый Chat читает не всю историю, а сначала компактный authoritative working set. История загружается demand-driven.

Это позволяет использовать механизм в проектах с сотнями Chat-сессий без постоянного раздувания bootstrap-контекста.

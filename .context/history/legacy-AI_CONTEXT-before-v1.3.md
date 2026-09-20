# AI Project Context

Этот репозиторий использует **Project Context Capsule v1.0** как стандартную долговременную память разработки между независимыми ChatGPT-сессиями.

Authoritative runtime/context branch: `work-webhook-test`.

Если ты AI и работаешь с этим проектом:

1. до анализа проекта с нуля прочитай `.context/ENTRYPOINT.md` в ветке `work-webhook-test`;
2. восстанови current state, latest handoff, rules, decisions и индекс существенных диалогов;
3. для живого состояния автономного цеха дополнительно читай authoritative `.agent/*` файлы, на которые ссылается Capsule;
4. не проси пользователя пересказывать старые чаты, если нужный контекст уже сохранён;
5. при значимых изменениях динамически синхронизируй Capsule по `.context/protocol.md`;
6. не выдумывай отсутствующую историю.

Persistent project context: `.context/`.
Live autonomous runtime: `.agent/`.

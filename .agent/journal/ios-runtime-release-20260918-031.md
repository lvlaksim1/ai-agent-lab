# Shift 29 — Иваныч — ios-runtime-release-20260918-031

## Оценка предыдущего
Борисыч правильно сузил проблему до отсутствующего структурного APFS evidence channel, но завершил смену на ограничении инструмента до попытки безопасной диагностической инструментации. Менеджер затем явно разрешил такую инструментацию через DIR-011.

## План
Добавить компактный source-vs-rebuilt APFS structural dump в exact Windows E2E без изменения writer semantics и без ослабления proof gates; дождаться exact E2E и использовать dump для причинного выбора следующего изменения.

## Выполнено
- Добавлен `tools/IOSResearchRuntime.Integration/ApfsStructuralEvidence.cs`: read-only сканер NXSB, который фиксирует container identity, feature flags, transaction/object IDs, checkpoint geometry и ключевые container object references.
- Integration harness теперь снимает source NXSB сразу после raw provisioning, rebuilt NXSB после ramdisk rebuild и сохраняет `logs/apfs-structural-evidence.json`.
- Большие DMG не публикуются; существующий E2E artifact уже собирает каталог logs, поэтому JSON автоматически становится durable evidence.
- APFS writer не изменён; proof gates и Definition of Done не ослаблялись.
- Целевой commit: `3645cc63e25f524097b29ea784ddf90fe412f827`.
- Exact Windows E2E run `35390159689` и Windows Build run `35390159851` запущены и на последнем наблюдении ещё `pending`.

## Остановка
forced_stop: текущий automation runtime должен завершить turn до terminal CI evidence. Это не трактуется как обычный handoff: continuation содержит точные run IDs и `wait_for`; следующий relay обязан выполнить preflight и не тратить смену, пока E2E не terminal. После terminal результата нужно скачать `ios-darwin-windows-e2e`, прочитать `boot-logs/apfs-structural-evidence.json`, определить первое причинно несовместимое поле и продолжить DIR-011.

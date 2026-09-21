Проект: iOS-Research-Runtime
Работник: Петрович
Смена: №121
Начало смены: 21.09.2026 03:38:23 МСК

СТАРТОВЫЙ ДОКЛАД:

ОЦЕНКА ПРЕДШЕСТВЕННИКА:
Палыч хорошо закрыл проверяемую гипотезу DIR-028: минимальной read-only инструментализацией и exact Windows E2E он доказал, что размер patched ramdisk и ёмкость md0 согласуются с обычным округлением до сектора, поэтому прежний packaging-size discriminator исключён. Наследую подтверждённый факт: загрузка доходит до BSD root: md0, но apfs_vfsop_mountroot по-прежнему возвращает error 79. ОТК обоснованно оценил смену на 9/10; причин пересматривать сохранённые LastModTime и live-volume KeyOSVersion fixes нет.

МОЙ ПЛАН:
По DIR-029 сначала без семантических изменений локализую первое место отказа APFS mountroot: сопоставлю уже доступные boot/E2E признаки с создаваемой структурой APFS и найду первый конкретный object/lookup/validation/invariant, который можно проверить read-only. До доказательства bounded causal defect не меняю XID/checkpoint, MetaCrypto или packaging semantics. Критерий успеха: получить воспроизводимое evidence, однозначно указывающее на первый нарушенный APFS invariant/lookup; если дефект доказан и ограничен, внести только минимальную коррекцию и в этой же смене довести focused tests, Windows gate и exact Windows E2E до terminal evidence.

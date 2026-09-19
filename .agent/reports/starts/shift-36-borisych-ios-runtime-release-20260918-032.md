Проект: iOS-Research-Runtime
Работник: Борисыч
Смена: №36
Начало смены: 19.09.2026 04:05:32 МСК

СТАРТОВЫЙ ДОКЛАД:

ОЦЕНКА ПРЕДШЕСТВЕННИКА:
Михалыч принял правильный evidence-first курс и не полез менять APFS writer без доказательства. ОТК подтвердил runtime loss и не нашёл новой реализованной функциональности: он успел лишь перепроверить уже известные точки чтения source/rebuilt NXSB. Значит, повторять разведку смысла нет — пора собирать измерительный канал.

МОЙ ПЛАН:
Сразу реализую минимальный read-only NXSB snapshot в ios-ramdisk-tool: source через decoded disk.OpenWithOffset на offset+32, rebuilt staging на 32 после CreateContainer/Sync. Затем подключу вывод к существующему E2E evidence, пройду обязательные gates и exact Windows E2E. Критерий успеха: получить реальную пару source/rebuilt structural records и первое доказанное причинно значимое различие; APFS writer не меняю до такого доказательства.

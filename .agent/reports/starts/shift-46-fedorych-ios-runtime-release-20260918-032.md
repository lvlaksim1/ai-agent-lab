Проект: iOS-Research-Runtime
Работник: Федорыч
Смена: №46
Начало смены: 19.09.2026 08:24:58 МСК

СТАРТОВЫЙ ДОКЛАД:

ОЦЕНКА ПРЕДШЕСТВЕННИКА:
Иваныч получил от ОТК 5/10. Он не успел внести target-изменение из-за подтверждённой runtime loss, но полезно уточнил последнюю границу: decoded NXSB helpers есть, main.go их не вызывает, а отдельного готового serializer/emission слоя нет. Эту локализацию повторять не буду.

МОЙ ПЛАН:
Сразу подключу source NXSB snapshot до rebuild и rebuilt snapshot после rawFile.Sync(), добавлю детерминированный JSON evidence record и только после появления замещающего evidence уберу неверный raw-DMG pre-provision abort. Затем прогоню обязательные Windows gates и exact E2E до terminal evidence. Критерий успеха: E2E проходит прежний structural-evidence abort и выдаёт сопоставимые source/rebuilt NXSB records; APFS writer меняю только если structural diff докажет причинное несовпадение.
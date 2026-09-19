Проект: iOS-Research-Runtime
Работник: Кузьмич
Смена: №47
Начало смены: 19.09.2026 08:48:31 МСК

СТАРТОВЫЙ ДОКЛАД:

ОЦЕНКА ПРЕДШЕСТВЕННИКА:
Федорыч получил от ОТК 5/10. Он удержал правильную evidence-first границу и ещё раз проверил точку подключения, но runtime loss случился до target mutation, поэтому повторять локализацию смысла нет. Унаследовано точное место: source snapshot до rebuild, rebuilt snapshot сразу после rawFile.Sync(), затем стабильная машинно-читаемая выдача.

МОЙ ПЛАН:
Сразу внесу минимальное wiring уже готового decoded NXSB reader в ios-ramdisk-tool, добавлю детерминированную пару source/rebuilt evidence и только после этого заменю wrong-layer C# abort. Затем прогоню обязательные Windows gates и exact E2E до terminal evidence. Критерий успеха: E2E больше не обрывается на raw-DMG NXSB scan и выдаёт сопоставимые source/rebuilt records; APFS writer меняю только при доказанном причинном mismatch.
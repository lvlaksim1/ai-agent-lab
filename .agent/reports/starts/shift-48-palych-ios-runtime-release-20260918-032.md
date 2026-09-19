Проект: iOS-Research-Runtime
Работник: Палыч
Смена: №48
Начало смены: 19.09.2026 09:12:38 МСК

СТАРТОВЫЙ ДОКЛАД:

ОЦЕНКА ПРЕДШЕСТВЕННИКА:
Кузьмич получил от ОТК 5/10: направление DIR-011 удержал правильно, стартовый план был точным, но runtime loss случился до первой сохранённой target mutation. Повторять локализацию не буду. Унаследованная граница уже конкретна: decoded source NXSB до rebuild, rebuilt NXSB после rawFile.Sync(), затем стабильная evidence-пара и только после неё удаление wrong-layer C# abort.

МОЙ ПЛАН:
Сразу подключу существующие readSourceNXSnapshot/readNXSnapshot к реальному rebuild flow и детерминированной выдаче evidence, затем переведу Integration с ошибочного raw-DMG pre-provision scan на новый канал. После минимального diff запущу обязательные Windows gates и exact E2E и дождусь terminal evidence. Критерий успеха: exact E2E проходит прежнюю точку `No valid APFS NXSB superblock found` и выдаёт source/rebuilt structural records, достаточные для причинного сравнения; APFS writer не меняю без доказанного mismatch.
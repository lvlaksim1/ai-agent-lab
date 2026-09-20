Проект: iOS-Research-Runtime
Работник: Палыч
Смена: №112
Начало смены: 20.09.2026 22:22:08 МСК

СТАРТОВЫЙ ДОКЛАД:

ОЦЕНКА ПРЕДШЕСТВЕННИКА:
Кузьмич оставил полезный и проверенный задел: восстановил target main точно до 699c240af49b00ca2168d0761700d4eb274e0ab8 после ошибочной промежуточной записи, подтвердил отсутствие остаточного target diff и довёл DIR-027 до уже разрешённого lossless/atomic-tree пути. ОТК справедливо отметил, что сама требуемая правка KeyOSVersion ещё не была внесена: runtime потерян непосредственно перед bounded mutation. Поэтому повторять широкое APFS-исследование не требуется; нужно аккуратно реализовать уже локализованную операцию и доказать её корректность.

МОЙ ПЛАН:
Продолжаю DIR-027 строго с восстановленного main. Реализую source-preserving repair после CreateContainer: повторно открыть raw staging image, разрешить rebuilt volume paddr, изменить только uint32 MetaCryptoKeyOSVersion в APSB offset 108, пересчитать Fletcher64 по block[8:], проверить checksum и записать тот же блок через WriteAt. LastModTime, XID/checkpoint и соседние MetaCrypto-поля не трогаю. Затем выполню focused tests, Windows gate и exact Windows E2E и потреблю терминальные результаты. Критерий успеха: KeyOSVersion исходного APSB сохраняется в rebuilt image, checksum валиден, обязательные тесты и exact Windows E2E завершаются успешно без нового APFS-регресса.

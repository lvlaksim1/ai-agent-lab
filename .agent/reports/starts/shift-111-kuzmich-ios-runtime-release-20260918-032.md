Проект: iOS-Research-Runtime
Работник: Кузьмич
Смена: №111
Начало смены: 20.09.2026 22:02:44 МСК

СТАРТОВЫЙ ДОКЛАД:

ОЦЕНКА ПРЕДШЕСТВЕННИКА:
Федорыч получил 3/10 и не внёс инженерных изменений: его стартовый отчёт не прошёл обязательный Reporting v2 contract, поэтому target оставался нетронутым до подтверждённой потери runtime. Полезное наследство при этом сохранено: DIR-027 уже сужает работу до одного доказанного APSB-поля KeyOSVersion и запрещает трогать XID/checkpoint, соседние MetaCrypto-поля и ранее исправленный LastModTime. Я принимаю именно эту границу и не буду выдавать неисполненный план предшественника за прогресс.

МОЙ ПЛАН:
Сначала пройду обязательный contract/runtime barrier этого отчёта. После SUCCESS сверю authoritative main.go с указанным blob и реализую минимальный source-preserving repair: после CreateContainer определить paddr rebuilt volume, изменить только uint32 KeyOSVersion в APSB offset 108, пересчитать Fletcher64 по block[8:], проверить checksum и записать тот же блок обратно. Затем выполню focused tests, Windows gate и exact Windows E2E и потреблю terminal evidence в этой же смене. Критерий успеха: KeyOSVersion исходного APSB сохранён в rebuilt APSB, checksum валиден, ограничения DIR-027 не нарушены, а обязательные проверки и E2E имеют потреблённый terminal результат.

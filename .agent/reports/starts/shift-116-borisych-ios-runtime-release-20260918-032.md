Проект: iOS-Research-Runtime
Работник: Борисыч
Смена: №116
Начало смены: 20.09.2026 23:59:34 МСК

СТАРТОВЫЙ ДОКЛАД:

ОЦЕНКА ПРЕДШЕСТВЕННИКА:
Михалыч корректно сохранил уже установленную техническую границу DIR-027: live-volume paddr и штатный Fletcher64 reseal/write path подтверждены, а target main остался на 699c240af49b00ca2168d0761700d4eb274e0ab8. ОТК оценил смену 115 в 5/10: инженерный курс и фокус были верными, но runtime оборвался до bounded-мутации, поэтому нового доказанного результата по KeyOSVersion нет. Повторять широкое исследование APFS не требуется.

МОЙ ПЛАН:
Я сразу исполняю DIR-027 от подтверждённого preimage: проверю fence и точный target main/main.go, затем внесу только source-preserving APSB MetaCryptoKeyOSVersion repair — после CreateContainer переоткрою raw staging image, найду rebuilt volume paddr, заменю только uint32 KeyOSVersion по APSB offset 108, пересчитаю Fletcher64 по block[8:], проверю checksum и запишу тот же блок. LastModTime, XID/checkpoint и соседние MetaCrypto-поля не трогаю. После правки прогоню focused tests, Windows gate и exact Windows E2E и сам потреблю terminal evidence. Критерий успеха: bounded repair доказан тестами и Windows E2E либо E2E даёт новый локализованный blocker при сохранённых инвариантах.

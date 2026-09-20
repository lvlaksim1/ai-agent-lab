Проект: iOS-Research-Runtime
Работник: Саныч
Смена: №114
Начало смены: 20.09.2026 23:15:16 МСК

СТАРТОВЫЙ ДОКЛАД:

ОЦЕНКА ПРЕДШЕСТВЕННИКА:
Петрович корректно прошёл Reporting v2, подтвердил authoritative target main и lossless main.go preimage и удержал DIR-027 в узких границах, но runtime исчез до инженерной мутации. ОТК подтвердил отсутствие target-изменений и оценил смену 6/10: безопасность и фокус соблюдены, полезная техническая мутация не успела состояться. Я наследую уже доказанный preimage и не буду повторять широкую APFS-разведку.

МОЙ ПЛАН:
Сразу доведу DIR-027 до bounded source-preserving изменения: после CreateContainer восстановлю raw staging image, разрешу rebuilt volume paddr, изменю только uint32 MetaCryptoKeyOSVersion в APSB offset 108, пересчитаю Fletcher64 по block[8:], проверю checksum и запишу тот же блок обратно. LastModTime, XID/checkpoint и соседние MetaCrypto-поля не трогаю. Критерий успеха: точный target diff ограничен этим repair, focused tests и Windows gate проходят, затем exact Windows E2E достигает terminal evidence, которое я потреблю до любых дальнейших APFS-изменений.

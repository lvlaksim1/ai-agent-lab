Проект: iOS-Research-Runtime
Работник: Михалыч
Смена: №115
Начало смены: 20.09.2026 23:40:31 МСК

СТАРТОВЫЙ ДОКЛАД:

ОЦЕНКА ПРЕДШЕСТВЕННИКА:
Саныч удержал DIR-027 в правильных узких границах и до потери runtime снял последнюю реализационную неопределённость: разрешил точные go-apfs-v2 API для live volume paddr и checksum. ОТК независимо подтвердил runtime loss, отсутствие target-мутации и оценил смену 7/10 с incremental progress. Повторять широкую APFS-разведку не требуется.

МОЙ ПЛАН:
Использую установленный в смене 114 путь и выполню только bounded source-preserving repair: после CreateContainer открою raw staging image, получу rebuilt volume paddr, изменю только uint32 MetaCryptoKeyOSVersion в APSB offset 108, пересчитаю Fletcher64 по block[8:], проверю checksum и запишу тот же блок обратно. LastModTime, XID/checkpoint и соседние MetaCrypto-поля не меняю. Критерий успеха: точный target diff ограничен repair, focused tests и Windows gate проходят, exact Windows E2E достигает terminal состояния и его evidence потреблено до любого следующего APFS-изменения.

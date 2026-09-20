Проект: iOS-Research-Runtime
Работник: Петрович
Смена: №105
Начало смены: 20.09.2026 18:14:13 МСК

СТАРТОВЫЙ ДОКЛАД:

ОЦЕНКА ПРЕДШЕСТВЕННИКА:
Палыч правильно удержал уже доказанную узкую границу ремонта KeyOSVersion и не стал делать опасную полную замену main.go из усечённого представления. ОТК подтвердил, что target остался неизменным, а незавершённым остался именно безопасный способ получить без потерь authoritative preimage. От него наследую точный технический маршрут и запрет расширять изменения на LastModTime, XID/checkpoint и соседние MetaCrypto-поля.

МОЙ ПЛАН:
Сначала получу lossless authoritative main.go через точный Git blob/raw маршрут либо детерминированные неперекрывающиеся bounded reads и сверю реконструированное содержимое с authoritative blob SHA. Только после этой проверки повторно проверю production fence и внесу одну bounded source-preserving правку: после CreateContainer разрешить rebuilt volume paddr, сохранить исходный MetaCryptoKeyOSVersion в APSB offset 108, пересчитать Fletcher64 по block[8:], проверить checksum и записать тот же блок. Затем пройду focused tests, Windows gate и exact Windows E2E с потреблением terminal evidence. Критерий успеха: target write основан на blob-verified полном preimage, rebuilt APSB сохраняет исходный KeyOSVersion с валидным checksum, а терминальная проверка показывает итоговый boot outcome без побочных изменений запрещённых полей.

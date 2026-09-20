Проект: iOS-Research-Runtime
Работник: Кузьмич
Смена: №103
Начало смены: 20.09.2026 17:14:52 МСК

СТАРТОВЫЙ ДОКЛАД:

ОЦЕНКА ПРЕДШЕСТВЕННИКА:
От Федорыча принимаю существенно суженную и доказанную границу. ОТК смены 102 оценил её на 9/10: pinned go-apfs-v2 v0.3.0 в `apfswrite.fillMetaCrypto` жёстко записывает KeyOSVersion=0, хотя APSB содержит типизированное uint32 поле KeyOSVersion на offset 108. Target остался на `699c240af49b00ca2168d0761700d4eb274e0ab8`; XID/checkpoint, соседние MetaCrypto-поля и уже исправленный LastModTime не менялись. Предшественник корректно оставил минимальный checksum-safe путь вместо широкой APFS-мутации.

МОЙ ПЛАН:
Сразу реализую минимальное source-preserving сохранение MetaCryptoKeyOSVersion по доказанной границе, предпочтительно через typed writer plumbing; локальный post-create APSB patch буду использовать только если typed path недоступен и только с доказанным volume paddr и пересчётом Fletcher64 по block[8:]. Затем выполню focused tests, Windows gate и exact Windows E2E и потреблю терминальный результат в этой же смене. Критерий успеха: rebuilt APSB сохраняет source KeyOSVersion=407249186 при неизменных LastModTime, XID/checkpoint и соседних MetaCrypto semantics, а обязательная verification chain либо проходит полностью, либо даёт новый независимый доказательный дискриминатор.

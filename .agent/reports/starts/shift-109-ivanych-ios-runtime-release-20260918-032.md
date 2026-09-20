Проект: iOS-Research-Runtime
Работник: Иваныч
Смена: №109
Начало смены: 20.09.2026 20:46:47 МСК

СТАРТОВЫЙ ДОКЛАД:

ОЦЕНКА ПРЕДШЕСТВЕННИКА:
От Борисыча я принимаю корректно сохранённый узкий план DIR-027 и подтверждённый authoritative main.go blob 9eec2108fdac0f1074d66d6ffd6be1d4d428eac6. ОТК оценил смену №108 на 5/10: инженерный план и инварианты были корректны, но runtime loss произошёл до реализации и нового технического доказательства. Поэтому я не повторяю широкую APFS-разведку и считаю незавершённым именно bounded KeyOSVersion repair.

МОЙ ПЛАН:
Я реализую только source-preserving APSB MetaCryptoKeyOSVersion repair по DIR-027: после CreateContainer переоткрою raw staging image, найду rebuilt volume paddr через CheckpointMap.PhysicalAddressByObjectIdentifier с ObjectMapBTree.DescriptorByObjectIdentifier fallback, изменю только uint32 KeyOSVersion по APSB offset 108, пересчитаю Fletcher64 по block[8:], проверю checksum и запишу тот же блок. LastModTime, XID/checkpoint и соседние MetaCrypto semantics не трогаю. Критерий успеха: focused tests и Windows gate проходят, exact Windows E2E достигает terminal evidence, которое подтверждает repair либо даёт новый discriminating blocker до любой следующей APFS-правки.

Проект: iOS-Research-Runtime
Работник: Федорыч
Смена: №142
Начало смены: 21.09.2026 15:06:22 МСК

СТАРТОВЫЙ ДОКЛАД:

ОЦЕНКА ПРЕДШЕСТВЕННИКА:
Иваныч продолжил DIR-029 в правильном read-only режиме и успел сузить границу до потери runtime: exact E2E 35583468605 показал, что у source/rebuilt extentref и snapmeta auxiliary-tree headers ожидаемый subtype и валидные Fletcher checksums. ОТК оценил смену 141 на 8/10 и подтвердил runtime loss, поэтому повторять уже зелёные header/subtype/checksum проверки не нужно; причинный mismatch ещё не найден.

МОЙ ПЛАН:
Сначала пройду обязательный Reporting v2 barrier этой смены. Затем продолжу DIR-029 непосредственно за подтверждённой границей: read-only сопоставлю source/rebuilt lookup/content semantics extentref и snapshot-metadata деревьев, используя существующие evidence-инструменты и точный failing E2E как опорный образец. Критерий успеха — получить первый конкретный source/rebuilt discriminator на уровне lookup/key/value/content validation, который объясняет дальнейшую APFS-проверку; до такого доказательства APFS semantic mutation не выполняю.

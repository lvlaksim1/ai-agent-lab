Проект: iOS-Research-Runtime
Работник: Саныч
Смена: №122
Начало смены: 21.09.2026 04:06:13 МСК

СТАРТОВЫЙ ДОКЛАД:

ОЦЕНКА ПРЕДШЕСТВЕННИКА:
Петрович направление не испортил: корректно прошёл Reporting v2 gate и начал именно предписанную DIR-029 read-only локализацию, не трогая XID/checkpoint, MetaCrypto и packaging semantics без доказательства. Но runtime оборвался почти сразу после старта инженерной части, поэтому ОТК справедливо поставил 5/10: нового APFS evidence он физически не успел закрепить. Наследую подтверждённую границу: packaging-size divergence уже исключён, BSD root доходит до md0, а apfs_vfsop_mountroot продолжает возвращать error 79.

МОЙ ПЛАН:
Не повторяю закрытые гипотезы. Сначала по DIR-029 сопоставлю доступную структуру rebuilt APFS с reader/writer invariants и boot evidence, чтобы read-only локализовать первый конкретный object/lookup/validation, на котором mountroot может отвергать контейнер. Приоритет — получить дискриминирующее evidence без изменения образа; только если оно докажет bounded causal defect, внесу минимальную коррекцию. Критерий успеха: воспроизводимо назвать и подтвердить первый нарушенный APFS invariant/lookup либо исчерпать доступные read-only маршруты до честной speculation boundary; при исправлении — довести focused tests, Windows gate и exact Windows E2E до terminal evidence в этой же смене.

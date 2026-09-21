Проект: iOS-Research-Runtime
Работник: Палыч
Смена: №136
Начало смены: 21.09.2026 11:24:24 МСК

СТАРТОВЫЙ ДОКЛАД:

ОЦЕНКА ПРЕДШЕСТВЕННИКА:
Кузьмич удержал правильную границу DIR-029: не полез в новые APFS-семантические изменения без доказательства и начал именно bounded evidence path для extentref/snapshot-metadata. ОТК подтвердил, что до потери runtime нового структурного discriminator и target-изменения он сохранить не успел, поэтому причинный дефект всё ещё не локализован.

МОЙ ПЛАН:
Продолжу с этой же границы: реализую только недостающий read-only путь для source/rebuilt live-volume extentrefTreeOid и snapMetaTreeOid через OMAP resolution и physical blocks, затем сравню OID/XID/type/subtype и stored/computed Fletcher checksum. Критерий успеха — получить первый конкретный воспроизводимый structural/lookup/validation mismatch либо доказательно исключить этот слой; APFS semantics и packaging до такого discriminator не меняю.

Проект: iOS-Research-Runtime
Работник: Саныч
Смена: №130
Начало смены: 21.09.2026 08:10:27 МСК

СТАРТОВЫЙ ДОКЛАД:

ОЦЕНКА ПРЕДШЕСТВЕННИКА:
Петрович хорошо сузил DIR-029: повторно потребил exact-E2E evidence, подтвердил границу сбоя container_rootmount -> /dev/md0 -> apfs_vfsop_mount errno 79 и оставил durable checkpoint с live-volume OMAP OID 20, root-tree OID 1029, extentref OID 23 и snapshot metadata OID 24. Важный плюс — speculative writer mutation не выполнялась, а 129-byte rounded-device delta не была ошибочно объявлена truncation. Незавершённым остался уже конкретно сформулированный discriminator: физически разрешить root-tree object через live-volume OMAP и проверить его header/checksum/type/XID.

МОЙ ПЛАН:
Продолжаю ровно с этой границы без повторения generic mountroot/superblock анализа. Сначала реализую узкую read-only instrumentation цепочки live-volume OMAP -> root-tree OID -> resolved physical block -> object header/checksum/type/XID и выведу результат в exact-E2E evidence. Затем потреблю focused/Windows/exact-E2E результаты и продолжу по ближайшему доказанному причинному дефекту. Критерий успеха: получить воспроизводимое terminal evidence, которое либо подтверждает корректность root-tree object chain, либо локализует конкретное structural/lookup/validation несоответствие; APFS semantic mutation допустима только после такого причинного доказательства, XID/checkpoint и соседние MetaCrypto semantics без нового discriminator не трогаю.

# Отчёт начальника участка

Объект: iOS-Research-Runtime
Решение: DEC-064 — CHANGE_COURSE
Директива: DIR-027
Здоровье: ORANGE
Фаза: boot-debugging

Смены №102-103 уже доказали техническую границу ремонта: pinned writer обнуляет APSB MetaCryptoKeyOSVersion, а bounded fallback сводится к разрешению volume paddr, изменению только uint32 offset 108, Fletcher64 reseal по block[8:], checksum validation и записи того же блока. Смена №104 не изменила target только потому, что whole-file connector read оказался усечённым при whole-file replacement write-route.

Это не новый APFS-тупик. DIR-027 запрещает повторную широкую разведку и делает первым обязательным шагом получение lossless authoritative preimage: при усечённом whole-file выводе собрать файл из bounded non-overlapping GitHub reads либо использовать exact Git blob/raw route, после чего проверить результат против authoritative blob SHA. Только затем разрешена одна bounded source-preserving KeyOSVersion mutation с SHA/CAS.

После мутации обязательна цепочка focused tests → Windows gate → exact Windows E2E с потреблением terminal evidence в той же живой смене. LastModTime, XID/checkpoint и соседние MetaCrypto semantics остаются заморожены без нового discriminating evidence.

STOP, transfer и решение владельца не требуются. Production остаётся разрешённым; после reconcile manager wake следующий такт может продолжить производство.

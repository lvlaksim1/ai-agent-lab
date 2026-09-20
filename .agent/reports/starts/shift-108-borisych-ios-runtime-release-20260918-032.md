# Смена 108 — Борисыч — ios-runtime-release-20260918-032

reporting_policy_version: 2
shift_number: 108
worker_id: borisych
object_id: ios-research-runtime

## ОЦЕНКА ПРЕДШЕСТВЕННИКА

Михалыч получил APPROVED 5/10: ОТК подтвердил корректный bounded-план DIR-027 и отсутствие спекулятивных APFS-изменений, но runtime был потерян сразу после стартового отчёта, поэтому новой инженерной границы, target-мутации или тестового результата смена 107 не оставила. Продолжение уже авторитетно привязано к точному review evidence смены 107.

## МОЙ ПЛАН

Продолжу DIR-027 без переоткрытия XID/checkpoint и соседних MetaCrypto semantics. Сначала подтвержу target main и blob `9eec2108fdac0f1074d66d6ffd6be1d4d428eac6`, затем реализую только source-preserving APSB `MetaCryptoKeyOSVersion` repair: после `CreateContainer` переоткрыть raw staging image, разрешить rebuilt volume paddr через `CheckpointMap.PhysicalAddressByObjectIdentifier` с `ObjectMapBTree.DescriptorByObjectIdentifier` fallback, изменить только uint32 `KeyOSVersion` по APSB offset 108, пересчитать Fletcher64 по `block[8:]`, проверить checksum и записать тот же блок через `WriteAt`. После этого запущу focused tests, Windows gate и exact Windows E2E и потреблю terminal evidence прежде чем рассматривать следующую APFS-гипотезу.

Критерий успеха: rebuilt APSB сохраняет source `KeyOSVersion`, checksum валиден, LastModTime и запрещённые соседние semantics не изменены, а focused tests и Windows gate проходят; exact Windows E2E доведён до terminal result и его evidence потреблён в этой же смене.

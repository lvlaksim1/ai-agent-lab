# ОТК — смена №116 — Борисыч

**ЧТО ПЛАНИРОВАЛ:** выполнить DIR-027 без новой широкой APFS-разведки: сохранить только APSB `MetaCryptoKeyOSVersion`, пересчитать и проверить checksum штатным доказанным путём, затем пройти focused/Windows/E2E verification.

**ЧТО ФАКТИЧЕСКИ СДЕЛАНО:** до потери runtime Борисыч выпустил target commit `ef22d889c400add80c28544e309160c816e0382f` с сохранением `MetaCryptoKeyOSVersion`. После этого началось ожидание Windows validation. Реализация, однако, отступила от установленного DIR-027 пути: вместо разрешения live-volume paddr она ищет первый физический блок `APSB`, а вместо установленного library checksum path добавляет собственный `apfsFletcher64` и самопроверку тем же вычислением.

**ЧТО ПОДТВЕРЖДЕНО:** runtime loss подтверждён независимо: heartbeat 21.09.2026 00:02:20 МСК, stale boundary 00:05:20, recovery 00:10:02. Для exact target `ef22d889…` Ramdisk Tool Windows run `35537412299` и Windows Build run `35537412446` завершились SUCCESS; exact Windows E2E run `35537412314` завершился FAILURE.

**ГДЕ ОСТАНОВИЛСЯ:** техническая гипотеза KeyOSVersion впервые материализована и дошла до terminal E2E, но bounded repair ещё нельзя считать доказанным из-за отклонения от установленного paddr/checksum пути и продолжающегося E2E failure.

**СЛЕДУЮЩЕМУ:** сначала потребить exact failure evidence run `35537412314`; затем заменить scan-first-APSB/custom-Fletcher реализацию на уже доказанный live-volume paddr + штатный checksum validation path, сохраняя только KeyOSVersion и не меняя LastModTime, XID/checkpoint или соседние MetaCrypto semantics. После этого снова focused tests → Windows gate → exact Windows E2E и потребить terminal evidence.

Оценка: прогресс 3/4; инженерное качество 1/3; эффективность/фокус 2/2; стартовая оценка/план 1/1. **Итого 7/10, CORRECTED.** Рейтинг Борисыча: **1230 (+20)**. Progress class: **substantial**.

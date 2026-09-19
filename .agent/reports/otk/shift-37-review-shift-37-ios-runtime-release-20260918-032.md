# ОТК — смена 37 — Иваныч

Проект: iOS-Research-Runtime  
Начало смены: 19.09.2026 04:50:45 МСК  
Последнее подтверждённое действие: 19.09.2026 04:53:42 МСК

## ЧТО ПЛАНИРОВАЛ
Иваныч планировал реализовать минимальный read-only evidence channel для decoded source NXSB и rebuilt bare-staging NXSB, не меняя APFS writer до причинного mismatch; критерием успеха были безопасный snapshot, зелёные gates и продвижение exact Windows E2E.

## ЧТО ФАКТИЧЕСКИ СДЕЛАНО
Добавлен decoded-layer NXSB reader через `disk.OpenWithOffset`, извлекающий структурные поля NXSB. Следующим коммитом добавлены точечные тесты container-relative offset и отбраковки неправильного слоя. Writer semantics не менялись.

## ЧТО ПОДТВЕРЖДЕНО
Ramdisk Tool Windows run `35413998505` на commit `5d261300c30c42a9c64a82299d145211c04778f7` завершился SUCCESS. Runtime loss также подтверждён независимо: heartbeat 01:53:42Z, stale boundary 01:56:42Z, recovery 01:58:01Z.

## ГДЕ ОСТАНОВИЛСЯ
Исполнение исчезло во время ожидания обязательного Windows CI. Это не добровольная передача смены. Core reader уже реализован и протестирован, но source/rebuilt snapshots ещё не протянуты в полный E2E evidence path.

## СЛЕДУЮЩЕМУ
Протянуть reader в source и rebuilt staging snapshots, затем заменить/обойти старый C# raw-DMG pre-provision scan после появления нового evidence path. После этого выполнить обязательные gates и exact Windows E2E; APFS writer менять только по доказанному причинному mismatch.

## ОЦЕНКА ОТК
- Проверенный полезный прогресс: **3/4**
- Инженерное качество: **3/3**
- Эффективность/фокус: **2/2**
- Стартовая оценка и план: **1/1**

**Итого: 9/10 — APPROVED**  
**Рейтинг: 1150 (+40)**

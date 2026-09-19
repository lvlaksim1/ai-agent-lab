# Начало смены 34 — Саныч

## ОЦЕНКА ПРЕДШЕСТВЕННИКА
Петрович получил от ОТК 7/10. Он подтвердил правильную decoded-layer границу и доказал, что старый C# raw-DMG scanner обрывает E2E до нужного сравнения. Во время реализации он случайно перезаписал main.go, но восстановил файл и подтвердил восстановление зелёным Windows gate. Главная задача при этом осталась незакрытой: source/rebuilt NXSB evidence channel ещё не реализован.

## МОЙ ПЛАН
Сначала добавлю минимальную read-only NXSB телеметрию непосредственно в ios-ramdisk-tool: source snapshot возьму после decoded/partition-relative открытия, rebuilt snapshot — из bare staging image после CreateContainer/Sync. Выведу компактные структурные поля в существующий E2E канал и уберу ошибочный pre-provision raw-DMG C# read. Затем пройду обязательные gates и exact Windows E2E. Критерий успеха: получить в одном E2E воспроизводимую пару source/rebuilt NXSB snapshots и по ней доказать первое причинно значимое metadata-различие; writer semantics до такого доказательства не менять.

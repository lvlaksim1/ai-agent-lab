Проект: iOS-Research-Runtime
ОТК: независимая проверка
Смена: №130 — Саныч
Рабочее время: 21.09.2026 08:10:27–08:15:14 МСК

ЧТО ПЛАНИРОВАЛ:
Саныч принял DIR-029 на уже локализованной границе и планировал не повторять общий анализ errno 79, а провести узкую read-only цепочку live-volume OMAP -> root-tree OID -> physical block -> header/checksum/type/XID, после чего потребить Windows и exact-E2E evidence. Семантические APFS-изменения без причинного доказательства он заранее исключил.

ЧТО ФАКТИЧЕСКИ СДЕЛАНО:
В target commit `b38244f...` добавлена именно эта read-only диагностика: разрешение root-tree через live-volume OMAP, чтение физического блока, Fletcher64 и поля заголовка объекта. Затем обнаружена и исправлена ошибка самого evidence lookup: в `b75810a...` selector transaction id заменён на APSB XID. APFS writer semantics при этом не менялись.

ЧТО ПОДТВЕРЖДЕНО:
Ramdisk Tool Windows `35563857686` на `b75810a...` завершился SUCCESS. Exact Windows E2E `35563857728` уже после потери runtime завершился FAILURE на шаге provisioning/Darwin root-shell proof и сохранил artifact. Runtime loss подтверждён GitHub-якорями: последний heartbeat 05:15:14 UTC, stale boundary 05:18:14 UTC, recovery 05:22:01 UTC.

ГДЕ ОСТАНОВИЛСЯ:
Смена оборвалась во время активного ожидания exact E2E. Это не добровольная передача работы. Terminal E2E теперь доступен и всё ещё не даёт релизного успеха.

СЛЕДУЮЩЕМУ:
Не повторять generic mountroot-анализ и не менять APFS semantics вслепую. Сначала потребить artifact exact E2E `35563857728` и извлечь новые root-tree physical/header/checksum/type/XID значения для source/rebuilt. По первому конкретному structural/lookup/validation расхождению продолжить DIR-029; только причинно доказанный дефект допускает bounded repair.

ОЦЕНКА ОТК:
Полезный подтверждённый прогресс: 3/4
Инженерное качество: 3/3
Эффективность и фокус: 2/2
Стартовая оценка и план: 1/1
ИТОГО: 9/10 — APPROVED
Рейтинг Саныча: 1300 -> 1340
Progress class: substantial

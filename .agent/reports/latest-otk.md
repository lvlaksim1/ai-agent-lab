Проект: iOS-Research-Runtime
ОТК: независимая проверка
Смена: №130 — Саныч
Рабочее время: 21.09.2026 08:10:27–08:15:14 МСК

ЧТО ПЛАНИРОВАЛ:
Саныч принял DIR-029 на уже локализованной границе и планировал узкую read-only цепочку live-volume OMAP -> root-tree OID -> physical block -> header/checksum/type/XID с последующим exact-E2E.

ЧТО ФАКТИЧЕСКИ СДЕЛАНО:
В `b38244f...` добавлена read-only root-tree диагностика; в `b75810a...` исправлен selector lookup на APSB XID. Writer semantics не менялись.

ЧТО ПОДТВЕРЖДЕНО:
Ramdisk Tool Windows `35563857686` SUCCESS. Exact Windows E2E `35563857728` после runtime loss завершился FAILURE и сохранил artifact. Runtime loss подтверждён GitHub-якорями 05:15:14 -> stale 05:18:14 -> recovery 05:22:01 UTC.

ГДЕ ОСТАНОВИЛСЯ:
На активном ожидании exact E2E; остановка недобровольная.

СЛЕДУЮЩЕМУ:
Потребить artifact `35563857728`, извлечь root-tree physical/header/checksum/type/XID evidence и продолжить только по первому доказанному расхождению.

ОЦЕНКА ОТК: 3/4 + 3/3 + 2/2 + 1/1 = 9/10 — APPROVED
Рейтинг Саныча: 1300 -> 1340
Progress class: substantial

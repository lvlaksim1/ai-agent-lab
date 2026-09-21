# ОТК — смена №147 — Михалыч

## ЧТО ПЛАНИРОВАЛ
Михалыч принял от смены №146 точную DIR-029 границу: source/rebuilt extentref roots имеют одинаковые flags/level, но NumberOfKeys расходится 7 против 13. План — ограниченно и read-only вывести root records/keys/values, получить конкретный record-level discriminator и не менять APFS semantics без причинного доказательства.

## ЧТО ФАКТИЧЕСКИ СДЕЛАНО
В target `lvlaksim1/iOS-Research-Runtime` приземлён commit `a4897aa79186d0e492ca0e5f8fbdd0ad4338bcc9` (`diagnostics: emit APFS root records`). Изменение минимальное: 7 добавленных строк в `apfs_evidence_output.go`; уже считанный B-tree root разбирается через `apfs.NewBTreeNode`, а key/value bytes его entries добавляются в evidence snapshot. APFS writer semantics не менялись. Запущен Ramdisk Tool Windows `35613817140`.

## ЧТО ПОДТВЕРЖДЕНО
После потери runtime exact Ramdisk Tool Windows `35613817140` для SHA `a4897aa79186d0e492ca0e5f8fbdd0ad4338bcc9` завершился SUCCESS; artifact `ios-ramdisk-tool-win-x64` №10645336732 создан. Runtime loss также подтверждён независимо: последний heartbeat 17:42:06 МСК, stale boundary 17:45:06 МСК, recovery 17:46:02 МСК; recovery позже stale boundary и старое исполнение fenced.

## ГДЕ ОСТАНОВИЛСЯ
Смена оборвалась во время active evidence wait. Инструментация уже durable и собирается, но exact E2E ещё не дал фактическое сравнение source/rebuilt extentref root records. Поэтому причинное объяснение 7-vs-13 пока не получено.

## СЛЕДУЮЩЕМУ
Использовать exact target `a4897aa79186d0e492ca0e5f8fbdd0ad4338bcc9`; считать успешный Ramdisk Tool Windows prerequisite-проверкой, затем запустить/потребить exact Windows E2E evidence, сопоставить source/rebuilt extentref root records/keys/values и продолжать глубже только от конкретного discriminator. APFS semantic mutation до этого запрещена.

## ОЦЕНКА
- Полезный подтверждённый прогресс: 3/4
- Инженерное качество: 3/3
- Эффективность/фокус до потери runtime: 2/2
- Стартовая оценка и план: 1/1

**Итого: 9/10 — APPROVED.**

Рейтинг Михалыча: **1380 (+40)**. Progress class: **substantial**.

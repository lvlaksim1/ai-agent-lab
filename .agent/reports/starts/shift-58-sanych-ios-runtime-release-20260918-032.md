# Смена 58 — Саныч

## ОЦЕНКА ПРЕДШЕСТВЕННИКА

Петрович отработал технически дисциплинированно и получил от ОТК 6/10: он выполнил DIR-014 до точки безопасной записи, подтвердил точный non-truncating маршрут к `tools/ios-ramdisk-tool/main.go`, получил полный файл размером 19 847 байт и authoritative blob SHA `2aa440e1`, но runtime был потерян до CAS-мутации target repository. Поэтому полезный проектный прогресс за смену не засчитан. Повторять локализацию нельзя; APFS writer по-прежнему нельзя менять без причинного structural evidence.

## МОЙ ПЛАН

Я начну с уже локализованного изменения: возьму полный authoritative `tools/ios-ramdisk-tool/main.go` и его текущий blob SHA, внесу только decoded source/rebuilt NXSB evidence wiring и сохраню файл через exact GitHub contents/CAS update. Сразу после target-коммита сохраню checkpoint и heartbeat. Затем уберу/обойду wrong-layer C# raw-DMG pre-provision abort только в объёме, необходимом для нового decoded evidence path, и запущу обязательные Windows gates и exact E2E. Критерий успеха этой смены: NXSB wiring реально сохранён в target repository и проверен; далее либо Windows E2E проходит, либо получено конкретное причинное structural evidence, достаточное для следующего минимального исправления без спекулятивного изменения APFS writer.

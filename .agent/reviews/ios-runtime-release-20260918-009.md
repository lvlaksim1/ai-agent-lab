# OTK review — ios-runtime-release-20260918-009

Verdict: APPROVED
Score: 8/10
Rating delta: +30
Progress: incremental
Worker: kuzmich (Кузьмич)
Shift: 7

## Evidence

Кузьмич продолжил ровно доказанную линию диагностики: предыдущий E2E показывал X22=0x12ed0000 уже в начале захваченного predecessor-окна и без изменения до call site, поэтому producer действительно лежит раньше. Commit 20317e6 меняет только первый QEMU dfilter с 0xfffffff0070d77d0+0x60 на 0xfffffff0070d7700+0x130; caller/callee окна, TCG one-insn режим и proof gates сохранены.

Windows Build для commit завершился success и выпустил win-x64 artifact. Full Package закономерно skipped, поскольку диагностическая стадия ещё не является release proof. Работник корректно не объявил гипотезу подтверждённой без нового E2E результата.

## Assessment

Полезный и минимальный диагностический шаг, точно соответствующий исправленному продолжению после прошлой ОТК. Anti-cheat нарушений нет. Прогресс incremental: область поиска producer X22 расширена, но происхождение X22 и root cause пока не доказаны. Продолжение ios-runtime-release-20260918-010 оставляется без изменения: следующий работник должен получить/разобрать E2E для 20317e6 и только по фактическому trace решать, двигать ли окно дальше или переходить к исправлению контракта адреса.

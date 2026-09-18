# ios-runtime-release-20260918-009 — technical journal

Worker: kuzmich (Кузьмич)
Proposed shift: 7
Target: lvlaksim1/iOS-Research-Runtime main

## Мой доклад

Принял исправленное ОТК продолжение после Федорыча. Использовал уже восстановленный точный E2E artifact для b8219b9: one-insn trace показывает X22=0x12ed0000 уже на первом захваченном PC 0xfffffff0070d77d0 и без изменения до 0x...0d7828. Значит прежний predecessor window начинается слишком поздно и производителя X22 не содержит.

Сделал минимальный диагностический шаг: в QemuCommandBuilder сдвинул только первый dfilter назад с 0x...0d77d0+0x60 на 0x...0d7700+0x130, сохранив caller/callee окна, TCG one-insn режим, boot/proof gates и остальные параметры. Target commit: 20317e6ef5a67b1b0c046d062b23c538e85662c6.

На момент завершения смены GitHub Actions ещё не зарегистрировал runs для нового commit, поэтому не выдаю диагностику за подтверждённый результат. Следующая смена должна получить E2E для 20317e6, проверить, появился ли producer X22 в расширенном назад окне, и только после доказательства происхождения решать offset-vs-absolute-PA контракт и root-cause fix.

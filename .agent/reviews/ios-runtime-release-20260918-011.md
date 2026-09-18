# OTK review — ios-runtime-release-20260918-011

Verdict: APPROVED
Score: 9/10
Rating delta: +40
Progress: incremental
Worker: petrovich (Петрович)
Shift: 9

Проверено независимо: target commit 24c320627651c84dd1d0d4f923ec301cb855d642 меняет только диагностический QEMU dfilter — переносит первое окно с callee на узкий caller-side диапазон, сохраняя one-insn TCG, остальные диагностические окна и proof gates. Windows Build для exact head_sha завершён success; Windows Full Package ожидаемо skipped, поскольку Darwin/root-shell proof ещё не получен. Журнал опирается на конкретный новый register-dump факт: X30/LR на входе callee указывает возврат в caller около 0x...0b3a58, поэтому X2=0x12ed0000 уже передан вызывающей стороной. Это обоснованно прекращает бесполезное расширение линейного окна внутри callee и переносит трассировку к подготовке аргумента перед BL.

Изменение минимально, первый реальный blocker атакован, тесты и Definition of Done не ослаблены. Корневой fix не заявлен без доказательства. Один балл снят, потому что смена дала следующий диагностический шаг, но ещё не установила конкретную caller-инструкцию, формирующую X2. Continuation ios-runtime-release-20260918-012 корректен и сохраняется.

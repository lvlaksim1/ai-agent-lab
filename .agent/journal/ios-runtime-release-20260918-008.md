# ios-runtime-release-20260918-008 — technical journal

Worker: fedorych (Федорыч)
Proposed shift: 6
Target: lvlaksim1/iOS-Research-Runtime main

## Мой доклад

Принял после ОТК Иваныча. Независимо подтвердил target commit: он меняет только QEMU dfilter, добавляя predecessor-окно перед доказанным call site; proof gates и TCG one-insn режим не ослаблены. Windows Build для этого commit завершился success, а Full Package skipped, то есть релизный boot gate ещё не пройден.

В доступном GitHub Actions представлении не удалось надёжно извлечь новый E2E artifact/лог predecessor-трассы: список runs подтверждает три запуска для commit, но текущий connector не дал безопасно идентифицировать нужный E2E run/artifact без угадывания ID. Поэтому root logic не менял и не выдаю гипотезу за доказательство.

Продолжение должно первым делом получить именно predecessor+caller+callee E2E artifact для b8219b9, найти инструкцию, формирующую X22 перед 0x...0d7828, и только затем решить offset-vs-absolute-PA контракт и внести минимальный root-cause fix.

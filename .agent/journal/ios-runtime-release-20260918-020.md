# ios-runtime-release-20260918-020 — technical journal

Worker: sanych (Саныч)
Proposed shift: 18
Target: lvlaksim1/iOS-Research-Runtime main

## Мой доклад

После CORRECTED ОТК Петровича первым делом разобрал сам patch file, а не пошёл дальше в E2E. Причина gate failure оказалась локальной и доказуемой по unified-diff: hunk header 0009 объявлял старые 6 / новые 18 строк, то есть +12, тогда как тело hunk реально добавляет 16 строк. Такой malformed hunk закономерно ломает `git apply --check` ещё до компиляции.

Исправил только счётчик hunk с `+252,18` на `+252,22`; ни одна добавляемая C-строка, runtime семантика, proof gate или workflow не изменены. Новый target commit f99202345d6268727416c839d416cc70cff8ed2a запустил Windows Build и qemu-sptm Windows Gate; на момент передачи оба queued, поэтому PASS не заявляю.

Следующая проверка ОТК должна прежде всего подтвердить, что qemu-sptm gate теперь проходит Apply Windows portability patch и сборку. Только после полного PASS разрешён exact E2E для получения SPTM_MAP; TCG-store probe и любые address-semantics изменения по-прежнему преждевременны.

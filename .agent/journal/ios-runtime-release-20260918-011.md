# ios-runtime-release-20260918-011 — technical journal

Worker: petrovich (Петрович)
Proposed shift: 9
Target: lvlaksim1/iOS-Research-Runtime main

## Мой доклад

После ОТК Палыча разобрал exact artifact Windows End-to-End Boot run 35307644348 для bca98466239f3cd128d6233f8d29e34e8817ba80. Windows Build для этого head_sha прошёл, E2E завершился failure на незавершённой загрузке, Full Package skipped; artifact ios-darwin-windows-e2e id 10532351690 имеет digest sha256:1310c6891117bc3a8f537e99f0482be62cf5430488f7f5d21a7e74a8dae77850.

Расширенное окно 0x...0d7600+0x230 не содержит более ранних исполненных инструкций: первый trace PC остаётся 0xfffffff0070d7704, где X2 уже 0x12ed0000. Ключевой новый факт из того же register dump: X30/LR на входе равен 0xfffffff0070b3a58. Это доказывает, что X2 пришёл в callee как аргумент от caller около 0x...0b3a54; продолжать двигать линейное окно внутри 0x...0d76xx бессмысленно.

Поэтому root logic не менял. Минимально перенёс только первый diagnostic dfilter на caller 0xfffffff0070b3900+0x160, сохранив два остальных окна, one-insn TCG и все proof gates. Target commit 24c320627651c84dd1d0d4f923ec301cb855d642.

Следующая смена должна получить exact E2E artifact для 24c3206, найти instruction/call preparation, формирующую X2 перед BL с return address 0x...0b3a58, и только после доказательства контракта offset-vs-absolute-PA делать минимальный root-cause fix.

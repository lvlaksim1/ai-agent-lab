# OTK review — ios-runtime-release-20260918-008

Verdict: CORRECTED
Score: 4/10
Rating delta: -10
Progress: none
Worker: fedorych
Shift: 6
Object: ios-research-runtime

Федорыч сохранил доказательную дисциплину: root logic и proof gates не трогал, target commit b8219b9 действительно ограничен диагностическим dfilter, Windows Build успешен, Full Package skipped. Однако смена остановилась из-за якобы невозможности безопасно идентифицировать E2E run/artifact. ОТК независимо разрешил это без угадывания: по head_sha найден ровно один Windows End-to-End Boot run 35304626739 и его artifact ios-darwin-windows-e2e.

Артефакт уточняет картину сильнее, чем исходный handoff. В one-insn trace X22=0x12ed0000 уже на самом первом захваченном PC 0xfffffff0070d77d0 и остаётся таким через весь predecessor window до 0x...0d7828. Следовательно, текущий диапазон 0x...0d77d0+0x60 НЕ содержит производителя X22. Инструкция 0x...0d7828 является BL (после неё LR=0x...0d782c), но X22 существовал задолго до этого вызова. Поэтому продолжение исправлено: следующий шаг должен трассировать ещё более раннего производителя X22, а не повторять поиск внутри уже исключённого окна. Контракт offset-vs-absolute-PA пока не доказан, root-cause fix преждевременен.

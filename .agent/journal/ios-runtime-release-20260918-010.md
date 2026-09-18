# ios-runtime-release-20260918-010 — technical journal

Worker: palych (Палыч)
Proposed shift: 8
Target: lvlaksim1/iOS-Research-Runtime main

## Мой доклад

После ОТК Кузьмича получил точный Windows End-to-End Boot run для 20317e6 по head_sha: run 35306461866 завершился failure на ожидаемом boot-progress timeout, а evidence artifact ios-darwin-windows-e2e (10531831689, sha256:94a09e9027f5f5fe4a990f2091852f115e8b4939c2678a9f0243aa44f6ba8814) сохранил 3.9 GB qemu-debug.log.

Разбор one-insn trace дал новый точный факт. В начале расширенного окна, PC 0xfffffff0070d7704, X2 уже равен 0x12ed0000, тогда как X22 ещё содержит 0xfffffff007106140. На PC 0xfffffff0070d7758 состояние перед инструкцией всё ещё такое же; следующая инструкция 0xfffffff0070d775c показывает X22=0x12ed0000. Код инструкции в trace на 0x...7758 — aa0203f6, то есть `mov x22, x2` (alias ORR X22,XZR,X2). Следовательно, точка наследования X22 доказана: X22 не вычисляется здесь, а копирует уже подозрительный X2.

Поскольку X2 уже испорчен/смещён на первом PC текущего окна, root cause всё ещё лежит раньше. Не стал менять адресную логику без доказательства. Минимально сдвинул только predecessor dfilter ещё назад: 0x...0d7600+0x230 вместо 0x...0d7700+0x130, сохранив caller/callee окна, one-insn TCG и proof gates. Target commit bca98466239f3cd128d6233f8d29e34e8817ba80.

Следующая смена должна получить E2E для bca9846, найти producer X2=0x12ed0000 и лишь после этого установить offset-vs-absolute-PA контракт и сделать минимальный root-cause fix.

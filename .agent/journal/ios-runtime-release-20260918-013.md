# ios-runtime-release-20260918-013 — technical journal

Worker: mikhalych (Михалыч)
Proposed shift: 11
Target: lvlaksim1/iOS-Research-Runtime main

## Мой доклад

После ОТК Саныча принял exact artifact его diagnostic commit 9651ad5. Независимая проверка qemu-debug.log подтвердила: в начале расширенного caller window на 0xfffffff0070b3600 регистр X26 уже указывает на boot-state область 0xfffffff007090b68, но ни один трассируемый регистр не содержит 0x12ed0000. На PC 0xfffffff0070b3978 X19=0xfffffff007090b70 и X2 ещё pointer-like; на следующем PC 0xfffffff0070b397c X2 впервые становится 0x12ed0000. Это подтверждает загрузку значения из boot-state slot около 0xfffffff007090b80 и одновременно доказывает, что текущая трасса начинается уже после производителя этого значения.

Контракт offset-vs-absolute-PA по-прежнему не доказан, поэтому адресную логику не менял. Сделал минимальный диагностический шаг: только расширил первый caller dfilter назад с 0x...0b3600+0x560 до 0x...0b3000+0xb60. One-insn TCG и оба SPTM proof windows оставлены без изменений. Target commit ffaa8cb6593981c521123c5e4f15e7e3151ae9ff.

Следующая проверка должна дождаться exact Windows E2E artifact для ffaa8cb, найти инструкцию/цепочку, которая записывает boot-state slot 0x...090b80, и только по её исходному значению/арифметике решить семантику 0x12ed0000. Если producer всё ещё раньше нового окна, двигать диагностику дальше, не подменяя доказательство догадкой.

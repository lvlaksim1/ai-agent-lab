# ios-runtime-release-20260918-012 — technical journal

Worker: sanych (Саныч)
Proposed shift: 10
Target: lvlaksim1/iOS-Research-Runtime main

## Мой доклад

Принял от Петровича точную задачу: не гадать про контракт адреса, а разобрать exact Windows End-to-End Boot artifact для его diagnostic commit 24c320627651c84dd1d0d4f923ec301cb855d642 и найти реального производителя X2=0x12ed0000 перед вызовом SPTM.

По head_sha найден exact E2E run 35308479294, job boot-proof завершился failure; artifact ios-darwin-windows-e2e id 10531914738, digest sha256:dbfdb64e5a5699c77d816dd597bb13e51b56742036cda789d0046b63be2baa7e. Windows Build для того же head_sha прошёл, Full Package закономерно skipped.

Новый caller trace дал более сильное доказательство. На 0xfffffff0070b3978 инструкция `ldp` загружает X2 из boot-state структуры: непосредственно перед ней X19=0xfffffff007090b70, а на следующем PC X2 уже 0x12ed0000. Затем 0xfffffff0070b397c формирует X20=0xfffffff007100000, а 0xfffffff0070b3980 (`str x2,[x20,#0x730]`) сохраняет это значение в глобальный слот. Позже 0xfffffff0070b3a48 (`ldr x2,[x20,#0x730]`) загружает ровно то же 0x12ed0000 перед BL. Таким образом, ошибочное значение не создаётся в callee и не появляется при поздней арифметике: оно приходит из boot-state slot около 0xfffffff007090b80 и лишь копируется через глобальный slot +0x730.

Контракт offset-vs-absolute-PA всё ещё не доказан, поэтому root logic не менял. Минимально передвинул только caller diagnostic window раньше, на 0xfffffff0070b3600+0x560, сохранив one-insn TCG, два SPTM окна и все proof gates. Target commit 9651ad5fce73419e256ca57c25b137bb5c92e14a.

Следующая смена должна получить exact E2E artifact для 9651ad5, проследить формирование boot-state slot 0xfffffff007090b80 до его источника и лишь после доказательства семантики значения решать, требуется ли преобразование offset в absolute physical address.

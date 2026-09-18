# ios-runtime-release-20260918-016 — technical journal

Worker: fedorych (Федорыч)
Proposed shift: 14
Target: lvlaksim1/iOS-Research-Runtime main

## Мой доклад

Получил exact cbd8783869c11857a8042cac834461051daf8031 Windows End-to-End Boot run 35313620919 и его artifact `ios-darwin-windows-e2e` (artifact 10533663745). E2E действительно дошёл до provisioning/Darwin proof и завершился failure; failure evidence был сохранён.

Разобрал exact `qemu-debug.log`. Новое окно реально исполняется: в трассе присутствуют инструкции начиная как минимум с 0xfffffff0070b1400. Однако первое появление `X2=0x12ed0000` во всём artifact остаётся на состоянии после инструкции 0xfffffff0070b3978: на PC 0x...0b3978 X2 ещё равен pointer-like `0xfffffff007090000`, а уже на PC 0x...0b397c X2 равен `0x12ed0000`. Значит дополнительная страница 0x...0b1000 не показала более раннего carrier/producer этого значения.

Никакого offset-vs-absolute-PA исправления не делал: producer chain всё ещё не доказывает семантику. Также не стал снова слепо расширять dfilter ещё на страницу. Следующий шаг должен менять именно метод диагностики: найти способ трассировать запись/источник boot-state slot напрямую (например, через доступный QEMU memory/write tracing или эквивалентный точечный instrumentation), сохранив one-insn TCG и оба SPTM proof windows. Это полезнее очередного линейного расширения диапазона.

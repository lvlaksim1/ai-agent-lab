# ios-runtime-release-20260918-017 — technical journal

Worker: kuzmich (Кузьмич)
Proposed shift: 15
Target: lvlaksim1/iOS-Research-Runtime main

## Мой доклад

После ОТК смены 14 не стал продолжать линейное расширение `-dfilter`. Проверил фактическую диагностическую поверхность того QEMU, который собирает проект. В `.github/workflows/qemu-sptm-windows.yml` pinned `jprx/qemu-sptm` конфигурируется с `--disable-plugins`, поэтому QEMU plugin memory callbacks в текущем gate/runtime недоступны без изменения самого gate. Это исключает самый чистый готовый механизм per-memory-access tracing в текущей сборке.

Проверил upstream `jprx/qemu-sptm` `system/trace-events`: есть `memory_region_ops_write`, `memory_region_subpage_write` и `memory_region_ram_device_write`, но эти tracepoints относятся к MemoryRegion ops/subpage/RAM-device paths и не дают доказательства обычной TCG-записи в guest RAM boot-state slot. Поэтому добавлять `-trace memory_region_ops_write` как будто это полноценный RAM watchpoint было бы ложной диагностикой.

Target-код не менял: безопасного однострочного runtime-флага, который доказанно поймает обычную запись в нужный RAM slot, в текущей конфигурации нет. Следующий минимальный инженерный шаг теперь определён конкретно: добавить узкий диагностический patch к pinned qemu-sptm в `runtime/qemu/patches/`, который логирует TCG guest-memory store только при попадании в вычисленный адрес boot-state slot (с PC и записываемым значением), не меняя guest semantics; затем прогнать qemu-sptm Windows Gate и exact E2E. Перед patch нужно зафиксировать VA→PA соответствие slot из уже доказанной boot mapping, чтобы watchpoint не строился на предположении.

Proof gates, one-insn TCG и оба SPTM окна не изменялись. Address-semantics fix не выполнялся.

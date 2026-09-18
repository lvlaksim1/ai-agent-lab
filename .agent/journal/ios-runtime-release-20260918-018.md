# ios-runtime-release-20260918-018 — technical journal

Worker: palych (Палыч)
Proposed shift: 16
Target: lvlaksim1/iOS-Research-Runtime main

## Мой доклад

После ОТК Кузьмича проверил именно предпосылку для будущего RAM watchpoint, а не стал сразу патчить QEMU. В pinned `jprx/qemu-sptm` загрузчик SPTM задаёт отображение формулой `vtop(mi, v) = mi->physlo + (v - mi->virtlo)`: SPTM Mach-O получает `physlo` только при фактической загрузке, а `virtlo` берётся из Mach-O. Значит адрес boot-state slot 0xfffffff007090b80 нельзя честно превратить в константный PA только из его VA или из `dram_base`; нужен фактический `sptm_mi.physlo/virtlo` конкретного provisioned SPTM либо эквивалентное runtime translation evidence. Это подтверждает, что преждевременный hard-coded PA watchpoint был бы предположением.

Одновременно локализовал правильный слой для будущей диагностики: обычные translated guest stores проходят через TCG qemu store machinery (`tcg_gen_qemu_st_i64` и system-emulation TLB/store handling in `accel/tcg/cputlb.c`), тогда как plugins в нашем gate отключены. Здесь можно получить runtime guest address/translation и значение без подмены guest semantics, но фильтр нельзя фиксировать до доказательства mapping.

Target-код и proof gates не менял. Следующий минимальный шаг: добавить диагностический patch, который сначала печатает/проверяет фактическую SPTM mapping (`virtlo`, `physlo` и вычисленный PA slot) при загрузке, а затем использует этот доказанный PA в узком TCG-store probe; после этого прогнать qemu-sptm Windows Gate и exact E2E. Address-semantics fix по-прежнему запрещён до результата probe.

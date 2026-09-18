# ios-runtime-release-20260918-021 — technical journal

Worker: mikhalych (Михалыч)
Proposed shift: 19
Target: lvlaksim1/iOS-Research-Runtime main

## Мой доклад

После ОТК Саныча не стал ещё раз наугад менять 0009. Независимо проверил target commit f992023 и authoritative CI: обычный Windows Build действительно PASS, но qemu-sptm Windows Gate снова падает в единственном агрегированном шаге `Apply Windows portability patch`; configure/build и все proof steps skipped.

Проверил сам 0009 против pinned upstream source. После исправления Саныча hunk арифметически согласован: 6 старых контекстных строк + 16 additions = 22 новых строк. Контекст вокруг `macho_load(&sptm_mi, blob_head)` присутствует в pinned `xnuboot_sptm.c`; предшествующие диагностические 0005 и 0006 меняют другие участки того же файла, а `.gitattributes` принудительно держит `*.patch` в LF. Поэтому доказательств для ещё одной правки 0009 сейчас нет. Важно: job metadata не раскрывает stderr `git apply --check`, а только общий failing step, поэтому нельзя честно утверждать, что после hunk-count fix падает именно 0009, а не другой элемент stack.

Код не менял: следующая минимальная диагностическая мера должна сделать failing patch и stderr durable CI evidence (например, всегда сохраняемый patch-apply log/summary) без ослабления `git apply --check`. После этого исправлять только доказанный patch defect и требовать полный qemu-sptm Gate PASS. Exact E2E, TCG-store probe и address semantics остаются запрещены до SPTM_MAP.

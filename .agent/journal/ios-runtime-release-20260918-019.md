# ios-runtime-release-20260918-019 — technical journal

Worker: petrovich (Петрович)
Proposed shift: 17
Target: lvlaksim1/iOS-Research-Runtime main

## Мой доклад

После ОТК Палыча взял только доказанный следующий шаг: перестал пытаться угадать физический адрес boot-state slot и добавил отдельный diagnostic-only patch к pinned qemu-sptm. Он выполняется сразу после `macho_load(&sptm_mi, blob_head)`, то есть в точке, где `sptm_mi.physlo` уже назначен фактической загрузкой, а `virtlo` известен из SPTM Mach-O. Диагностика печатает `virtlo`, `physlo`, известный slot VA и `vtop()`-вычисленный slot PA. Guest semantics, dfilter proof windows и Definition of Done не менялись.

Намеренно не добавлял TCG-store фильтр в ту же смену до получения этого runtime значения: иначе фильтр снова опирался бы на недоказанный PA и нарушил бы порядок evidence gates, который только что подтвердил ОТК. Коммит с patch запустил Windows Build и qemu-sptm Windows Gate; оба прогона на момент завершения смены queued, поэтому успешную компиляцию пока не заявляю.

Следующий шаг после ОТК: сначала проверить `git apply`/build нового patch и получить `SPTM_MAP` из exact E2E; только затем добавить узкий observational probe в TCG store path, фильтрующий доказанный runtime-derived slot PA и печатающий producer PC/value. Никакой address-semantics fix до результата probe.

# Начальник участка — обзор 5

**Объект:** `ios-research-runtime`  
**Решение:** `KEEP_COURSE`  
**Здоровье:** `YELLOW`

## Обстановка

Производство остаётся в фазе `boot-debugging` и движется по доказательному маршруту. После локализации boot-state slot работа дошла до необходимости получить фактическое runtime SPTM mapping и только из него вывести физический адрес для узкого диагностического probe. Корневая адресная семантика по-прежнему не должна правиться предположением.

Текущий конкретный блокер — `qemu-sptm Windows Gate`: aggregate Apply Windows portability patch не проходит. До дальнейших runtime-изменений необходимо сделать durable evidence точного failing patch и `git apply --check` stderr, исправить только доказанный applicability defect и вернуть полный gate в PASS.

## Управленческое решение

Курс сохраняется. STOP, новая директива, смена объекта, изменение состава бригады или решение владельца сейчас не обоснованы.

Следующий контрольный рубеж: восстановленный pinned Windows gate → exact E2E → runtime SPTM mapping → доказанный PA/producer/contract → только после этого минимальный root-cause patch.

**Decision:** `DEC-005`.

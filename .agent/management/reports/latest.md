# Начальник участка — решение владельца

**Объект:** `ios-research-runtime`  
**Решение:** `AUTHORIZE_APFS_EVIDENCE_AND_RESUME`  
**Здоровье:** `YELLOW`

## Обстановка

Владелец разрешил добавить диагностический APFS evidence channel и возобновить производство.

Предыдущая причинная граница сохраняется: exact Windows E2E доходит до BSD root `md0`, rebuilt recovery APFS падает с `mountroot error 79`. Теперь у бригады есть разрешение получить недостающее source-vs-rebuilt structural evidence непосредственно через Windows E2E.

## Управленческое решение

Снята блокировка `owner_decision_required`. Создана директива `DIR-011` и производственное продолжение `ios-runtime-release-20260918-031`.

Следующая смена обязана сначала добавить компактный diagnostic structural dump NX/APFS/checkpoint metadata, затем получить и потребить exact E2E evidence. APFS writer разрешено менять только после доказательства конкретного причинно несовместимого поля.

Proof gates и Definition of Done не ослабляются. Производство возобновлено штатным GitHub wake; Scheduled Tasks не изменялись.

**Decision:** `DEC-011`.

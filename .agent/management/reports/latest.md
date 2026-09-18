# Начальник участка — обзор 9

**Объект:** `ios-research-runtime`  
**Решение:** `HOLD_EVIDENCE_BLOCK`  
**Здоровье:** `BLOCKED`

## Обстановка

Производство сейчас корректно простаивает: production state `idle`, production wake не pending. Подтверждённая граница прежняя — exact Windows E2E дошёл до BSD root `md0`, rebuilt recovery APFS падает на `mountroot error 79`.

Причинное свидетельство для следующей writer-правки по-прежнему недоступно: нужен exact E2E artifact/full job log либо эквивалентный компактный structural dump source-vs-rebuilt NX/APFS/checkpoint metadata. Без него новая смена повторит уже выполненную диагностику или будет вынуждена гадать.

## Управленческое решение

Сохраняю `BLOCKED` и не будю производство. APFS writer и proof gates не трогаем. Перевод и emergency STOP не нужны.

Решение владельца остаётся необходимым: дать production доступ к exact E2E artifact/full log или передать эквивалентный structural dump, после чего можно возобновить доказательную локализацию первого несовместимого metadata field.

**Decision:** `DEC-009`.

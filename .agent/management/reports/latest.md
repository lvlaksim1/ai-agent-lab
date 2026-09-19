# Начальник участка — обзор DEC-033

**Объект:** `ios-research-runtime`  
**Решение:** `STOP_AND_REPAIR_CONTROL_PLANE`  
**Здоровье:** `RED`

## Обстановка

Продуктовый курс не сломался: decoded source/rebuilt NXSB evidence уже проведён end-to-end, а следующий доказанный шаг остаётся exact Windows E2E. Но смена №59 не смогла законно перейти к target-работе: `Agent Runtime Check` упал уже на commit нормального production lease claim, а затем снова на immutable start-report commit. Предыдущий idle OTK-finalized state этот же gate проходил.

Сам стартовый доклад смены №59 содержит все обязательные literal markers v2, поэтому evidence не поддерживает гипотезу о простой ошибке формата доклада. Граница дефекта — orchestration transition из валидного idle state в production processing claim.

## Управленческое решение

Новые production shifts остановлены. `DIR-015` запрещает обходить, ослаблять или отключать runtime/report/heartbeat/lease gates и запрещает переписывать immutable start report. После восстановления control plane продуктовая работа возвращается ровно к exact Windows E2E; APFS writer остаётся заморожен до causal structural evidence.

## Что требуется от владельца

Разрешить отдельное исправление control-plane/runtime-инварианта в `lvlaksim1/ai-agent-lab`, после чего автоматически возобновить производство на сохранённом продуктовым маршруте.

## Зачем это нужно

Production protocol не разрешает target-repository работу, пока `Agent Runtime Check` для production claim/start-report boundary не проходит. После исправления gate следующая смена сможет продолжить exact Windows E2E без повторения уже завершённой NXSB локализации.

## Варианты ответа

1. **Рекомендуемый:** `Разрешаю исправить control-plane Agent Runtime Check в ai-agent-lab без ослабления инвариантов и после успешной проверки возобновить производство.` — разрешает локализовать и исправить orchestration regression, проверить неизменённый gate и затем автоматически снять STOP.
2. `Оставить производство остановленным. Control plane пока не менять.` — объект остаётся законсервирован на текущем доказанном product continuation; новые смены не запускаются.

**Decision:** `DEC-033`.  
**Directive:** `DIR-015`.
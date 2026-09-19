# Отчёт начальника участка

Объект: iOS-Research-Runtime
Решение: DEC-047 — CHANGE_COURSE
Директива: DIR-019
Здоровье: RED
Фаза: boot-debugging

После восстановления смены №74 производство idle. Persistent state фиксирует уже три подряд no-progress/runtime-loss смены: инженерное направление не опровергнуто, но прежний способ исполнения систематически не успевает превратить уже локализованную Name/ModTime snapshot-preservation mutation в durable target commit.

Курс исполнения изменён без изменения продуктовой цели. DIR-019 запрещает очередную локализацию: после успешного обязательного start-report gate первая target-операция — bounded CAS mutation в `iOS-Research-Runtime/main`; сразу после неё должен быть сохранён checkpoint с точным target SHA. Только затем разрешены focused tests, Windows gate и exact Windows E2E.

Если точный bounded edit невозможно восстановить из уже сохранённого authoritative evidence без новой разведки, следующая смена должна зафиксировать конкретно недостающий patch/evidence и остановиться; это позволит менеджеру чинить handoff contract вместо повторения одинаковой работы.

APFS writer вне bounded mutation остаётся заморожен. STOP, transfer и решение владельца не требуются; производство может продолжить автоматически по DIR-019.
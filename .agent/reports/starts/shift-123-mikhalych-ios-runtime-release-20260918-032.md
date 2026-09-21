Проект: iOS-Research-Runtime
Работник: Михалыч
Смена: №123
Начало смены: 21.09.2026 04:36:16 МСК

СТАРТОВЫЙ ДОКЛАД:

ОЦЕНКА ПРЕДШЕСТВЕННИКА:
Саныч отработал коротко из-за подтверждённой потери runtime, но успел сузить DIR-029 полезным read-only наблюдением: текущий evidence scanner берёт первый физически parseable APSB вместо разрешения authoritative active volume через NX object mappings. ОТК оценил смену 8/10 и сохранил точные review paths. Это не доказанный mountroot defect, поэтому семантические правки пока запрещены.

МОЙ ПЛАН:
Продолжаю ровно с этой границы: сначала найду в текущем target коде путь physical-first APSB selection и сопоставлю его с доступным NX object-map resolution в закреплённом APFS reader. Затем получу read-only evidence именно для authoritative live volume и проверю первый object/lookup/invariant, который может объяснять error 79. Критерий успеха: либо доказать конкретный bounded causal defect на authoritative live-volume path, либо документированно исчерпать доступные read-only маршруты; только при доказанном defect разрешена минимальная правка с terminal focused tests, Windows gate и exact Windows E2E в этой же смене.

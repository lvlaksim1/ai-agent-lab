# ОТК — смена №145 — Петрович

**ЧТО ПЛАНИРОВАЛ:**
Петрович принял DIR-029 с узким планом: добавить read-only сравнение B-tree node `Flags`, `Level`, `NumberOfKeys` для source/rebuilt extentref и snapmeta roots, затем прогнать Windows gate и exact E2E; APFS semantic mutation до конкретного discriminator была запрещена.

**ЧТО ФАКТИЧЕСКИ СДЕЛАНО:**
На target SHA `bbe4b9748466ed243f9ba595c2dd22018c9fd65f` landed diagnostics-only node-shape instrumentation. Windows Build `35608022838` завершился SUCCESS. Exact Windows E2E `35608022767` завершился FAILURE уже после потери runtime, но оставил требуемый artifact.

**ЧТО ПОДТВЕРЖДЕНО:**
Artifact дал новый конкретный discriminator. Extentref root: source `flags=1, level=1, keys=7`, rebuilt `flags=1, level=1, keys=13`. Snapmeta root совпадает по форме: `flags=3, level=0, keys=0` с обеих сторон. Значит, snapmeta node-shape как причина отсекается, а extentref сузился до содержимого/набора записей root node. Сам mountroot по-прежнему падает, поэтому исправление ещё не доказано.

**ГДЕ ОСТАНОВИЛСЯ:**
Последний подтверждённый heartbeat — 21.09.2026 16:49:11 МСК; stale boundary — 16:52:11 МСК; recovery — 16:58:02 МСК. Runtime loss подтверждён и не является добровольной передачей смены.

**СЛЕДУЮЩЕМУ:**
Не расширять поиск назад. Сравнить extentref root records/keys/values, объясняющие `7` против `13`, и только после локализации bounded causal defect решать вопрос о semantic mutation. Exact E2E failure `35608022767` и его `apfs-structural-evidence.json` — исходная доказательная точка.

**ОЦЕНКА ОТК:**
- Полезный подтверждённый прогресс: **4/4**
- Инженерное качество: **3/3**
- Эффективность/фокус при живом runtime: **2/2**
- Стартовая оценка и план: **1/1**
- **Итого: 10/10 — APPROVED**
- Рейтинг Петровича: **1350 (+50)**
- Класс прогресса: **substantial**

# Смена 37 — Иваныч

## ОЦЕНКА ПРЕДШЕСТВЕННИКА

Борисыч корректно удержал запрет на спекулятивные изменения APFS writer и повторно подтвердил уже известную реализационную границу decoded-layer NXSB evidence, но runtime loss оборвал смену до изменения целевого кода. ОТК оценил смену 36 на 5/10: нового проверенного прогресса нет, continuation остаётся полностью actionable.

## МОЙ ПЛАН

Реализую минимальный read-only evidence channel: source NXSB сниму через decoded `disk.OpenWithOffset`, rebuilt NXSB — из bare APFS staging после `CreateContainer`; затем протяну структурные snapshots в exact E2E evidence. Writer semantics не меняю до получения причинного mismatch. Критерий успеха этой смены: целевой код содержит безопасный decoded-layer source/rebuilt NXSB snapshot, обязательные gates проходят, а exact Windows E2E либо выдаёт первый конкретный причинный APFS metadata mismatch, либо доказательно сужает следующий шаг без спекулятивной writer-правки.

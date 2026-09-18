# Shift 30 — Федорыч — ios-runtime-release-20260918-032

## Оценка предыдущего
Иваныч создал read-only source-vs-rebuilt APFS structural evidence channel и exact E2E artifact. ОТК признал технический прогресс существенным, но исправил оценку на CORRECTED из-за недоказанного forced-stop при ещё идущем CI.

## План
Потребить terminal E2E evidence без спекулятивного изменения writer. Если artifact bytes недоступны через connector, пройти evidence-acquisition ladder и создать минимальный metadata-visible diagnostic channel, затем дождаться terminal evidence и продолжить причинную цепочку.

## Промежуточный checkpoint
- Exact Windows E2E run 35390159689 подтверждён terminal failure на commit 3645cc63e25f524097b29ea784ddf90fe412f827.
- Artifact `ios-darwin-windows-e2e` существует, размер 1854 bytes, но connector не разрешает прямой binary artifact download endpoint.
- Job metadata подтверждает failure на `Run provisioning and Darwin root-shell proof`, а сбор failure evidence и upload artifact успешны.
- По evidence ladder выбран безопасный route 7/8: добавлен изолированный workflow `.github/workflows/apfs-evidence-marker.yml`, который скачивает exact artifact внутри GitHub Actions и публикует первые structural differences в имени нового artifact, доступном через metadata API.
- Первый marker run 35391540537 доказал, что exact artifact внутри Actions скачивается успешно, но первоначальный parser упал на encode step.
- Workflow сделан robust commit 3002545ae99f5e42b480c419f2518794d1f12ce4: при наличии JSON сравнивает source/rebuilt case-insensitively; если JSON отсутствует, кодирует хвост integration.log в metadata-visible marker.
- Второй marker run 35391593053 запущен и сейчас in_progress на шаге Download exact E2E evidence. Смена НЕ завершена; lease остаётся у fedorych. После terminal результата нужно прочитать artifact metadata этого run и продолжить в той же причинной цепочке.

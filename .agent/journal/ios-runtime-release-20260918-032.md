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
- Workflow сделан robust commit 3002545ae99f5e42b480c419f2518794d1f12ce4.
- После abrupt runtime loss смена восстановлена по stale lease/checkpoint. Marker run 35391593053 уже terminal SUCCESS.
- Его metadata-visible artifact дал точную причину отсутствия `apfs-structural-evidence.json`: integration diagnostic падает ДО `RamdiskProvisioningService` на `ApfsStructuralEvidence.Read(firmware/ramdisk.dmg)` с `No valid APFS NXSB superblock found`.
- Это дефект диагностического reader, а не доказательство дефекта исходного ramdisk: production `ios-ramdisk-tool` успешно открывает тот же DMG через `apfs.OpenImage`, который использует `disk.OpenWithOffset` и тем самым декодирует/нормализует disk-image layer перед APFS parser.
- Следующий evidence-backed шаг: не менять APFS writer. Перенести structural snapshot на уровень `ios-ramdisk-tool`/`disk.OpenWithOffset`, где доступен partition-relative decoded `io.ReaderAt`; снять source NXSB до rebuild и rebuilt NXSB после rebuild, записать compact JSON в уже существующий E2E artifact. После этого повторить exact E2E и сравнить первое отличающееся причинное поле.
- Смена остаётся незавершённой; никаких writer semantic changes не сделано.

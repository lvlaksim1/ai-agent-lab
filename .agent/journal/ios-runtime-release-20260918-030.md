# ios-runtime-release-20260918-030 — Борисыч

## Predecessor assessment
Михалыч правильно потребил terminal gate/E2E и не стал лечить APFS вслепую: доказано, что прежний Win64 address-width blocker снят, а точный E2E теперь упирается в mountroot error 79 на rebuilt recovery APFS.

## Original plan
Разобрать exact E2E failure evidence и сопоставить исходный/rebuilt APFS на уровне NX/APFS superblock/checkpoint metadata. Критерий успеха: доказать первое несовместимое поле до изменения writer.

## Evidence and result
- Exact E2E run 35349512313 подтверждён как completed/failure на commit 7e6ecb9a15b1a0252ad02b0f82d2e71b1fb1737f.
- Репозиторий подтверждает, что `tools/ios-ramdisk-tool/main.go` открывает исходный APFS через go-apfs-v2, сохраняет container/volume identity metadata и затем полностью пересобирает контейнер через `apfswrite.CreateContainer`.
- Override `apfswrite/super.go` синтезирует NX superblock/checkpoint geometry заново: BlockSize/BlockCount, incompat features, NextOID/NextXID, checkpoint descriptor/data areas, spaceman/omap/reaper references и live/predecessor checkpoint copies. Это подтверждает, что область для структурного сравнения выбрана причинно, а не по совпадению строки error 79.
- Однако доступный GitHub connector возвращает metadata exact E2E и исходники, но не предоставляет содержимое бинарного `ios-darwin-windows-e2e` artifact или полный job log stream. Без байтов исходного/rebuilt APFS нельзя доказать первое различающееся поле NX/APFS/checkpoint metadata.

Код APFS writer не изменён: любая правка конкретного поля сейчас была бы спекулятивной и нарушила бы ограничение события. Proof gates и таймауты не тронуты.

## Handoff
Следующая смена должна получить exact E2E artifact 35349512313 (или эквивалентное извлечённое структурное свидетельство), снять компактный source-vs-rebuilt dump NX/APFS superblock/checkpoint metadata и назвать первое несовместимое поле. Только после этого менять `apfswrite`. Если artifact остаётся недоступен через runtime tooling, это внешний evidence-access blocker, а не повод угадывать APFS semantics.

Authoritative shift start: 2026-09-18T19:14:19Z.

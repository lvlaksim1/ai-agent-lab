# Shift 31 — Кузьмич — continuation ios-runtime-release-20260918-032

## Оценка предыдущего
Федорыч доказал, что текущий C# structural reader падает на исходном DMG до rebuild и потому не измеряет writer. ОТК принял его runtime-loss смену 9/10: diagnostic workflow был изолирован, writer semantics и proof gates не менялись.

## План
Перенести source/rebuilt NXSB snapshot на тот же decoded image layer, которым реально пользуется ios-ramdisk-tool, затем повторить exact Windows E2E и только по доказанному structural diff решать вопрос о writer correction.

## Промежуточный checkpoint
- Подтверждено по upstream go-apfs-v2 v0.3.0: `disk.OpenWithOffset` распознаёт UDIF по `koly`, открывает DMG через `OpenDMG` и возвращает уже partition-relative decoded `io.ReaderAt`; для bare APFS возвращает reader с offset 0. Это ровно слой, которого не хватает C# диагностике.
- Текущий `ios-ramdisk-tool/main.go` открывает source через `apfs.OpenImage`, затем создаёт rebuilt bare APFS во временном raw-файле и только после этого оборачивает его в DMG. Следовательно оба структурных снимка можно снять внутри Go без изменения writer semantics: source через `disk.OpenWithOffset(opts.input)`, rebuilt из временного raw APFS до `WrapRawImageDMGFrom`.
- Текущий C# `ApfsStructuralEvidence` читает raw DMG напрямую и поэтому должен быть выведен из критического пути exact E2E после появления Go-side evidence.
- Набор уже согласованных полей и offsets сохранён в `tools/IOSResearchRuntime.Integration/ApfsStructuralEvidence.cs`: block size/count, feature masks, UUID, OID/XID, next OID/XID, checkpoint descriptor/data geometry, spaceman/omap/reaper OID и flags.
- Следующее изменение должно быть диагностическим: Go-side compact JSON `source/rebuilt`, переданный в существующий E2E logs artifact. APFS writer пока не менять.
- В этой runtime-сессии доступный GitHub connector заменяет существующий файл только полным содержимым; частичный patch main.go не поддерживается. Локальный container не имеет сетевого доступа к GitHub, поэтому безопасный многострочный patch main.go не был отправлен вслепую. Смена остаётся незавершённой; никаких target-repository writes после claim не сделано.

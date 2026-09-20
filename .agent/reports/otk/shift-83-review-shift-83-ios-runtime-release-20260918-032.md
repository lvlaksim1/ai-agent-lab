# ОТК — смена №83 — Михалыч

**ЧТО ПЛАНИРОВАЛ:** проследить происхождение evidence binary в exact Windows E2E, устранить stale/mismatched evidence path без изменения APFS writer и добиться фактического APSB/Volume evidence на текущем target SHA.

**ЧТО ФАКТИЧЕСКИ СДЕЛАНО:** evidence path доведён до target `b5d83ecb7f4d914c00cc0ac7e568ecb724d8c567`; Windows gate `35486388002` прошёл. Михалыч держал смену на active evidence wait exact E2E `35486388059`, после чего runtime был потерян.

**ЧТО ПОДТВЕРЖДЕНО:** E2E `35486388059` завершился FAILURE, но его artifact уже содержит требуемый APSB `volume` блок и подтверждает `APPLICATION_SHA=b5d83ec...`. Source/rebuilt совпадают по основным feature flags, tree types, UUID, role и volume flags. Выделились конкретные семантические различия: `metaCryptoKeyOsVersion` 407249186 против 0 и `modificationTime` 1789017426360965200 против 0; error 79 при этом сохраняется. Runtime loss подтверждён GitHub-якорями: последний heartbeat 06:23:19 МСК, stale boundary 06:26:19 МСК, recovery 06:34:02 МСК.

**ГДЕ ОСТАНОВИЛСЯ:** на полученном terminal APSB evidence. Это уже не проблема отсутствующего evidence producer; следующий рубеж — определить, какие из выявленных APSB различий причинны для mountroot error 79.

**СЛЕДУЮЩЕМУ:** не менять writer по XID. Сначала проверить точное reader/writer/upstream отображение APSB полей, прежде всего meta-crypto key OS version и volume modification time; затем делать только доказанную bounded mutation и повторять Windows gate + exact E2E.

**ОЦЕНКА:** полезный прогресс 4/4; инженерное качество 3/3; эффективность/фокус 2/2; стартовая оценка и план 1/1. **Итого: 10/10 — APPROVED. Рейтинг Михалыча: 1200 (+50).**

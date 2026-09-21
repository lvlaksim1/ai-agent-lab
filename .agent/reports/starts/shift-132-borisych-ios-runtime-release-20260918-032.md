# Стартовый доклад — смена 132 — Борисыч

ОЦЕНКА ПРЕДШЕСТВЕННИКА

Михалыч получил 9/10 и дал существенный диагностический прогресс: exact E2E 35563857728 подтвердил корректность source/rebuilt live-volume root-tree OMAP mapping, object header/type/subtype и Fletcher checksum. Он не стал делать спекулятивную APFS-мутацию и сузил следующий discriminator до соседних extentref/snapshot-metadata trees. Смена завершилась только из-за подтверждённой потери runtime, а target остался без изменений.

МОЙ ПЛАН

Продолжаю DIR-029 ровно с оставленной границы и не повторяю generic mountroot/APSB/root-tree анализ. Получу read-only evidence для live-volume extentrefTreeOid и snapMetaTreeOid на source и rebuilt: OMAP resolution/physical block, object header OID/XID/type/subtype и stored/computed Fletcher checksum. Если первый конкретный structural/lookup/validation mismatch локализован и причинность доказана, выполню только bounded repair и проверю его штатными тестами/Windows E2E; иначе продолжу evidence-acquisition без семантической APFS-мутации. Критерий успеха смены: либо доказанный и проверенный bounded causal repair, либо новый конкретный structural discriminator, который исключает/подтверждает extentref/snapshot-metadata path на точном failing evidence.

ОЦЕНКА ПРЕДШЕСТВЕННИКА

Иваныч получил 5/10 APPROVED: ОТК подтвердил runtime_loss на стартовом барьере до DIR-017 mutation, без нового инженерного результата и без небезопасных изменений target. Его обязательный v2 start report не успел появиться, поэтому направление беру не из реконструкции его слов, а из действующего DIR-017 и накопленного checkpoint evidence. Повторять уже закрытую API/architecture разведку не буду.

МОЙ ПЛАН

Сразу внесу минимальную bounded snapshot-preservation mutation в `lvlaksim1/iOS-Research-Runtime` `main`: перечислю source snapshots и заполню `apfswrite.CreateOptions.Snapshots` значениями `SnapshotSpec{Name, ModTime}`, используя `ChangeTime` и `CreationTime` только как fallback при нулевом ChangeTime. Первый критерий успеха — mutation закоммичена и в orchestration checkpoint записан её точный target SHA. После этого выполню focused tests, обязательный Windows gate и exact Windows E2E; APFS writer за пределами этой bounded mutation не трогаю без нового причинного structural evidence.

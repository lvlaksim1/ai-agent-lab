Проект: iOS-Research-Runtime
Работник: Борисыч
Смена: №68
Начало смены: 19.09.2026 22:01:34 МСК

СТАРТОВЫЙ ДОКЛАД:

ОЦЕНКА ПРЕДШЕСТВЕННИКА:
Михалыч направление не потерял: ОТК подтвердил 5/10 и runtime_loss после обязательного report gate, но до target mutation. Полезного проектного результата за смену не появилось — main остался на 2b1003bb7e123b696e513c0ef9ec736477c2271f. Поэтому повторять уже выполненную разведку snapshot API не буду: узкое место и bounded-правка определены достаточно точно.

МОЙ ПЛАН:
Сразу выполняю DIR-017 mutation-first: в tools/ios-ramdisk-tool/main.go перечисляю source snapshots и передаю их в apfswrite.CreateOptions.Snapshots как SnapshotSpec{Name, ModTime}, используя ChangeTime и CreationTime как fallback при нулевом ChangeTime. Сразу после target commit закрепляю его точный SHA в orchestration checkpoint. Затем запускаю focused tests, Ramdisk Tool Windows gate и exact Windows E2E и потребляю terminal evidence в этой же смене. Критерий успеха первого этапа — bounded snapshot-preservation реально находится в target main и её SHA сохранён; более широкую семантику APFS writer без нового causal evidence не меняю.

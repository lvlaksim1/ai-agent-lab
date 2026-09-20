Проект: iOS-Research-Runtime
Работник: Палыч
Смена: №96
Начало смены: 20.09.2026 14:03:55 МСК

СТАРТОВЫЙ ДОКЛАД:

ОЦЕНКА ПРЕДШЕСТВЕННИКА:
Кузьмич оставил полезный и безопасный результат: точная bounded-мутация APSB modificationTime через FixedTime прошла Windows helper/build проверки, а терминальный E2E уже после его runtime loss показал, что rebuilt modificationTime всё равно остаётся нулевым и mountroot error 79 сохраняется. ОТК оценил смену 9/10: гипотеза проверена честно и фактическим прогоном опровергнута, XID/checkpoint semantics не тронуты. Теперь нельзя продолжать по прежнему предположению — нужен точный mapping writer-кода.

МОЙ ПЛАН:
Сначала по pinned APFS writer найду фактическое место формирования VolumeSuperblock.ModificationTime и прослежу, куда реально применяется CreateOptions.FixedTime. Сопоставлю это с terminal APSB evidence shift 95 и отделю ошибку mapping от отдельного mismatch metaCryptoKeyOsVersion. Никакой новой APFS-мутации до доказанного producer-field mapping. Критерий успеха: точное source-level доказательство, почему FixedTime дал rebuilt modificationTime=0, после чего либо минимальная bounded правка конкретного APSB поля с проверкой, либо доказанный следующий discriminating evidence step без спекуляции.

Проект: iOS-Research-Runtime
Работник: Борисыч
Смена: №92
Начало смены: 20.09.2026 12:01:41 МСК

СТАРТОВЫЙ ДОКЛАД:

ОЦЕНКА ПРЕДШЕСТВЕННИКА:
Я наследую от Михалыча подтверждённую точную границу изменения: target остаётся неизменённым, Reporting v2 gate у него был пройден, а безопасная мутация сведена к сохранению source APSB modificationTime через существующий FixedTime. Он правильно не стал заменять большой main.go по усечённому whole-file ответу, но DIR-023 остался невыполненным: детерминированная bounded-реконструкция authoritative preimage и проверка blob SHA не завершены.

МОЙ ПЛАН:
Я выполню DIR-023 буквально: сначала соберу tools/ios-ramdisk-tool/main.go из неперекрывающихся bounded GitHub reads и проверю, что реконструированный preimage соответствует authoritative target blob SHA. Только после этого выполню локальную whole-file CAS мутацию APSB modificationTime → FixedTime, не трогая XID/checkpoint semantics и MetaCryptoKeyOSVersion. Критерий успеха: exact preimage доказан по blob SHA, mutation commit закреплён точным target SHA, focused tests и Windows gate успешны, а exact Windows E2E доведён до терминального результата и его evidence потреблён.

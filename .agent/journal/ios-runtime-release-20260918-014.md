# ios-runtime-release-20260918-014 — technical journal

Worker: borisych (Борисыч)
Proposed shift: 12
Target: lvlaksim1/iOS-Research-Runtime main

## Мой доклад

После приёмки Михалыча взял exact ffaa8cb E2E artifact. Независимая проверка qemu-debug.log подтверждает, что расширение caller dfilter до 0x...0b3000 не обнаружило более раннего регистра с 0x12ed0000: на 0x...0b3978 X2 ещё pointer-like, а на 0x...0b397c уже равен 0x12ed0000 после загрузки из boot-state slot около 0x...090b80. Значит producer этого слота всё ещё находится раньше наблюдаемого интервала.

Корневую адресную семантику не менял. Сделал минимальное продолжение диагностической бисекции: расширил только первый caller/producer dfilter ещё на одну страницу назад, с 0x...0b3000+0xb60 до 0x...0b2000+0x1b60. One-insn TCG и оба SPTM proof windows сохранены без изменений. Target commit b1295ce50e6cad6ec371ef184f3d367593fbc1ef.

Новый push запускает Windows Build и Windows End-to-End Boot. Следующая проверка должна использовать exact artifact именно b1295ce и искать первую запись/формирование boot-state slot 0x...090b80. До доказательства producer chain нельзя превращать 0x12ed0000 в предполагаемый абсолютный PA эвристикой.

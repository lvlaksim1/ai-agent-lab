# Production journal — ios-runtime-release-20260918-025

Object: ios-research-runtime
Worker: Кузьмич (kuzmich)
Proposed shift: 23
shift_started_at_utc: 2026-09-18T11:48:59Z

## ОЦЕНКА ПРЕДЫДУЩЕГО
Федорыч оставил полезный диагностический крючок и не стал менять адресную семантику без доказательства.

## МОЙ ПЛАН
Проверить terminal qemu-sptm gate, затем exact E2E и численно проверить связь SPTM_BOOTARGS с 0x12ed0000. Семантическую правку делать только при прямом доказательстве контракта.

## Evidence
- qemu-sptm Windows Gate 35339282982: SUCCESS для целевого commit 20ef7d96ec4546d2d6ff678f37223bf1173f386e.
- Windows E2E 35340724080: FAILURE по неизменённому 5-minute XNU/launchd/root-shell progress gate; provisioning прошёл.
- `SPTM_BOOTARGS physBase=0x10000000000 topOfKernelData=0x12ed0000 topOffset=0xffffff0012ed0000 argsPA=0x10007768000`.
- Loader source перед диагностикой делает `args.topOfKernelData = blob_head`.
- Следовательно гипотеза `topOfKernelData - physBase == 0x12ed0000` опровергнута: сам topOfKernelData уже равен 0x12ed0000, а вычитание physBase даёт underflow 0xffffff0012ed0000.

## Result
Семантическую правку не делал. Новый доказанный факт: подозрительное 0x12ed0000 уже находится в сформированном loader boot_args до исполнения SPTM; текущих данных недостаточно, чтобы решить, является ли это корректным ABI offset/size-like значением или ошибочно неребейзнутым адресом.

## СЛЕДУЮЩЕМУ
Разобрать producer semantics `blob_head` / `args.topOfKernelData` и boot_args ABI этого поколения SPTM/XNU. Не исправлять consumer по одному совпадению числа; сначала доказать контракт поля. Все proof gates и 5-minute timeout сохранить.

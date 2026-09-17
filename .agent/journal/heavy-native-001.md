# heavy-native-001

## Evidence
The specification requires this order: compute subtotal, subtract a valid fixed coupon with a zero floor, apply tax to the discounted subtotal, then round the final total to two decimals. The implementation instead applied tax to the full subtotal and subtracted the coupon afterward.

## Root cause
`fixture/calculate.js` calculated `taxedSubtotal = subtotal * (1 + tax_rate)` before applying `couponAmount`. This makes the coupon reduce the post-tax total rather than the taxable subtotal.

## Change
Kept coupon lookup unchanged. Added `discountedSubtotal = Math.max(0, subtotal - couponAmount)` and calculate the final value as `roundMoney(discountedSubtotal * (1 + tax_rate))`. No specification, configuration, or test-case files were changed.

## Verification
- `coupon-standard`: subtotal = 2 × 50.00 = 100.00; discount = max(0, 100.00 − 10.00) = 90.00; tax = 90.00 × 1.20 = 108.00; final = 108.00, matching expected 108.00.
- `coupon-rounding`: subtotal = 3 × 19.99 = 59.97; discount = 59.97 − 10.00 = 49.97; tax = 49.97 × 1.05 = 52.4685; final rounding = 52.47, matching expected 52.47.
- `no-coupon`: subtotal = 1 × 120.00 + 2 × 15.00 = 150.00; discount = 150.00; tax = 150.00 × 1.20 = 180.00; final = 180.00, matching expected 180.00.

All supplied cases match the specified behavior after the minimal implementation change.

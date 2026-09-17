# heavy-test-002

## Evidence

- `fixture/spec.md` mandates: calculate item subtotal, subtract a valid fixed coupon with a zero floor, apply tax to that discounted subtotal, then round only the final total.
- `fixture/config.json` defines `SAVE10` as a fixed `10.00` coupon.
- The received `fixture/calculate.js` instead calculated the taxed subtotal first and then subtracted the coupon.

## Root cause

Tax and coupon operations were in the wrong order. Subtracting a fixed coupon after tax leaves the coupon amount taxable, contrary to the specification.

## Minimal change

Changed only `fixture/calculate.js`:

1. Resolve the coupon amount.
2. Compute `discountedSubtotal = Math.max(0, subtotal - couponAmount)`.
3. Apply the tax rate to `discountedSubtotal`.
4. Use the existing final-rounding helper.

The specification, configuration, and supplied cases were not changed.

## Verification

### coupon-standard

- Subtotal: `2 × 50.00 = 100.00`
- Discounted subtotal: `max(0, 100.00 - 10.00) = 90.00`
- With tax: `90.00 × 1.20 = 108.00`
- Rounded total: `108.00` = expected `108.00`.

### coupon-rounding

- Subtotal: `3 × 19.99 = 59.97`
- Discounted subtotal: `max(0, 59.97 - 10.00) = 49.97`
- With tax: `49.97 × 1.05 = 52.4685`
- Half-up final rounding: `52.47` = expected `52.47`.

### no-coupon

- Subtotal: `1 × 120.00 + 2 × 15.00 = 150.00`
- Discounted subtotal: `150.00 - 0.00 = 150.00`
- With tax: `150.00 × 1.20 = 180.00`
- Rounded total: `180.00` = expected `180.00`.

All supplied cases match.

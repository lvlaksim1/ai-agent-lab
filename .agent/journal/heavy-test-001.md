# heavy-test-001

## Evidence

- `fixture/spec.md` requires this order: item subtotal, fixed coupon subtraction clamped at zero, tax on the discounted subtotal, then one final two-decimal half-up rounding.
- `fixture/config.json` defines `SAVE10` as a fixed `10.00` discount.
- The original `fixture/calculate.js` calculated `subtotal * (1 + tax_rate)` first and subtracted the coupon afterward.

## Root cause

The coupon and tax operations were reversed. Because a fixed coupon was deducted after tax, the coupon itself was effectively not reducing the taxable amount.

## Change

Changed only `fixture/calculate.js`:

1. Resolve the configured coupon amount.
2. Calculate `discountedSubtotal = Math.max(0, subtotal - couponAmount)`.
3. Apply tax to the discounted subtotal.
4. Round only the final result with the existing `roundMoney` helper.

No specification, configuration, or supplied case was changed.

## Verification

### coupon-standard

- Subtotal: `2 × 50.00 = 100.00`
- Coupon: `max(0, 100.00 - 10.00) = 90.00`
- Taxed total: `90.00 × 1.20 = 108.00`
- Final rounded total: `108.00` — matches expected `108.00`.

### coupon-rounding

- Subtotal: `3 × 19.99 = 59.97`
- Coupon: `max(0, 59.97 - 10.00) = 49.97`
- Taxed total: `49.97 × 1.05 = 52.4685`
- Final half-up rounding to two decimals: `52.47` — matches expected `52.47`.

### no-coupon

- Subtotal: `1 × 120.00 + 2 × 15.00 = 120.00 + 30.00 = 150.00`
- Coupon: `0.00`; discounted subtotal remains `150.00`
- Taxed total: `150.00 × 1.20 = 180.00`
- Final rounded total: `180.00` — matches expected `180.00`.

All three supplied cases match.

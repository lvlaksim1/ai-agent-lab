# heavy-test-003

## Evidence

- `fixture/spec.md` requires the subtotal to be discounted first, clamped at zero, then taxed, with rounding only once at the end.
- `fixture/config.json` defines `SAVE10` as a fixed `10.00` discount.
- The received implementation calculated `subtotal * (1 + tax_rate)` before subtracting the coupon.

## Root cause

The fixed coupon was applied after tax instead of before tax. This incorrectly leaves the coupon amount inside the taxable base.

## Minimal change

Only `fixture/calculate.js` was changed:

1. Resolve the configured coupon amount.
2. Subtract it from the subtotal and clamp at zero.
3. Apply tax to the discounted subtotal.
4. Preserve the existing final monetary rounding.

No specification, configuration, or supplied case was changed.

## Verification

### coupon-standard

- Subtotal: `2 × 50.00 = 100.00`
- Discounted subtotal: `max(0, 100.00 - 10.00) = 90.00`
- Taxed result: `90.00 × 1.20 = 108.00`
- Final total: `108.00`; expected `108.00`.

### coupon-rounding

- Subtotal: `3 × 19.99 = 59.97`
- Discounted subtotal: `max(0, 59.97 - 10.00) = 49.97`
- Taxed result: `49.97 × 1.05 = 52.4685`
- Final half-up rounding: `52.47`; expected `52.47`.

### no-coupon

- Subtotal: `1 × 120.00 + 2 × 15.00 = 150.00`
- Discounted subtotal: `150.00 - 0.00 = 150.00`
- Taxed result: `150.00 × 1.20 = 180.00`
- Final total: `180.00`; expected `180.00`.

All three supplied cases pass by explicit calculation.

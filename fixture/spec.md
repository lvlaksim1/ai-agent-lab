# Order total specification

The order total is calculated in this exact order:

1. `subtotal` = sum of `quantity * unit_price` for all items.
2. If the coupon exists in `fixture/config.json`, subtract its fixed `amount` from the subtotal. The discounted subtotal must not go below zero.
3. Apply `tax_rate` to the discounted subtotal.
4. Round only the final total to two decimal places using ordinary half-up monetary rounding.

Do not change the specification, configuration, or test cases to make the implementation pass.

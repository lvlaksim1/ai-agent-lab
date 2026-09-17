const config = require('./config.json');

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function calculateOrderTotal(order) {
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );

  const couponAmount = order.coupon && config.coupons[order.coupon]
    ? config.coupons[order.coupon].amount
    : 0;
  const discountedSubtotal = Math.max(0, subtotal - couponAmount);
  const taxedSubtotal = discountedSubtotal * (1 + order.tax_rate);

  return roundMoney(taxedSubtotal);
}

module.exports = { calculateOrderTotal };

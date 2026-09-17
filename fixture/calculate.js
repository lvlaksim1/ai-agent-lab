const config = require('./config.json');

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function calculateOrderTotal(order) {
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );

  const taxedSubtotal = subtotal * (1 + order.tax_rate);
  const couponAmount = order.coupon && config.coupons[order.coupon]
    ? config.coupons[order.coupon].amount
    : 0;
  const total = Math.max(0, taxedSubtotal - couponAmount);

  return roundMoney(total);
}

module.exports = { calculateOrderTotal };

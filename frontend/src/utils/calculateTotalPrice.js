// returns price in paise
export default function calculateTotalPrice(
  price,
  currency,
  applyTax,
  tax,
  discountCoupon,
  multiplier = 100,
) {
  let p = price;

  if (discountCoupon) {
    p = p * (1 - discountCoupon.discount_percentage / 100);
  }

  return Math.ceil(p * multiplier);
}

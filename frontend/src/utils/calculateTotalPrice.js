// returns price in paise
export default function calculateTotalPrice(
	price,
	currency,
	applyTax,
	tax,
	discountCoupon,
	multiplier = 100
) {
	let at = currency === "INR" && applyTax;

	let p = price;

	if (discountCoupon) {
		p = p * (1 - discountCoupon.discount_percentage / 100);
	}

	if (at) {
		p = p * (1 + tax / 100);
	}

	return Math.ceil(p * multiplier);
}

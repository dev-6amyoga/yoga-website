const mongoose = require("mongoose");

const discountCouponApplicableCustomPlan = new mongoose.Schema({
	discount_coupon_id: {
		type: mongoose.Schema.Types.Number,
		required: true,
	},
	custom_plan_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	},
	created: {
		type: mongoose.Schema.Types.Date,
		default: Date.now,
	},
	updated: {
		type: mongoose.Schema.Types.Date,
		default: Date.now,
	},
});

const DiscountCouponApplicableCustomPlan = mongoose.model(
	"DiscountCouponApplicableCustomPlan",
	discountCouponApplicableCustomPlan,
	"discount_coupon_applicable_custom_plan"
);

module.exports = DiscountCouponApplicableCustomPlan;

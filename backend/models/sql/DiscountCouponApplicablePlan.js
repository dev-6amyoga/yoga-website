const { sequelize } = require("../../init.sequelize");
const { options } = require("./defaultOptions");
const { Plan } = require("./Plan");
const { DiscountCoupon } = require("./DiscountCoupon");
const { DataTypes } = require("sequelize");

const DiscountCouponApplicablePlan = sequelize.define(
	"discount_coupon_applicable_plan",
	{
		discount_coupon_applicable_plan_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
	},
	{ ...options }
);

module.exports = { DiscountCouponApplicablePlan };

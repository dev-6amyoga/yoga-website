const { sequelize } = require("../../init.sequelize");
const { DataTypes } = require("sequelize");
const { options } = require("./defaultOptions");
const { User } = require("./User");

const DiscountCoupon = sequelize.define(
	"discount_coupon",
	{
		discount_coupon_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		coupon_name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		coupon_description: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		discount_percentage: {
			type: DataTypes.FLOAT,
			allowNull: false,
		},
		validity_from: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		validity_to: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	},
	{ ...options }
);

module.exports = { DiscountCoupon };

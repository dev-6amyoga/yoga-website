const { sequelize } = require("../../init.sequelize");
const { DataTypes } = require("sequelize");
const { options } = require("./defaultOptions");

const Refund = sequelize.define(
	"refund",
	{
		refund_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		refund_reason: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		payment_method: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		amount: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		refund_status: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		payment_date: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		refund_payment_id: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		refund_error_code: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		refund_error_desc: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		refund_error_reason: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{ ...options }
);

module.exports = { Refund };

const { sequelize } = require("../../init.sequelize");
const { DataTypes } = require("sequelize");
const { options } = require("./defaultOptions");
const { User } = require("./User");
const { Plan } = require("./Plan");
const { Institute } = require("./Institute");

const UserPlan = sequelize.define(
	"user_plan",
	{
		user_plan_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		purchase_date: {
			type: DataTypes.DATE,
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
		transaction_order_id: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		current_status: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		auto_renewal_enabled: {
			type: DataTypes.BOOLEAN,
			allowNull: true,
			defaultValue: false,
		},
		user_type: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{ ...options }
);

module.exports = { UserPlan };

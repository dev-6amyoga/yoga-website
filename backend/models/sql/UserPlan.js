const { sequelize } = require("../../init.sequelize");
const { DataTypes } = require("sequelize");
const { options } = require("./defaultOptions");
const { User } = require("./User");
const { Plan } = require("./Plan");
const { Institute } = require("./Institute");
const {
	USER_PLAN_ACTIVE,
	USER_PLAN_CANCELLED,
	USER_PLAN_EXPIRED_BY_DATE,
	USER_PLAN_EXPIRED_BY_USAGE,
	USER_PLAN_STAGED,
} = require("../../enums/user_plan_status");

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
			type: DataTypes.ENUM,
			values: [
				USER_PLAN_ACTIVE,
				USER_PLAN_CANCELLED,
				USER_PLAN_EXPIRED_BY_DATE,
				USER_PLAN_EXPIRED_BY_USAGE,
				USER_PLAN_STAGED,
			],
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

UserPlan.belongsTo(Institute, {
	foreignKey: "institute_id",
	onDelete: "CASCADE",
});

module.exports = { UserPlan };

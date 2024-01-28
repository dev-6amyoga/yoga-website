const { sequelize } = require("../../init.sequelize");
const { DataTypes } = require("sequelize");
const { options } = require("./defaultOptions");
const { User } = require("./User");
const { Transaction } = require("./Transaction");

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
		refund_order_id: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		refund_payment_id: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		refund_signature: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{ ...options }
);

Refund.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
Refund.belongsTo(Transaction, {
	foreignKey: "transaction_id",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});

module.exports = { Refund };

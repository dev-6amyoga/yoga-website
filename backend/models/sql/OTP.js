const { sequelize } = require("../../init.sequelize");
const { DataTypes, Sequelize } = require("sequelize");
const { options } = require("./defaultOptions");
const { User } = require("./User");

const OTP = sequelize.define(
	"otp",
	{
		otp_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		value: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		// this signifies what entity the otp is for; email or phone
		otp_for_type: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		otp_for: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		// this signifies what entity the otp is targeted to/sent to; email or phone
		otp_target_type: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		otp_target: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		is_verified: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		otp_created_at: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		otp_expiry_at: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	},
	{ ...options }
);

module.exports = { OTP };

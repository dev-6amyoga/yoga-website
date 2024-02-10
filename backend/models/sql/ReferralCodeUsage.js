const { sequelize } = require("../../init.sequelize");
const { DataTypes } = require("sequelize");
const { options } = require("./defaultOptions");
const { User } = require("./User");

const ReferralCodeUsage = sequelize.define(
	"referral_code_usage",
	{
		referral_code_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
	},
	{ ...options }
);

module.exports = { ReferralCodeUsage };

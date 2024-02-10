const { sequelize } = require("../../init.sequelize");
const { DataTypes, Sequelize } = require("sequelize");
const { options } = require("./defaultOptions");
const { User } = require("./User");

const LoginHistory = sequelize.define(
	"login_history",
	{
		login_history_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		ip: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		user_agent: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		platform: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		os: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		browser: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{ ...options }
);

module.exports = { LoginHistory };

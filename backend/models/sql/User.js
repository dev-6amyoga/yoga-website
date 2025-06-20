const { sequelize } = require("../../init.sequelize");
const { DataTypes } = require("sequelize");
const { options } = require("./defaultOptions");
const { Institute } = require("./Institute");
const { Role } = require("./Role");

const User = sequelize.define(
	"user",
	{
		user_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			autoIncrementIdentity: true,
		},
		username: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		phone: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		is_google_login: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
		last_login: {
			type: DataTypes.DATE,
			allowNull: true,
		},
	},
	{ ...options }
);

module.exports = { User };

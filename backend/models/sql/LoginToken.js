const { sequelize } = require("../../init.sequelize");
const { DataTypes, Sequelize } = require("sequelize");
const { options } = require("./defaultOptions");
const { User } = require("./User");

const LoginToken = sequelize.define(
	"login_token",
	{
		login_token_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		access_token: {
			type: DataTypes.BLOB,
			allowNull: false,
			unique: true,
		},
		refresh_token: {
			type: DataTypes.BLOB,
			allowNull: false,
			unique: true,
		},
		access_token_creation_at: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		access_token_expiry_at: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		refresh_token_creation_at: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		refresh_token_expiry_at: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	},
	{ ...options }
);

LoginToken.belongsTo(User, {
	foreignKey: "user_id",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});

module.exports = { LoginToken };

const { sequelize } = require("../../init.sequelize");
const { DataTypes } = require("sequelize");
const { options } = require("./defaultOptions");
// const { Role } = require('./Role');
// const { User } = require('./User');

const Plan = sequelize.define(
	"plan",
	{
		plan_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		has_basic_playlist: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true,
		},
		has_playlist_creation: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		playlist_creation_limit: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 1000,
		},
		has_self_audio_upload: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		number_of_teachers: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		plan_validity_days: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		watch_time_limit: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		plan_user_type: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{ ...options }
);

// Plan.belongsToMany(User, {
//   through: "user_plan",
// });

module.exports = { Plan };

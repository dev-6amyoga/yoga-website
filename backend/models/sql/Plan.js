const { sequelize } = require("../../init.sequelize");
const { DataTypes } = require("sequelize");
const { options } = require("./defaultOptions");
const { Role } = require("./Role");
const { User } = require("./User");
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
    has_basic_playlist: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    has_playlist_creation: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    playlist_creation_limit: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    has_self_audio_upload: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    number_of_teachers: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    plan_validity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    plan_user_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { ...options }
);

Plan.belongsToMany(User, {
  through: "user_plan",
});

module.exports = { Plan };

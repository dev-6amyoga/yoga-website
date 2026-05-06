const { sequelize } = require("../../init.sequelize");
const { DataTypes } = require("sequelize");
const { options } = require("./defaultOptions");

const Queries = sequelize.define(
  "queries",
  {
    query_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    query_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    query_email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    query_phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    query_text: { type: DataTypes.STRING, allowNull: false },
    query_source: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "website",
    },
    entered_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    entered_by_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    follow_up_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    follow_up_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    followed_up_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  { ...options }
);

module.exports = { Queries };

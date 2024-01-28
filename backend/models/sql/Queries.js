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
  },
  { ...options }
);

module.exports = { Queries };

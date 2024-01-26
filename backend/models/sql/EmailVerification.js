const { sequelize } = require("../../init.sequelize");
const { DataTypes } = require("sequelize");
const { options } = require("./defaultOptions");

const EmailVerification = sequelize.define(
  "email_verification",
  {
    email_verification_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  { ...options }
);

module.exports = { EmailVerification };

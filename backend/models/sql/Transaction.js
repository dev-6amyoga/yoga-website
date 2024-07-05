const { sequelize } = require("../../init.sequelize");
const { DataTypes } = require("sequelize");
const { options } = require("./defaultOptions");
const { User } = require("./User");
const { DiscountCoupon } = require("./DiscountCoupon");
const { ReferralCode } = require("./ReferralCode");
const { Currency } = require("./Currency");
const { UserPlan } = require("./UserPlan");
const { Refund } = require("./Refund");

const Transaction = sequelize.define(
  "transaction",
  {
    transaction_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    payment_for: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    transaction_order_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    transaction_payment_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transaction_signature: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  { ...options }
);

module.exports = { Transaction };

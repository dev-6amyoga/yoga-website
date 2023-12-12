const { sequelize } = require("../../init.sequelize");
const { DataTypes } = require("sequelize");
const { options } = require("./defaultOptions");
const { User } = require("./User");
const { Plan } = require("./Plan");

const UserPlan = sequelize.define(
  "user_plan",
  {
    user_plan_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    plan_purchase_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    plan_validity_period: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    plan_expiry_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    cancellation_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    auto_renewal: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    usage_history: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    discount_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    discount_amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    referral_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  { ...options }
);

UserPlan.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
UserPlan.belongsTo(Plan, { foreignKey: "plan_id" });

module.exports = { UserPlan };

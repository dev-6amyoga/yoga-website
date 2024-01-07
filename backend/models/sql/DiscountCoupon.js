const { sequelize } = require("../../init.sequelize");
const { DataTypes } = require("sequelize");
const { options } = require("./defaultOptions");
const { User } = require("./User");

const DiscountCoupon = sequelize.define(
  "discount_coupon",
  {
    discount_coupon_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    coupon_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    coupon_description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    creation_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    validity_from: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    validity_to: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  { ...options }
);

DiscountCoupon.belongsTo(User, {
  foreignKey: "linked_user_id",
  onDelete: "CASCADE",
});

module.exports = { DiscountCoupon };

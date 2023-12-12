const { sequelize } = require('../../init.sequelize');
const { options } = require('./defaultOptions');
const { Plan } = require('./Plan');
const { DiscountCoupon } = require('./DiscountCoupon');
const { DataTypes } = require('sequelize');

const DiscountCouponApplicablePlan = sequelize.define(
    'discount_coupon_applicable_plan',
    {
        discount_coupon_applicable_plan_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
    },
    { ...options }
);

DiscountCouponApplicablePlan.belongsTo(DiscountCoupon, {
    foreignKey: 'discount_coupon_id',
    onDelete: 'CASCADE',
});

DiscountCouponApplicablePlan.belongsTo(Plan, {
    foreignKey: 'plan_id',
    onDelete: 'CASCADE',
});

module.exports = { DiscountCouponApplicablePlan };

const { sequelize } = require('../../init.sequelize');
const { DataTypes } = require('sequelize');
const { options } = require('./defaultOptions');
const { Plan } = require('./Plan');
const { Currency } = require('./Currency');

const PlanPricing = sequelize.define(
    'plan_pricing',
    {
        plan_pricing_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        denomination: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    { ...options }
);

PlanPricing.belongsTo(Plan, { foreignKey: 'plan_id', onDelete: 'CASCADE' });
PlanPricing.belongsTo(Currency, {
    foreignKey: 'currency_id',
    onDelete: 'CASCADE',
});

module.exports = { PlanPricing };

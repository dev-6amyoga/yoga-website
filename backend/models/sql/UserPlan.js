const { sequelize } = require('../../init.sequelize');
const { DataTypes } = require('sequelize');
const { options } = require('./defaultOptions');
const { User } = require('./User');
const { Plan } = require('./Plan');

const UserPlan = sequelize.define(
    'user_plan',
    {
        user_plan_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        purchase_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        validity_from: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        validity_to: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        cancellation_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        auto_renewal_enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
    },
    { ...options }
);

UserPlan.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
UserPlan.belongsTo(Plan, { foreignKey: 'plan_id' });

module.exports = { UserPlan };

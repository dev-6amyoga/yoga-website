const { sequelize } = require('../../init.sequelize');
const { DataTypes } = require('sequelize');
const { options } = require('./defaultOptions');
const { User } = require('./User');

const Transaction = sequelize.define(
    'transaction',
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
            allowNull: false,
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
        transaction_response_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        transaction_response_message: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    { ...options }
);

Transaction.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

module.exports = { Transaction };

const { sequelize } = require('../../init.sequelize');
const { DataTypes } = require('sequelize');
const { options } = require('./defaultOptions');

const Currency = sequelize.define(
    'currency',
    {
        currency_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        short_tag: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    { ...options }
);

module.exports = { Currency };

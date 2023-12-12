const { sequelize } = require('../../init.sequelize');
const { DataTypes } = require('sequelize');
const { options } = require('./defaultOptions');
const { User } = require('./User');

const ReferralCode = sequelize.define(
    'referral_code',
    {
        referral_code_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    { ...options }
);

ReferralCode.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

module.exports = { ReferralCode };

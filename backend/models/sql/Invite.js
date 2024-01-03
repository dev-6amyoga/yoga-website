const { sequelize } = require('../../init.sequelize');
const { DataTypes } = require('sequelize');
const { options } = require('./defaultOptions');
const { User } = require('./User');

const Invite = sequelize.define(
    'invite',
    {
        invite_id: {
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
            unique: true,
        },
        invite_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        is_accepted: {
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

Invite.belongsTo(
    User,
    { foreignKey: 'inviter_user_id' },
    { onDelete: 'cascade' }
);

module.exports = { Invite };

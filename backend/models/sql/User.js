const { sequelize } = require('../../init.sequelize');
const { DataTypes } = require('sequelize');
const { options } = require('./defaultOptions');
const { Institute } = require('./Institute');
const { Role } = require('./Role');

const User = sequelize.define(
    'user',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        is_google_login: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        last_login: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    { ...options }
);

User.belongsTo(Institute, { foreignKey: 'institute_id', onDelete: 'CASCADE' });
User.belongsTo(Role, { foreignKey: 'role_id' });

module.exports = { User };

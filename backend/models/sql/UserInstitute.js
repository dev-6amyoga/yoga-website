const { sequelize } = require('../../init.sequelize');
const { DataTypes } = require('sequelize');
const { options } = require('./defaultOptions');
const { User } = require('./User');
const { Institute } = require('./Institute');

const UserInstitute = sequelize.define(
    'user_institute',
    {
        user_institute_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
    },
    { ...options }
);

UserInstitute.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

UserInstitute.belongsTo(Institute, {
    foreignKey: 'institute_id',
    onDelete: 'CASCADE',
});

module.exports = { UserInstitute };

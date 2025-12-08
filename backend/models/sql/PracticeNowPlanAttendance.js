const { sequelize } = require('../../init.sequelize')
const { DataTypes } = require('sequelize')
const { options } = require('./defaultOptions')

const PracticeNowPlanAttendance = sequelize.define(
  'practice_now_plan_attendance',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    plan_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    user_plan_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    classes_allowed: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    classes_attended: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'EXPIRED', 'STAGED'),
      defaultValue: 'ACTIVE',
    },
  },
  { ...options }
)

module.exports = { PracticeNowPlanAttendance }

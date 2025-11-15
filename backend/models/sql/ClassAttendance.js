const { sequelize } = require('../../init.sequelize')
const { DataTypes } = require('sequelize')
const { options } = require('./defaultOptions')

const ClassAttendance = sequelize.define(
  'class_attendance',
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
    class_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    device_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    attendance_status: {
      type: DataTypes.ENUM('ATTENDED', 'MISSED', 'CANCELLED', 'JOINED_LATE'),
      defaultValue: 'ATTENDED',
    },
    join_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    leave_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    marked_by: {
      type: DataTypes.ENUM('SYSTEM', 'INSTRUCTOR', 'USER'),
      defaultValue: 'SYSTEM',
    },
    instructor_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  { ...options }
)

module.exports = { ClassAttendance }

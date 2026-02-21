const { sequelize } = require('../../init.sequelize')
const { DataTypes } = require('sequelize')
const { options } = require('./defaultOptions')

const ZoomClassModel = sequelize.define(
  'zoom_class',
  {
    zoom_class_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    zoom_class_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    institute_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    teacher_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    class_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // For one-time classes
    start_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // For recurring classes
    recurring_days: {
      type: DataTypes.ARRAY(DataTypes.INTEGER), // Array of day numbers (0-6)
      allowNull: true,
    },
    recurring_start_time: {
      type: DataTypes.STRING, // 'HH:mm' format
      allowNull: true,
    },
    recurring_end_time: {
      type: DataTypes.STRING, // 'HH:mm' format
      allowNull: true,
    },
    zoom_meeting_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zoom_meeting_password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    join_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    join_token_expiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  { ...options }
)

module.exports = { ZoomClassModel }

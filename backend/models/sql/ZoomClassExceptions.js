const { sequelize } = require('../../init.sequelize')
const { DataTypes } = require('sequelize')
const { options } = require('./defaultOptions')

const ZoomClassExceptionModel = sequelize.define(
  'zoom_class_exception',
  {
    exception_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    zoom_class_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    override_start_time: {
      type: DataTypes.STRING, // 'HH:mm' format
      allowNull: true,
    },
    override_end_time: {
      type: DataTypes.STRING, // 'HH:mm' format
      allowNull: true,
    },
    override_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  { ...options }
)

module.exports = { ZoomClassExceptionModel }

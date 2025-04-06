const { DataTypes } = require('sequelize')
const { sequelize } = require('../../init.sequelize')
const { options } = require('./defaultOptions')
const { JOB_STATUS_PENDING } = require('../../enums/job_status')

const SchedulerJobRun = sequelize.define(
  'scheduler_job_run',
  {
    scheduler_job_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    job_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    job_status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: JOB_STATUS_PENDING,
    },
    job_error: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    job_run_start_time: {
      type: DataTypes.DATE,
      defaultValue: Date.now,
    },
    job_run_end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  { ...options }
)

module.exports = { SchedulerJobRun }

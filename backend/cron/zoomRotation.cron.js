const cron = require('node-cron')
const { Op } = require('sequelize')
const moment = require('moment-timezone')
const { ZoomClassModel } = require('../models/sql/ZoomClassModel')
const { rotatePMIPassword } = require('../services/Zoom.service')

const startZoomCron = () => {
  cron.schedule(
    '0 0 * * *',
    async () => {
      try {
        const now = moment().tz('Asia/Kolkata').toDate()

        const expiredClasses = await ZoomClassModel.findAll({
          where: {
            join_token_expiry: {
              [Op.lt]: now,
            },
          },
        })

        for (const classData of expiredClasses) {
          const newPassword = await rotatePMIPassword()

          await classData.update({
            zoom_meeting_password: newPassword,
            join_token: null,
            join_token_expiry: null,
          })

          console.log(`Rotated password for class ${classData.zoom_class_id}`)
        }
      } catch (err) {
        console.error('Zoom cron error:', err.message)
      }
    },
    {
      timezone: 'Asia/Kolkata',
    }
  )
}

module.exports = { startZoomCron }

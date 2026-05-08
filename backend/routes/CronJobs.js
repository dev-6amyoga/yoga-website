const express = require('express')
const router = express.Router()
const {
  UpdatePlanStatuses,
  SendPlanExpiryReminders,
} = require('../services/CronJobs')
const {
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_UNAUTHORIZED,
} = require('../utils/http_status_codes')
const { mailTransporter } = require('../init.nodemailer')

const verifyCronSecret = (req, res, next) => {
  const cronSecret = req.headers['x-cron-secret'] || req.query.secret

  if (!cronSecret || cronSecret !== process.env.CRON_SECRET_KEY) {
    return res.status(HTTP_UNAUTHORIZED).json({
      success: false,
      message: 'Unauthorized: Invalid or missing CRON_SECRET_KEY',
    })
  }

  next()
}

/**
 * POST /cron/update-plan-statuses
 * Manually trigger the UpdatePlanStatuses cron job
 * Requires: x-cron-secret header or secret query param
 */
router.get('/update-plan-statuses', async (req, res) => {
  try {
    console.log('[CronJobs Endpoint] Triggering UpdatePlanStatuses manually')

    await UpdatePlanStatuses()

    res.status(HTTP_OK).json({
      success: true,
      message: 'UpdatePlanStatuses cron job executed successfully',
      timestamp: new Date(),
    })
  } catch (error) {
    console.error(
      '[CronJobs Endpoint] Error executing UpdatePlanStatuses:',
      error
    )

    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error executing UpdatePlanStatuses cron job',
      error: error.message,
    })
  }
})

/**
 * POST /cron/send-plan-expiry-reminders
 * Manually trigger the SendPlanExpiryReminders cron job
 * Requires: x-cron-secret header or secret query param
 */
router.get('/send-plan-expiry-reminders', async (req, res) => {
  try {
    console.log(
      '[CronJobs Endpoint] Triggering SendPlanExpiryReminders manually'
    )

    await SendPlanExpiryReminders()

    res.status(HTTP_OK).json({
      success: true,
      message: 'SendPlanExpiryReminders cron job executed successfully',
      timestamp: new Date(),
    })
  } catch (error) {
    console.error(
      '[CronJobs Endpoint] Error executing SendPlanExpiryReminders:',
      error
    )

    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error executing SendPlanExpiryReminders cron job',
      error: error.message,
    })
  }
})

/**
 * POST /cron/run-all
 * Manually trigger all cron jobs
 * Requires: x-cron-secret header or secret query param
 */
router.get('/run-all', async (req, res) => {
  try {
    console.log('[CronJobs Endpoint] Triggering all cron jobs manually')

    await UpdatePlanStatuses()
    await SendPlanExpiryReminders()

    res.status(HTTP_OK).json({
      success: true,
      message: 'All cron jobs executed successfully',
      jobs: ['UpdatePlanStatuses', 'SendPlanExpiryReminders'],
      timestamp: new Date(),
    })
  } catch (error) {
    console.error('[CronJobs Endpoint] Error executing cron jobs:', error)

    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error executing cron jobs',
      error: error.message,
    })
  }
})

router.get('/test', async (req, res) => {
  await mailTransporter.sendMail({
    from: 'dev.6amyoga@gmail.com',
    to: ['smriti030202@gmail.com', 'sivakumarp2910@gmail.com'],
    cc: 'sivakumarp2910@gmail.com',
    subject: 'CC Test',
    text: 'Testing CC',
  })
  res.status(HTTP_OK).json({
    success: true,
    message: 'CronJobs endpoint is working',
    timestamp: new Date(),
  })
})

module.exports = router

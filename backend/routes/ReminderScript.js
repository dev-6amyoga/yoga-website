const axios = require('axios')
const cron = require('node-cron')
const { mailTransporter } = require('../init.nodemailer')

const sendReminders = async () => {
  try {
    console.log('Fetching user plans...')
    const response = await axios.get(
      'http://localhost:4000/user-plan/get-all-user-plans'
    )
    const userPlans = response.data.userplans

    const currentDate = new Date().toISOString().split('T')[0]

    const usersToNotify = userPlans.filter(
      (plan) => plan.validity_to.split('T')[0] === currentDate
    )
    if (usersToNotify.length === 0) {
      return
    }

    console.log(`Sending reminders to ${usersToNotify.length} users...`)
    for (const user of usersToNotify) {
      const response = await axios.post(
        'http://localhost:4000/user/get-by-id',
        {
          user_id: user.user_id,
        }
      )
      const user1 = response.data.user
      mailTransporter.sendMail(
        {
          from: 'dev.6amyoga@gmail.com',
          to: user1.email,
          subject: '6AM Yoga | Plan Expired!',
          html: `
            <p>Dear ${user1.name},</p>

            <p>This is a gentle reminder that your subscription plan with 6AM Yoga has <strong>expired</strong> as of <strong>${currentDate}</strong>.</p>

            <p>To continue enjoying uninterrupted access to personalized yoga sessions, we invite you to renew your plan today.</p>

            <p><strong>Renew your plan now and stay on the path to wellness:</strong></p>
            <p><a href="https://ai.6amyoga.com/" style="background-color: #007BFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Renew Now</a></p>

            <p>Feel free to contact us if you have any questions or need assistance with the renewal process.</p>

            <p>We look forward to continuing this journey of health and mindfulness with you.</p>

            <p>Warm regards,</p>
            <p><strong>The 6AM Yoga Team</strong></p>
            <p>Email: dev.6amyoga@gmail.com</p>
            <p>Website: <a href="https://ai.6amyoga.com" target="_blank">ai.6amyoga.com</a></p>
            `,
        },
        async (err, info) => {
          if (err) {
            console.error(err)
            res.status(HTTP_INTERNAL_SERVER_ERROR).json({
              message: 'Internal server error; try again',
            })
          } else {
            console.log(`Reminder sent to user_id: ${user.name}`)
          }
        }
      )
    }
    console.log('All reminders sent successfully!')
  } catch (error) {
    console.error('Error while sending reminders:', error.message)
  }
}

cron.schedule('0 0 * * *', () => {
  console.log('Running reminder script: ', new Date().toLocaleTimeString())
  sendReminders()
})

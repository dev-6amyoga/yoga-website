const { Op } = require('sequelize')

const { sequelize } = require('../init.sequelize')
const { mailTransporter } = require('../init.nodemailer')

const { User } = require('../models/sql/User')
const { UserPlan } = require('../models/sql/UserPlan')

const sendUnpaidClassEmail = async (
  user,
  unpaidClasses,
  frontendDomain,
  lastPlanId = null
) => {
  try {
    if (!user || !user.email || !unpaidClasses || unpaidClasses.length === 0) {
      return false
    }

    const purchaseLink = lastPlanId
      ? `${frontendDomain}/student/purchase-a-plan/${lastPlanId}`
      : `${frontendDomain}/student/purchase-a-plan`

    const classCount = unpaidClasses.length
    const classesHTML = unpaidClasses
      .map(
        (cls) => `
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 12px; text-align: left;">${cls.date || 'N/A'}</td>
            <td style="padding: 12px; text-align: left;">${cls.class_name || 'Yoga Class'}</td>
            <td style="padding: 12px; text-align: left;">${cls.start_time || 'N/A'}</td>
          </tr>
        `
      )
      .join('')

    await mailTransporter.sendMail({
      from: 'dev.6amyoga@gmail.com',
      to: user.email,
      subject: `6AM Yoga | ${classCount} Unpaid Class${classCount > 1 ? 'es' : ''} Attendance`,
      html: `
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>Our records show that you attended <strong>${classCount}</strong> class${classCount > 1 ? 'es' : ''} without an active plan:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 12px; text-align: left; font-weight: bold;">Date</th>
              <th style="padding: 12px; text-align: left; font-weight: bold;">Class</th>
              <th style="padding: 12px; text-align: left; font-weight: bold;">Time</th>
            </tr>
          </thead>
          <tbody>
            ${classesHTML}
          </tbody>
        </table>
        
        <p>To continue accessing our classes in the future, please purchase a plan today.</p>
        <p>
          <a href="${purchaseLink}"
            style="background:#4CAF50;color:#fff;padding:12px 24px;
                    border-radius:4px;text-decoration:none;display:inline-block;">
            Purchase Plan Now
          </a>
        </p>
        <p>If you have any questions, feel free to reach out to us.</p>
        <p>– 6AM Yoga Team</p>
      `,
    })

    return true
  } catch (err) {
    console.error('Unpaid email failed:', err)
    return false
  }
}

const CLASS_ATTENDANCE_INIT = `INSERT INTO user_plan_attendance (
  user_id,
  plan_id,
  user_plan_id,
  start_date,
  expiry_date,
  classes_allowed,
  classes_attended,
  status,
  created,
  updated
)
SELECT
  up.user_id,
  up.plan_id,
  up.user_plan_id,
  up.validity_from,
  up.validity_to,
  p.number_of_zoom_classes,
  0,
  CASE
    WHEN up.current_status = 'ACTIVE' THEN 'ACTIVE'
    WHEN up.current_status = 'STAGED' THEN 'STAGED'
    ELSE 'EXPIRED'
  END::enum_user_plan_attendance_status,
  NOW(),
  NOW()
FROM user_plan up
JOIN plan p
  ON p.plan_id = up.plan_id
LEFT JOIN user_plan_attendance upa
  ON upa.user_plan_id = up.user_plan_id
WHERE upa.user_plan_id IS NULL
  AND up.deleted_at IS NULL
  AND up.plan_id > 16;
`

const SQL_EXPIRE_BY_DATE = `
UPDATE user_plan
SET current_status = 'EXPIRED_BY_DATE',
    updated = NOW()
WHERE deleted_at IS NULL
  AND current_status IN ('ACTIVE','STAGED')
  AND validity_to < CURRENT_DATE;
`

const SQL_ACTIVATE_STAGED = `
UPDATE user_plan up
SET current_status = 'ACTIVE',
    updated = NOW()
WHERE up.current_status = 'STAGED'
  AND up.validity_from <= CURRENT_DATE
  AND NOT EXISTS (
    SELECT 1 FROM user_plan up2
    WHERE up2.user_id = up.user_id
      AND up2.current_status = 'ACTIVE'
      AND up2.deleted_at IS NULL
  );
`

const SQL_SYNC_ATTENDANCE_STATUS = `
UPDATE user_plan_attendance upa
SET status = CASE
  WHEN up.current_status = 'ACTIVE'
    THEN 'ACTIVE'::enum_user_plan_attendance_status
  WHEN up.current_status = 'STAGED'
    THEN 'STAGED'::enum_user_plan_attendance_status
  ELSE 'EXPIRED'::enum_user_plan_attendance_status
END,
updated = NOW()
FROM user_plan up
WHERE up.user_plan_id = upa.user_plan_id
  AND upa.deleted_at IS NULL;

`

const SQL_ADJUST_UNPAID_CLASSES = `
WITH last_expired_plan AS (
  SELECT
    user_id,
    MAX(validity_to) AS last_expired_date
  FROM user_plan
  WHERE current_status IN ('EXPIRED_BY_DATE','EXPIRED_BY_USAGE')
    AND deleted_at IS NULL
  GROUP BY user_id
)

UPDATE class_attendance ca
SET
  user_plan_id = up.user_plan_id,
  adjusted_to_plan_id = up.user_plan_id,
  updated = NOW()
FROM user_plan up,
    last_expired_plan lep
WHERE up.current_status = 'ACTIVE'
  AND up.deleted_at IS NULL

  -- link update target
  AND ca.user_id = up.user_id
  AND lep.user_id = ca.user_id

  AND ca.attendance_status = 'ATTENDED'
  AND ca.deleted_at IS NULL
  AND ca.adjusted_to_plan_id IS NULL

  -- within active plan validity (inclusive)
  AND CAST(ca.date AS DATE)
      BETWEEN up.validity_from AND up.validity_to

  -- not covered by another active plan
  AND NOT EXISTS (
    SELECT 1
    FROM user_plan up2
    WHERE up2.user_id = ca.user_id
      AND up2.current_status = 'ACTIVE'
      AND CAST(ca.date AS DATE)
          BETWEEN up2.validity_from AND up2.validity_to
      AND up2.user_plan_id <> up.user_plan_id
  )

  -- after last expired plan (inclusive)
  AND (
    lep.last_expired_date IS NULL
    OR CAST(ca.date AS DATE) >= lep.last_expired_date
  );
`

const SQL_GET_UNPAID_CLASSES = `
WITH last_expired_plan AS (
  SELECT user_id, MAX(validity_to) AS last_expired_date
  FROM user_plan
  WHERE current_status IN ('EXPIRED_BY_DATE','EXPIRED_BY_USAGE')
    AND deleted_at IS NULL
  GROUP BY user_id
)
SELECT 
  ca.id, 
  ca.user_id, 
  ca.date,
  COALESCE(c.class_name, 'Yoga Class') as class_name,
  COALESCE(TO_CHAR(c.start_time, 'HH24:MI'), 'N/A') as start_time,
  COALESCE(TO_CHAR(c.end_time, 'HH24:MI'), 'N/A') as end_time
FROM class_attendance ca
LEFT JOIN class c ON c.class_id = ca.class_id
LEFT JOIN last_expired_plan lep ON lep.user_id = ca.user_id
WHERE ca.attendance_status = 'ATTENDED'
  AND ca.deleted_at IS NULL
  AND ca.adjusted_to_plan_id IS NULL
  AND ca.unpaid_email_sent = FALSE
  AND NOT EXISTS (
    SELECT 1 FROM user_plan up
    WHERE up.user_id = ca.user_id
      AND up.current_status = 'ACTIVE'
      AND CAST(ca.date AS DATE)
          BETWEEN up.validity_from AND up.validity_to
  )
  AND (
    lep.last_expired_date IS NULL
    OR CAST(ca.date AS DATE) >= lep.last_expired_date
  )
ORDER BY ca.user_id, ca.date DESC;
`

const SQL_RESET_ATTENDANCE = `
UPDATE user_plan_attendance
SET classes_attended = 0
WHERE deleted_at IS NULL;
`

const SQL_RECOUNT_ATTENDANCE = `
UPDATE user_plan_attendance upa
SET classes_attended = sub.cnt
FROM (
  SELECT user_plan_id, COUNT(*) cnt
  FROM class_attendance
  WHERE attendance_status = 'ATTENDED'
    AND deleted_at IS NULL
  GROUP BY user_plan_id
) sub
WHERE upa.user_plan_id = sub.user_plan_id;
`

const SQL_PRACTICE_NOW_ATTENDANCE = `UPDATE user_plan_attendance upa
SET classes_attended = classes_attended + pn.total_attended
FROM (
  SELECT
    upa.user_plan_id,
    SUM(pna.classes_attended) AS total_attended
  FROM practice_now_plan_attendance pna
  JOIN user_plan_attendance upa
    ON upa.user_id = pna.user_id
   AND pna.start_date >= upa.start_date
   AND pna.expiry_date <= upa.expiry_date
  WHERE pna.deleted_at IS NULL
    AND pna.status = 'ACTIVE'
  GROUP BY upa.user_plan_id
) pn
WHERE upa.user_plan_id = pn.user_plan_id;
`

const SQL_EXPIRE_BY_USAGE = `
UPDATE user_plan up
SET current_status = 'EXPIRED_BY_USAGE',
    updated = NOW()
FROM user_plan_attendance upa
JOIN plan p ON p.plan_id = up.plan_id
WHERE up.user_plan_id = upa.user_plan_id
  AND up.current_status = 'ACTIVE'
  AND upa.classes_attended >= upa.classes_allowed
  AND upa.classes_allowed > 0
  AND p.plan_user_type = 'INSTITUTE';
`

module.exports = {
  UpdatePlanStatuses: async function UpdatePlanStatuses() {
    console.log('[UpdatePlanStatuses] Received request to update plan statuses')
    console.log('[UpdatePlanStatuses] User plan cron started')
    const tx = await sequelize.transaction()

    try {
      await sequelize.query(SQL_EXPIRE_BY_DATE, { transaction: tx })
      await sequelize.query(SQL_ACTIVATE_STAGED, { transaction: tx })
      // await sequelize.query(CLASS_ATTENDANCE_INIT, { transaction: tx })
      await sequelize.query(SQL_SYNC_ATTENDANCE_STATUS, { transaction: tx })

      await sequelize.query(SQL_ADJUST_UNPAID_CLASSES, { transaction: tx })

      const unpaid = await sequelize.query(SQL_GET_UNPAID_CLASSES, {
        type: sequelize.QueryTypes.SELECT,
        transaction: tx,
      })

      // Group unpaid classes by user
      const unpaidByUser = {}
      unpaid.forEach((row) => {
        if (!unpaidByUser[row.user_id]) {
          unpaidByUser[row.user_id] = []
        }
        unpaidByUser[row.user_id].push({
          id: row.id,
          date: row.date
            ? new Date(row.date).toLocaleDateString('en-IN')
            : 'N/A',
          class_name: row.class_name,
          start_time: row.start_time,
          end_time: row.end_time,
        })
      })

      const unsuccessful = []
      const successfullySentIds = []

      // Fetch user details and send emails grouped by user
      const emailResults = await Promise.all(
        Object.entries(unpaidByUser).map(async ([userId, classes]) => {
          try {
            const user = await User.findByPk(userId)
            if (!user) return null

            const sent = await sendUnpaidClassEmail(
              { name: user.name, email: user.email },
              classes,
              process.env.FRONTEND_DOMAIN,
              null
            )

            if (sent) {
              // Collect all IDs from this user's unpaid classes
              classes.forEach((cls) => {
                successfullySentIds.push(cls.id)
              })
              return userId
            } else {
              classes.forEach((cls) => {
                unsuccessful.push(cls.id)
              })
              return null
            }
          } catch (err) {
            console.error(
              '[UpdatePlanStatuses] Error processing user',
              userId,
              err
            )
            return null
          }
        })
      )

      if (successfullySentIds.length > 0) {
        await sequelize.query(
          `UPDATE class_attendance SET unpaid_email_sent = TRUE WHERE id IN (:ids)`,
          { replacements: { ids: successfullySentIds }, transaction: tx }
        )
      }

      console.log('[UpdatePlanStatuses] failed to send to  : ', unsuccessful)

      await sequelize.query(SQL_RESET_ATTENDANCE, { transaction: tx })
      await sequelize.query(SQL_RECOUNT_ATTENDANCE, { transaction: tx })
      await sequelize.query(SQL_PRACTICE_NOW_ATTENDANCE, { transaction: tx })
      await sequelize.query(SQL_EXPIRE_BY_USAGE, { transaction: tx })

      const sentCount = successfullySentIds.length
      console.log(
        `[UpdatePlanStatuses] Successfully sent unpaid class emails for ${sentCount} class${sentCount > 1 ? 'es' : ''}`
      )

      await tx.commit()
      console.log('[UpdatePlanStatuses] User plan cron completed')
    } catch (err) {
      await tx.rollback()
      console.error('[UpdatePlanStatuses] User plan cron failed', err)
    }
  },

  SendPlanExpiryReminders: async () => {
    try {
      console.log(
        '[SendPlanExpiryReminders] Received request to send plan expiry reminders'
      )

      const currentDate = new Date().toISOString().split('T')[0]

      const plansExpiringToday = await UserPlan.findAll({
        where: {
          validity_to: {
            [Op.gte]: `${currentDate} 00:00:00`,
            [Op.lte]: `${currentDate} 23:59:59`,
          },
          expiration_reminder_sent: false,
        },
        include: [
          {
            model: User,
            required: true,
            attributes: ['name', 'email'],
          },
        ],
      })

      if (plansExpiringToday.length === 0) return

      console.log(
        `[SendPlanExpiryReminders] Processing ${plansExpiringToday.length} expiration reminders...`
      )

      const emailPromises = plansExpiringToday.map(async (plan) => {
        const { user } = plan

        if (!user || !user.email) return null

        try {
          await mailTransporter.sendMail({
            from: 'dev.6amyoga@gmail.com',
            to: user.email,
            cc: '992351@gmail.com',
            subject: '6AM Yoga | Plan Expired!',
            html: `
            <p>Dear ${user.name},</p>

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
          })
          return plan.user_plan_id // Return ID on success
        } catch (err) {
          console.error(
            `[SendPlanExpiryReminders] Failed to email user ${user.email}:`,
            err
          )
          return null
        }
      })

      const results = await Promise.all(emailPromises)

      const successfulPlanIds = results.filter((id) => id !== null)

      if (successfulPlanIds.length > 0) {
        await UserPlan.update(
          { expiration_reminder_sent: true },
          {
            where: {
              user_plan_id: successfulPlanIds,
            },
          }
        )
        console.log(
          `[SendPlanExpiryReminders] Successfully marked ${successfulPlanIds.length} plans as notified.`
        )
      }
    } catch (error) {
      console.error(
        '[SendPlanExpiryReminders] Error while sending reminders:',
        error
      )
    }
  },
}

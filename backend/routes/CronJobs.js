const express = require('express')
const router = express.Router()
const { User } = require('../models/sql/User')
const {
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require('../utils/http_status_codes')

const { sequelize } = require('../init.sequelize')
const { mailTransporter } = require('../init.nodemailer')

const sendUnpaidClassEmail = async (
  user,
  classDate,
  lastPlanId = null,
  frontendDomain
) => {
  try {
    if (!user || !user.email) return false

    const purchaseLink = lastPlanId
      ? `${frontendDomain}/student/purchase-a-plan/${lastPlanId}`
      : `${frontendDomain}/student/purchase-a-plan`

    await mailTransporter.sendMail({
      from: 'dev.6amyoga@gmail.com',
      to: user.email,
      subject: '6AM Yoga | Unpaid Class Attendance',
      html: `
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>You attended a class on <strong>${classDate}</strong> without an active plan.</p>
        <p>Please purchase a plan to continue attending classes.</p>
        <p>
          <a href="${purchaseLink}"
             style="background:#4CAF50;color:#fff;padding:10px 16px;
                    border-radius:4px;text-decoration:none;">
            Purchase Plan
          </a>
        </p>
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
SELECT ca.id, ca.user_id, ca.date
FROM class_attendance ca
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
  );
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

router.post('/update-plan-statuses', async (req, res) => {
  console.log('Received request to update plan statuses')
  console.log('🕑 User plan cron started')
  const tx = await sequelize.transaction()

  try {
    await sequelize.query(SQL_EXPIRE_BY_DATE, { transaction: tx })
    await sequelize.query(SQL_ACTIVATE_STAGED, { transaction: tx })
    await sequelize.query(CLASS_ATTENDANCE_INIT, { transaction: tx })
    await sequelize.query(SQL_SYNC_ATTENDANCE_STATUS, { transaction: tx })
    await sequelize.query(SQL_ADJUST_UNPAID_CLASSES, { transaction: tx })
    const unpaid = await sequelize.query(SQL_GET_UNPAID_CLASSES, {
      type: sequelize.QueryTypes.SELECT,
      transaction: tx,
    })

    for (const row of unpaid) {
      const user = await User.findByPk(row.user_id, { transaction: tx })
      if (!user) continue

      const sent = await sendUnpaidClassEmail(
        user,
        row.date.toISOString().split('T')[0],
        null,
        process.env.FRONTEND_DOMAIN
      )

      if (sent) {
        await sequelize.query(
          `UPDATE class_attendance
             SET unpaid_email_sent = TRUE
             WHERE id = :id`,
          { replacements: { id: row.id }, transaction: tx }
        )
      }
    }

    await sequelize.query(SQL_RESET_ATTENDANCE, { transaction: tx })
    await sequelize.query(SQL_RECOUNT_ATTENDANCE, { transaction: tx })
    await sequelize.query(SQL_PRACTICE_NOW_ATTENDANCE, { transaction: tx })
    await sequelize.query(SQL_EXPIRE_BY_USAGE, { transaction: tx })

    await tx.commit()
    console.log('✅ User plan cron completed')
  } catch (err) {
    await tx.rollback()
    console.error('❌ User plan cron failed', err)
  }
  res.status(HTTP_OK).json({ message: 'Cron job executed successfully' })
})

module.exports = router

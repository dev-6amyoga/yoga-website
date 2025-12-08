const express = require('express')
const router = express.Router()
const { UserPlanAttendance } = require('../models/sql/UserPlanAttendance')
const {
  PracticeNowPlanAttendance,
} = require('../models/sql/PracticeNowPlanAttendance')
const { UserPlan } = require('../models/sql/UserPlan')
const { ClassAttendance } = require('../models/sql/ClassAttendance')
const { User } = require('../models/sql/User')
const { sequelize, Op } = require('../init.sequelize')
const { mailTransporter } = require('../init.nodemailer')
const moment = require('moment-timezone')
const getFrontendDomain = require('../utils/getFrontendDomain')
const {
  USER_PLAN_EXPIRED_BY_DATE,
  USER_PLAN_ACTIVE,
  USER_PLAN_STAGED,
  USER_PLAN_EXPIRED_BY_USAGE,
} = require('../enums/user_plan_status')
const {
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require('../utils/http_status_codes')

const sendUnpaidClassEmail = async (
  user,
  classDate,
  lastPlanId = null,
  frontendDomain
) => {
  try {
    if (!user || !user.email) {
      console.warn('User or email not found for unpaid class notification')
      return false
    }

    const purchaseLink = lastPlanId
      ? `${frontendDomain}/student/purchase-a-plan/${lastPlanId}`
      : `${frontendDomain}/student/purchase-a-plan`

    await mailTransporter.sendMail({
      from: 'dev.6amyoga@gmail.com',
      to: user.email,
      cc: '992351@gmail.com',
      subject: '6AM Yoga | Unpaid Class Attendance',
      text: `Hello ${user.name},\n\nWe noticed that you attended a class on ${classDate} without an active plan.\n\nPlease purchase a plan to continue attending classes.\n\nRepeat your last subscription: ${purchaseLink}\n\nBest regards,\n6AM Yoga Team`,
      html: `
        <h2>Unpaid Class Attendance</h2>
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>We noticed that you attended a class on <strong>${classDate}</strong> without an active plan.</p>
        <p>Please purchase a plan to continue attending classes.</p>
        <br/>
        <p><strong>Repeat your last subscription:</strong></p>
        <p><a href="${purchaseLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Purchase Plan</a></p>
        <br/>
        <p>Best regards,<br/>6AM Yoga Team</p>
      `,
    })

    console.log(
      `Unpaid class email sent to ${user.email} for class on ${classDate}`
    )
    return true
  } catch (err) {
    console.error(`Failed to send unpaid class email to ${user?.email}:`, err)
    return false
  }
}

router.post('/update-plan-statuses', async (req, res) => {
  console.log('Received request to update plan statuses')
  const t = await sequelize.transaction()
  try {
    const today = moment().tz('Asia/Kolkata').startOf('day')

    const allUserPlans = await UserPlan.findAll({
      transaction: t,
    })

    let updatedCount = 0
    let updatedAttendanceCount = 0
    let emailsSent = 0

    for (const userPlan of allUserPlans) {
      const validityFrom = moment(userPlan.validity_from)
        .tz('Asia/Kolkata')
        .startOf('day')
      const validityTo = moment(userPlan.validity_to)
        .tz('Asia/Kolkata')
        .startOf('day')

      let newStatus = userPlan.current_status

      if (
        today.isSameOrAfter(validityFrom) &&
        today.isSameOrBefore(validityTo)
      ) {
        newStatus = USER_PLAN_ACTIVE
      } else if (today.isAfter(validityTo)) {
        newStatus = USER_PLAN_EXPIRED_BY_DATE
      } else if (today.isBefore(validityFrom)) {
        newStatus = USER_PLAN_STAGED
      }

      if (newStatus !== userPlan.current_status) {
        console.log(
          `Updating UserPlan ID ${userPlan.user_plan_id} status from ${userPlan.current_status} to ${newStatus}`
        )
        await UserPlan.update(
          { current_status: newStatus },
          {
            where: { user_plan_id: userPlan.user_plan_id },
            transaction: t,
          }
        )
        updatedCount++

        let attendanceStatus = newStatus
        if (
          newStatus === USER_PLAN_EXPIRED_BY_DATE ||
          newStatus === USER_PLAN_EXPIRED_BY_USAGE
        ) {
          attendanceStatus = 'EXPIRED'
        }

        await UserPlanAttendance.update(
          { status: attendanceStatus },
          {
            where: { user_plan_id: userPlan.user_plan_id },
            transaction: t,
          }
        )
        updatedAttendanceCount++
      }
    }

    const allUsers = await User.findAll({
      attributes: ['user_id'],
      transaction: t,
    })

    for (const user of allUsers) {
      const userId = user.user_id

      // Check for active user plans (excluding PRACTICENOWPLAN)
      const activeUserPlans = await UserPlan.findAll({
        where: {
          user_id: userId,
          current_status: USER_PLAN_ACTIVE,
          transaction_order_id: {
            [Op.ne]: 'PRACTICENOWPLAN',
          },
        },
        transaction: t,
      })

      // Check for active PRACTICENOWPLAN
      const activePracticeNowPlan = await UserPlan.findOne({
        where: {
          user_id: userId,
          current_status: USER_PLAN_ACTIVE,
          transaction_order_id: 'PRACTICENOWPLAN',
        },
        transaction: t,
      })

      if (activeUserPlans.length > 0) {
        const activePlan = activeUserPlans[0]

        // Rule 2 & 3: Check/create UserPlanAttendance and calculate attended classes
        let userPlanAttendance = await UserPlanAttendance.findOne({
          where: {
            user_id: userId,
            user_plan_id: activePlan.user_plan_id,
          },
          transaction: t,
        })

        const validityFrom = moment(activePlan.validity_from)
          .tz('Asia/Kolkata')
          .startOf('day')
        const validityTo = moment(activePlan.validity_to)
          .tz('Asia/Kolkata')
          .startOf('day')

        // Get class attendance for this user
        const classAttendances = await ClassAttendance.findAll({
          where: { user_id: userId },
          transaction: t,
        })

        // Get the plan details to know classes_allowed
        const plan = await activePlan.getPlan({ transaction: t })

        let classesAttended = 0

        for (const attendance of classAttendances) {
          const attendanceDate = moment(attendance.date)
            .tz('Asia/Kolkata')
            .startOf('day')

          // Attended between validity_from and validity_to
          if (
            attendanceDate.isSameOrAfter(validityFrom) &&
            attendanceDate.isSameOrBefore(validityTo)
          ) {
            classesAttended++
          } else if (attendanceDate.isBefore(validityFrom)) {
            // Check if attendance is after most recent expired plan
            const expiredPlans = await UserPlan.findAll({
              where: {
                user_id: userId,
                current_status: [
                  USER_PLAN_EXPIRED_BY_DATE,
                  USER_PLAN_EXPIRED_BY_USAGE,
                ],
                transaction_order_id: {
                  [Op.ne]: 'PRACTICENOWPLAN',
                },
              },
              order: [['validity_to', 'DESC']],
              transaction: t,
            })

            if (expiredPlans.length > 0) {
              const mostRecentExpired = expiredPlans[0]
              const expiredValidityTo = moment(mostRecentExpired.validity_to)
                .tz('Asia/Kolkata')
                .startOf('day')

              if (
                attendanceDate.isAfter(expiredValidityTo) &&
                attendanceDate.isBefore(validityFrom)
              ) {
                classesAttended++
              }
            } else {
              // No expired plans, count attendance before current active plan
              classesAttended++
            }
          }
        }

        // Get classes attended from PracticeNowPlanAttendance if PRACTICENOWPLAN exists
        let practiceNowClassesAttended = 0
        if (activePracticeNowPlan) {
          const practiceNowAttendance = await PracticeNowPlanAttendance.findOne(
            {
              where: {
                user_id: userId,
                user_plan_id: activePracticeNowPlan.user_plan_id,
              },
              transaction: t,
            }
          )
          if (practiceNowAttendance) {
            practiceNowClassesAttended = practiceNowAttendance.classes_attended
          }
        }

        // Total classes attended = classes from PracticeNowPlanAttendance + classes from ClassAttendance
        const totalClassesAttended =
          practiceNowClassesAttended + classesAttended

        // Rule 2 & 3: Create or update UserPlanAttendance
        if (!userPlanAttendance) {
          await UserPlanAttendance.create(
            {
              user_id: userId,
              plan_id: activePlan.plan_id,
              user_plan_id: activePlan.user_plan_id,
              start_date: activePlan.validity_from,
              expiry_date: activePlan.validity_to,
              classes_allowed: plan.classes_allowed || 0,
              classes_attended: totalClassesAttended,
              status: USER_PLAN_ACTIVE,
            },
            { transaction: t }
          )
          updatedAttendanceCount++

          // ✅ Check if classes_allowed = classes_attended
          if (
            plan.classes_allowed > 0 &&
            plan.classes_allowed === totalClassesAttended
          ) {
            console.log(
              `UserPlan ID ${activePlan.user_plan_id} - Classes limit reached. Setting to EXPIRED_BY_USAGE`
            )
            await UserPlan.update(
              { current_status: USER_PLAN_EXPIRED_BY_USAGE },
              {
                where: { user_plan_id: activePlan.user_plan_id },
                transaction: t,
              }
            )
            await UserPlanAttendance.update(
              { status: 'EXPIRED' },
              {
                where: { user_plan_id: activePlan.user_plan_id },
                transaction: t,
              }
            )
            updatedCount++
          }
        } else {
          await UserPlanAttendance.update(
            {
              classes_attended: totalClassesAttended,
            },
            {
              where: { id: userPlanAttendance.id },
              transaction: t,
            }
          )
          updatedAttendanceCount++

          // ✅ Check if classes_allowed = classes_attended
          if (
            plan.classes_allowed > 0 &&
            plan.classes_allowed === totalClassesAttended &&
            activePlan.current_status !== USER_PLAN_EXPIRED_BY_USAGE
          ) {
            console.log(
              `UserPlan ID ${activePlan.user_plan_id} - Classes limit reached. Setting to EXPIRED_BY_USAGE`
            )
            await UserPlan.update(
              { current_status: USER_PLAN_EXPIRED_BY_USAGE },
              {
                where: { user_plan_id: activePlan.user_plan_id },
                transaction: t,
              }
            )
            await UserPlanAttendance.update(
              { status: 'EXPIRED' },
              {
                where: { user_plan_id: activePlan.user_plan_id },
                transaction: t,
              }
            )
            updatedCount++
          }
        }
      } else {
        // Rule 4: User has NO active regular plan
        // Set all UserPlanAttendance rows to EXPIRED status
        await UserPlanAttendance.update(
          { status: 'EXPIRED' },
          {
            where: { user_id: userId },
            transaction: t,
          }
        )

        // Rule 5: Check for unpaid class attendance
        const userPlanRows = await UserPlan.findAll({
          where: {
            user_id: userId,
            transaction_order_id: {
              [Op.ne]: 'PRACTICENOWPLAN',
            },
          },
          transaction: t,
        })

        const classAttendances = await ClassAttendance.findAll({
          where: { user_id: userId },
          transaction: t,
        })

        const userEmail = await User.findByPk(userId, { transaction: t })

        // Get the last plan the user purchased (most recent by purchase_date, excluding PRACTICENOWPLAN)
        const lastUserPlan = await UserPlan.findOne({
          where: {
            user_id: userId,
            transaction_order_id: {
              [Op.ne]: 'PRACTICENOWPLAN',
            },
          },
          order: [['purchase_date', 'DESC']],
          transaction: t,
        })

        const lastPlanId = lastUserPlan ? lastUserPlan.plan_id : null
        const frontendDomain = getFrontendDomain()

        if (userPlanRows.length === 0) {
          // No user plans at all - all classes are unpaid
          for (const attendance of classAttendances) {
            const emailSent = await sendUnpaidClassEmail(
              userEmail,
              moment(attendance.date).format('YYYY-MM-DD'),
              lastPlanId,
              frontendDomain
            )
            if (emailSent) emailsSent++
          }
        } else {
          // Check attendance after most recent expired plan
          const mostRecentExpired = await UserPlan.findOne({
            where: {
              user_id: userId,
              current_status: [
                USER_PLAN_EXPIRED_BY_DATE,
                USER_PLAN_EXPIRED_BY_USAGE,
              ],
              transaction_order_id: {
                [Op.ne]: 'PRACTICENOWPLAN',
              },
            },
            order: [['validity_to', 'DESC']],
            transaction: t,
          })

          if (mostRecentExpired) {
            const expiredValidityTo = moment(mostRecentExpired.validity_to)
              .tz('Asia/Kolkata')
              .startOf('day')

            for (const attendance of classAttendances) {
              const attendanceDate = moment(attendance.date)
                .tz('Asia/Kolkata')
                .startOf('day')

              if (attendanceDate.isAfter(expiredValidityTo)) {
                const emailSent = await sendUnpaidClassEmail(
                  userEmail,
                  moment(attendance.date).format('YYYY-MM-DD'),
                  lastPlanId,
                  frontendDomain
                )
                if (emailSent) emailsSent++
              }
            }
          }
        }
      }
    }

    await t.commit()
    return res.status(HTTP_OK).json({
      message: 'Plan statuses updated successfully',
      userPlansUpdated: updatedCount,
      attendanceRecordsUpdated: updatedAttendanceCount,
      emailsSent: emailsSent,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    if (!t.finished) {
      await t.rollback()
    }
    console.error('Cron update plan statuses error:', error)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to update plan statuses',
      details: error.message,
    })
  }
})

module.exports = router

const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const { ZoomClassModel } = require('../models/sql/ZoomClassModel')
const { ClassAttendance } = require('../models/sql/ClassAttendance')
const { Plan } = require('../models/sql/Plan')
const { UserPlanAttendance } = require('../models/sql/UserPlanAttendance')
const { sequelize } = require('../init.sequelize')

router.post('/join', async (req, res) => {
  const t = await sequelize.transaction()
  try {
    const { userId, classId, planId, userPlanId, deviceId } = req.body
    const now = new Date()

    if (!userId || !classId || !planId || !userPlanId) {
      await t.rollback()
      return res
        .status(400)
        .json({ allowed: false, message: 'Missing required fields' })
    }

    // 1. load user plan attendance (single record) with row lock
    const userPlan = await UserPlanAttendance.findOne({
      where: { user_plan_id: userPlanId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    })

    if (!userPlan) {
      await t.rollback()
      return res
        .status(404)
        .json({ allowed: false, message: 'User plan not found' })
    }

    // validate plan period and status
    if (
      now < new Date(userPlan.start_date) ||
      now > new Date(userPlan.expiry_date)
    ) {
      await t.rollback()
      return res
        .status(403)
        .json({ allowed: false, message: 'Plan expired or not active' })
    }

    if (String(userPlan.status).toUpperCase() === 'EXPIRED') {
      await t.rollback()
      return res
        .status(403)
        .json({ allowed: false, message: 'Plan already expired' })
    }

    // 2. fetch class
    const yogaClass = await ZoomClassModel.findByPk(classId, { transaction: t })
    if (!yogaClass) {
      await t.rollback()
      return res
        .status(404)
        .json({ allowed: false, message: 'Class not found' })
    }

    // 3. determine today's class start/end (handles recurring)
    let classStart, classEnd
    if (String(yogaClass.class_type).toLowerCase() === 'recurring') {
      const todayDay = now.getDay()
      if (
        !Array.isArray(yogaClass.recurring_days) ||
        !yogaClass.recurring_days.includes(todayDay)
      ) {
        await t.rollback()
        return res
          .status(403)
          .json({ allowed: false, message: 'No class scheduled today' })
      }

      const [sh, sm] = String(yogaClass.recurring_start_time)
        .split(':')
        .map(Number)
      const [eh, em] = String(yogaClass.recurring_end_time)
        .split(':')
        .map(Number)

      classStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        sh,
        sm,
        0,
        0
      )
      classEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        eh,
        em,
        0,
        0
      )
    } else {
      classStart = new Date(yogaClass.start_time)
      classEnd = new Date(yogaClass.end_time)
    }

    const tenMinsBeforeStart = new Date(classStart.getTime() - 10 * 60000)

    // 4. check class window
    if (now < tenMinsBeforeStart) {
      await t.rollback()
      return res
        .status(403)
        .json({ allowed: false, message: 'Class not started yet' })
    }
    if (now > classEnd) {
      await t.rollback()
      return res
        .status(403)
        .json({ allowed: false, message: 'Class already ended' })
    }

    // 5. check existing attendance for this class/user for today
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0
    )
    const nextDay = new Date(startOfDay)
    nextDay.setDate(startOfDay.getDate() + 1)

    const existingAttendance = await ClassAttendance.findOne({
      where: {
        user_id: userId,
        class_id: classId,
        date: { [Op.gte]: startOfDay, [Op.lt]: nextDay },
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    })

    // 6. if no attendance -> create & update userPlan.classes_attended (use update, not .increment)
    if (!existingAttendance) {
      if (userPlan.classes_attended >= userPlan.classes_allowed) {
        await t.rollback()
        return res
          .status(403)
          .json({ allowed: false, message: 'Class quota reached' })
      }

      await ClassAttendance.create(
        {
          user_id: userId,
          plan_id: planId,
          user_plan_id: userPlanId,
          class_id: classId,
          device_id: deviceId,
          date: now,
          attendance_status: 'ATTENDED',
          join_time: now,
        },
        { transaction: t }
      )

      // update classes_attended manually
      await UserPlanAttendance.update(
        { classes_attended: (userPlan.classes_attended || 0) + 1 },
        { where: { user_plan_id: userPlanId }, transaction: t }
      )

      await t.commit()
      return res.json({ allowed: true, message: 'Joined successfully' })
    }

    // 7. if attendance exists -> check device id
    if (existingAttendance.device_id !== deviceId) {
      await t.rollback()
      return res
        .status(403)
        .json({ allowed: false, message: 'Already joined from another device' })
    }

    await t.commit()
    return res.json({
      allowed: true,
      message: 'Rejoined from same device',
      rejoin: true,
    })
  } catch (err) {
    await t.rollback()
    console.error('Join error:', err)
    return res.status(500).json({ allowed: false, message: 'Server error' })
  }
})

router.get('/api/attendance/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const attendanceRecords = await ClassAttendance.findAll({
      where: { user_id: userId },
      order: [['date', 'DESC']],
    })

    // attach class, plan and userPlanAttendance objects for each record
    const enriched = await Promise.all(
      attendanceRecords.map(async (rec) => {
        const recJson = rec.toJSON ? rec.toJSON() : rec
        const [cls, plan, upa] = await Promise.all([
          ZoomClassModel.findByPk(recJson.class_id),
          Plan.findByPk(recJson.plan_id),
          recJson.user_plan_id
            ? UserPlanAttendance.findOne({
                where: { user_plan_id: recJson.user_plan_id },
              })
            : Promise.resolve(null),
        ])
        return {
          ...recJson,
          class: cls ? (cls.toJSON ? cls.toJSON() : cls) : null,
          plan: plan ? (plan.toJSON ? plan.toJSON() : plan) : null,
          userPlanAttendance: upa ? (upa.toJSON ? upa.toJSON() : upa) : null,
        }
      })
    )

    res.status(200).json(enriched)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch attendance records' })
  }
})

module.exports = router

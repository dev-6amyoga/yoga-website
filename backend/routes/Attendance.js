const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const { ZoomClassModel } = require('../models/sql/ZoomClassModel')
const { ClassAttendance } = require('../models/sql/ClassAttendance')
const { Plan } = require('../models/sql/Plan')
const { UserPlanAttendance } = require('../models/sql/UserPlanAttendance')
const { sequelize } = require('../init.sequelize')
const moment = require('moment-timezone')

router.post('/join', async (req, res) => {
  const t = await sequelize.transaction()
  try {
    const { userId, classId, planId, userPlanId, deviceId } = req.body
    const now = moment().tz('Asia/Kolkata') // 🔥 always use IST

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
    const startDate = moment(userPlan.start_date).tz('Asia/Kolkata')
    const endDate = moment(userPlan.expiry_date).tz('Asia/Kolkata')

    if (now.isBefore(startDate) || now.isAfter(endDate)) {
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
      const todayDay = now.day()

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

      classStart = moment.tz(
        {
          year: now.year(),
          month: now.month(),
          date: now.date(),
          hour: sh,
          minute: sm,
          second: 0,
        },
        'Asia/Kolkata'
      )

      classEnd = moment.tz(
        {
          year: now.year(),
          month: now.month(),
          date: now.date(),
          hour: eh,
          minute: em,
          second: 0,
        },
        'Asia/Kolkata'
      )
    } else {
      classStart = moment(yogaClass.start_time).tz('Asia/Kolkata')
      classEnd = moment(yogaClass.end_time).tz('Asia/Kolkata')
    }

    const tenMinsBeforeStart = classStart.clone().subtract(10, 'minutes')

    console.log('NOW:', now.format())
    console.log('CLASS START:', classStart.format())
    console.log('CLASS END:', classEnd.format())
    console.log('Ten mins before:', tenMinsBeforeStart.format())

    // 4. check class window
    if (now.isBefore(tenMinsBeforeStart)) {
      await t.rollback()
      return res
        .status(403)
        .json({ allowed: false, message: 'Class not started yet' })
    }
    if (now.isAfter(classEnd)) {
      await t.rollback()
      return res
        .status(403)
        .json({ allowed: false, message: 'Class already ended' })
    }

    // 5. check today's attendance window
    const startOfDay = now.clone().startOf('day')
    const endOfDay = now.clone().endOf('day')

    const existingAttendance = await ClassAttendance.findOne({
      where: {
        user_id: userId,
        class_id: classId,
        date: { [Op.between]: [startOfDay.toDate(), endOfDay.toDate()] },
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    })

    // 6. new attendance create
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
          date: now.toDate(),
          attendance_status: 'ATTENDED',
          join_time: now.toDate(),
        },
        { transaction: t }
      )

      await UserPlanAttendance.update(
        { classes_attended: (userPlan.classes_attended || 0) + 1 },
        { where: { user_plan_id: userPlanId }, transaction: t }
      )

      await t.commit()
      return res.json({ allowed: true, message: 'Joined successfully' })
    }

    // 7. attendance exists → check device
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

router.post('/admin/log-attendance', async (req, res) => {
  const t = await sequelize.transaction()
  try {
    const { entries } = req.body
    if (!Array.isArray(entries) || entries.length === 0) {
      await t.rollback()
      return res.status(400).json({ error: 'entries array required' })
    }

    const created = []
    const updatedUserPlans = []

    for (const entry of entries) {
      const {
        user_id,
        plan_id,
        user_plan_id,
        class_id,
        date,
        attendance_status = 'ATTENDED',
        join_time = null,
        leave_time = null,
        duration_minutes = null,
        instructor_id = null,
        remarks = null,
        device_id = 'ADMIN_MANUAL',
        force = false,
      } = entry

      if (!user_id || !plan_id || !user_plan_id || !class_id || !date) {
        await t.rollback()
        return res
          .status(400)
          .json({ error: 'Missing required fields in one of the entries' })
      }

      const when = new Date(date)
      const startOfDay = new Date(
        when.getFullYear(),
        when.getMonth(),
        when.getDate(),
        0,
        0,
        0,
        0
      )
      const nextDay = new Date(startOfDay)
      nextDay.setDate(startOfDay.getDate() + 1)

      // Lock user_plan_attendance row
      let upa = await UserPlanAttendance.findOne({
        where: { user_plan_id },
        transaction: t,
        lock: t.LOCK.UPDATE,
      })

      if (!upa) {
        // If no user_plan_attendance found, rollback and error
        await t.rollback()
        return res.status(404).json({
          error: `UserPlanAttendance not found for user_plan_id ${user_plan_id}`,
        })
      }

      // See if attendance already exists for that user/class on that date
      const existing = await ClassAttendance.findOne({
        where: {
          user_id,
          class_id,
          date: { [Op.gte]: startOfDay, [Op.lt]: nextDay },
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      })

      if (existing) {
        // update existing attendance record with admin values
        await ClassAttendance.update(
          {
            attendance_status,
            join_time,
            leave_time,
            duration_minutes,
            marked_by: 'INSTRUCTOR',
            instructor_id,
            remarks,
            device_id,
            updated: sequelize.literal('NOW()'),
          },
          { where: { id: existing.id }, transaction: t }
        )

        // include up-to-date userPlanAttendance in response
        upa = await UserPlanAttendance.findOne({
          where: { user_plan_id },
          transaction: t,
        })
        upgraded = upa.toJSON ? upa.toJSON() : upa
        created.push({ updatedAttendanceId: existing.id, action: 'updated' })
        updatedUserPlans.push(upgraded)
        continue
      }

      // If creating new attendance, check quota (unless force)
      if (!force && upa.classes_attended >= upa.classes_allowed) {
        await t.rollback()
        return res.status(403).json({
          error: `Quota reached for user_plan_id ${user_plan_id}`,
          user_plan_attendance: upa.toJSON ? upa.toJSON() : upa,
        })
      }

      // Create new attendance record
      const newRec = await ClassAttendance.create(
        {
          user_id,
          plan_id,
          user_plan_id,
          class_id,
          device_id,
          date: when,
          attendance_status,
          join_time,
          leave_time,
          duration_minutes,
          marked_by: 'INSTRUCTOR',
          instructor_id,
          remarks,
        },
        { transaction: t }
      )

      // update classes_attended (manual update, not .increment)
      await UserPlanAttendance.update(
        { classes_attended: (upa.classes_attended || 0) + 1 },
        { where: { user_plan_id }, transaction: t }
      )

      // fetch fresh upa row for response
      upa = await UserPlanAttendance.findOne({
        where: { user_plan_id },
        transaction: t,
      })

      created.push(newRec.toJSON ? newRec.toJSON() : newRec)
      updatedUserPlans.push(upa.toJSON ? upa.toJSON() : upa)
    }

    await t.commit()
    return res.status(200).json({
      message: 'Attendance logged',
      created,
      updatedUserPlans,
    })
  } catch (err) {
    await t.rollback()
    console.error('admin/log-attendance error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router

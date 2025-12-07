const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const { ZoomClassModel } = require('../models/sql/ZoomClassModel')
const { ClassAttendance } = require('../models/sql/ClassAttendance')
const { Plan } = require('../models/sql/Plan')
const { UserPlanAttendance } = require('../models/sql/UserPlanAttendance')
const { UserPlan } = require('../models/sql/UserPlan')
const { User } = require('../models/sql/User')
const { sequelize } = require('../init.sequelize')
const moment = require('moment-timezone')

router.post('/join', async (req, res) => {
  const t = await sequelize.transaction()
  try {
    const { userId, classId, planId, userPlanId, deviceId } = req.body
    const now = moment().tz('Asia/Kolkata')
    if (!userId || !classId || !planId || !userPlanId) {
      await t.rollback()
      return res
        .status(400)
        .json({ allowed: false, message: 'Missing required fields' })
    }

    // 1. load user plan attendance (single record) with row lock
    let userPlan = await UserPlanAttendance.findOne({
      where: { user_plan_id: userPlanId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    })

    // Create UserPlanAttendance if it doesn't exist
    if (!userPlan) {
      // Fetch the UserPlan to get validity dates
      const userPlanRecord = await UserPlan.findOne({
        where: { user_plan_id: userPlanId },
        transaction: t,
      })

      if (!userPlanRecord) {
        await t.rollback()
        return res
          .status(404)
          .json({ allowed: false, message: 'User plan not found' })
      }

      // Fetch plan to get classes_allowed
      const plan = await Plan.findByPk(planId, { transaction: t })
      if (!plan) {
        await t.rollback()
        return res
          .status(404)
          .json({ allowed: false, message: 'Plan not found' })
      }

      // Create UserPlanAttendance record
      userPlan = await UserPlanAttendance.create(
        {
          user_id: userId,
          plan_id: planId,
          user_plan_id: userPlanId,
          start_date: userPlanRecord.validity_from,
          expiry_date: userPlanRecord.validity_to,
          classes_allowed: plan.number_of_zoom_classes || 0,
          classes_attended: 0,
          status: 'ACTIVE',
        },
        { transaction: t }
      )
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

    //console.log('NOW:', now.format())
    //console.log('CLASS START:', classStart.format())
    //console.log('CLASS END:', classEnd.format())
    //console.log('Ten mins before:', tenMinsBeforeStart.format())

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
      return res.json({ allowed: true, message: 'Opening Zoom' })
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
      message: 'Opening Zoom',
      rejoin: true,
    })
  } catch (err) {
    await t.rollback()
    console.error('Join error:', err)
    return res.status(500).json({ allowed: false, message: 'Server error' })
  }
})

router.post('/admin/join-class', async (req, res) => {
  try {
    const { classId } = req.body

    if (!classId) {
      return res.status(400).json({
        allowed: false,
        message: 'classId is required',
      })
    }

    // Fetch class details
    const yogaClass = await ZoomClassModel.findByPk(classId)

    if (!yogaClass) {
      return res.status(404).json({
        allowed: false,
        message: 'Class not found',
      })
    }

    // Return zoom URL and meeting details without any attendance tracking
    res.status(200).json({
      allowed: true,
      message: 'Admin access granted',
      class: yogaClass.toJSON ? yogaClass.toJSON() : yogaClass,
      zoom_url: yogaClass.zoom_url,
      zoom_meeting_id: yogaClass.zoom_meeting_id,
      zoom_meeting_password: yogaClass.zoom_meeting_password,
    })
  } catch (err) {
    console.error('Admin join class error:', err)
    res.status(500).json({ allowed: false, message: 'Server error' })
  }
})

router.get('/api/attendance/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const today = moment().tz('Asia/Kolkata').startOf('day')

    // 1. Check UserPlanAttendance first
    let userPlanAttendanceRecords = await UserPlanAttendance.findAll({
      where: { user_id: userId },
    })

    // 2. If no UserPlanAttendance rows exist, check for ACTIVE UserPlan entries
    if (userPlanAttendanceRecords.length === 0) {
      const activeUserPlans = await UserPlan.findAll({
        where: {
          user_id: userId,
          current_status: 'ACTIVE',
        },
      })

      // 3. For each ACTIVE UserPlan, create UserPlanAttendance if it doesn't exist
      for (const userPlan of activeUserPlans) {
        const plan = await Plan.findByPk(userPlan.plan_id)

        if (plan) {
          await UserPlanAttendance.create({
            user_id: userId,
            plan_id: userPlan.plan_id,
            user_plan_id: userPlan.user_plan_id,
            start_date: userPlan.validity_from,
            expiry_date: userPlan.validity_to,
            classes_allowed: plan.number_of_zoom_classes || 0,
            classes_attended: 0,
            status: 'ACTIVE',
          })
        }
      }

      // Fetch newly created records
      userPlanAttendanceRecords = await UserPlanAttendance.findAll({
        where: { user_id: userId },
      })
    }

    // Update status to EXPIRED if expiry_date is past
    for (const record of userPlanAttendanceRecords) {
      const expiryDate = moment(record.expiry_date)
        .tz('Asia/Kolkata')
        .startOf('day')
      if (expiryDate.isBefore(today) && record.status !== 'EXPIRED') {
        await UserPlanAttendance.update(
          { status: 'EXPIRED' },
          { where: { user_plan_id: record.user_plan_id } }
        )
        record.status = 'EXPIRED'
      }
    }

    // 4. Check for ClassAttendance records
    const classAttendanceRecords = await ClassAttendance.findAll({
      where: { user_id: userId },
      order: [['date', 'DESC']],
    })

    // 5. If ClassAttendance records exist, enrich them with plan and userPlanAttendance
    if (classAttendanceRecords.length > 0) {
      const enriched = await Promise.all(
        classAttendanceRecords.map(async (rec) => {
          const recJson = rec.toJSON ? rec.toJSON() : rec
          const [cls, plan, upa] = await Promise.all([
            ZoomClassModel.findByPk(recJson.class_id),
            Plan.findByPk(recJson.plan_id),
            recJson.user_plan_id
              ? UserPlanAttendance.findOne({
                  where: {
                    user_plan_id: recJson.user_plan_id,
                    status: 'ACTIVE',
                  },
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

      return res.status(200).json(enriched)
    }

    // 6. If no ClassAttendance records, return UserPlanAttendance and Plan data
    const userPlanDataWithPlans = await Promise.all(
      userPlanAttendanceRecords.map(async (upa) => {
        const plan = await Plan.findByPk(upa.plan_id)

        return {
          userPlanAttendance: upa ? (upa.toJSON ? upa.toJSON() : upa) : null,
          plan: plan ? (plan.toJSON ? plan.toJSON() : plan) : null,
        }
      })
    )

    res.status(200).json(userPlanDataWithPlans)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch attendance records' })
  }
})

router.post('/admin/log-attendance-by-class', async (req, res) => {
  const t = await sequelize.transaction()
  try {
    //console.log('=== /admin/log-attendance-by-class START ===')
    const { entries } = req.body

    //console.log('Request body:', JSON.stringify(req.body, null, 2))
    //console.log('Entries:', entries)

    if (
      !entries ||
      !entries.class_name ||
      !entries.class_type ||
      !entries.join_time ||
      !entries.users ||
      !Array.isArray(entries.users)
    ) {
      //console.log('❌ Validation failed')
      //console.log('  class_name:', entries?.class_name)
      //console.log('  class_type:', entries?.class_type)
      //console.log('  join_time:', entries?.join_time)
      //console.log('  users:', entries?.users)
      //console.log('  users is array:', Array.isArray(entries?.users))

      await t.rollback()
      return res.status(400).json({
        error:
          'Missing required fields: class_name, class_type, join_time, users array',
      })
    }

    //console.log(`✓ Validation passed`)
    //console.log(`Processing ${entries.users.length} users`)

    const created = []
    const updatedUserPlans = []

    for (const [userIdx, user] of entries.users.entries()) {
      const { user_id, plan_id, user_plan_id } = user

      // Extract from entries, NOT from entries.users[userIdx]
      const {
        class_name,
        date,
        join_time,
        leave_time,
        duration_minutes,
        class_type,
      } = entries

      if (!user_id || !plan_id || !user_plan_id || !date) {
        //console.log('❌ Missing required user fields')
        await t.rollback()
        return res.status(400).json({
          error: `Missing required fields for user ${user_id}`,
        })
      }

      //console.log('✓ User fields validated')

      // 1. Find the applicable class for this user

      const userApplicableClass = await ZoomClassModel.findOne({
        where: {
          plan_id: plan_id,
          zoom_class_name: class_name,
          class_type: class_type,
          recurring_start_time: join_time,
        },
        transaction: t,
      })

      if (!userApplicableClass) {
        //console.log(`❌ Class not found for user_plan_id ${user_plan_id}`)
        await t.rollback()
        return res.status(400).json({
          error: `Class ${class_name} not applicable for user_plan_id ${user_plan_id}`,
        })
      }

      // 2. Parse date and times
      const when = new Date(date)
      if (isNaN(when.getTime())) {
        //console.log('❌ Invalid date format')
        await t.rollback()
        return res
          .status(400)
          .json({ error: `Invalid date format for user ${user_id}` })
      }

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

      // Parse join_time (HH:mm format)
      //console.log(`Parsing join_time: "${join_time}"`)
      let parsedJoinTime = null
      if (join_time && typeof join_time === 'string') {
        const [hours, minutes] = join_time.split(':').map(Number)
        //console.log(`  Hours: ${hours}, Minutes: ${minutes}`)
        if (!isNaN(hours) && !isNaN(minutes)) {
          parsedJoinTime = new Date(when)
          parsedJoinTime.setHours(hours, minutes, 0, 0)
          //console.log(`  ✓ Parsed: ${parsedJoinTime.toISOString()}`)
        }
      }

      // Parse leave_time (HH:mm format)
      //console.log(`Parsing leave_time: "${leave_time}"`)
      let parsedLeaveTime = null
      if (leave_time && typeof leave_time === 'string') {
        const [hours, minutes] = leave_time.split(':').map(Number)
        //console.log(`  Hours: ${hours}, Minutes: ${minutes}`)
        if (!isNaN(hours) && !isNaN(minutes)) {
          parsedLeaveTime = new Date(when)
          parsedLeaveTime.setHours(hours, minutes, 0, 0)
          //console.log(`  ✓ Parsed: ${parsedLeaveTime.toISOString()}`)
        }
      }

      // 3. Lock and fetch UserPlanAttendance
      let upa = await UserPlanAttendance.findOne({
        where: { user_plan_id },
        transaction: t,
        lock: t.LOCK.UPDATE,
      })

      if (!upa) {
        const userPlanRecord = await UserPlan.findOne({
          where: { user_id: user_id, current_status: 'ACTIVE' },
          transaction: t,
        })

        if (!userPlanRecord) {
          await t.rollback()
          return res
            .status(404)
            .json({ allowed: false, message: 'User plan not found' })
        }

        // Fetch plan to get classes_allowed
        const plan = await Plan.findByPk(userPlanRecord.plan_id, {
          transaction: t,
        })
        if (!plan) {
          await t.rollback()
          return res
            .status(404)
            .json({ allowed: false, message: 'Plan not found' })
        }

        // Create UserPlanAttendance record
        const [newUPA, created] = await UserPlanAttendance.findOrCreate({
          where: { user_plan_id: user_plan_id },
          defaults: {
            user_id: user_id,
            plan_id: userPlanRecord.plan_id,
            start_date: userPlanRecord.validity_from,
            expiry_date: userPlanRecord.validity_to,
            classes_allowed: plan.number_of_zoom_classes || 0,
            classes_attended: 0,
            status: 'ACTIVE',
          },
          transaction: t,
        })

        if (created) {
          //console.log(`✓ New UserPlanAttendance created (id=${newUPA.id})`)
        } else {
          //console.log(`⊘ UserPlanAttendance already existed (id=${newUPA.id})`)
        }

        upa = newUPA
      }

      // 4. Check if attendance already exists for that user/class on that date
      const existing = await ClassAttendance.findOne({
        where: {
          user_id,
          class_id: userApplicableClass.zoom_class_id,
          date: { [Op.gte]: startOfDay, [Op.lt]: nextDay },
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      })

      //console.log('Existing attendance:', existing ? '✓ Found' : '✗ Not found')

      if (existing) {
        //console.log(`Updating existing attendance record (id=${existing.id})`)
        // Update existing attendance record
        await ClassAttendance.update(
          {
            attendance_status: 'ATTENDED',
            join_time: parsedJoinTime,
            leave_time: parsedLeaveTime,
            duration_minutes: duration_minutes || null,
            marked_by: 'INSTRUCTOR',
            device_id: 'ADMIN_MANUAL',
            updated: sequelize.literal('NOW()'),
          },
          { where: { id: existing.id }, transaction: t }
        )

        //console.log('✓ Attendance record updated')

        created.push({
          attendanceId: existing.id,
          action: 'updated',
          user_id,
          class_id: userApplicableClass.zoom_class_id,
        })
      } else {
        //console.log('Creating new attendance record')
        // 5. Create new attendance record
        const newAttendance = await ClassAttendance.create(
          {
            user_id,
            plan_id,
            user_plan_id,
            class_id: userApplicableClass.zoom_class_id,
            device_id: 'ADMIN_MANUAL',
            date: when,
            attendance_status: 'ATTENDED',
            join_time: parsedJoinTime,
            leave_time: parsedLeaveTime,
            duration_minutes: duration_minutes || null,
            marked_by: 'INSTRUCTOR',
            instructor_id: null,
          },
          { transaction: t }
        )

        //console.log(`✓ New attendance record created (id=${newAttendance.id})`)

        // 6. Increment classes_attended in UserPlanAttendance

        await UserPlanAttendance.update(
          { classes_attended: (upa.classes_attended || 0) + 1 },
          { where: { user_plan_id }, transaction: t }
        )

        //console.log('✓ classes_attended incremented')

        created.push(
          newAttendance.toJSON ? newAttendance.toJSON() : newAttendance
        )
      }

      // 7. Fetch fresh UPA row for response
      //console.log('Fetching updated UPA row')
      upa = await UserPlanAttendance.findOne({
        where: { user_plan_id },
        transaction: t,
      })
      updatedUserPlans.push(upa.toJSON ? upa.toJSON() : upa)
    }

    //console.log('\nCommitting transaction...')
    await t.commit()
    //console.log('✓ Transaction committed')
    //console.log('=== /admin/log-attendance-by-class END (SUCCESS) ===\n')

    return res.status(200).json({
      message: 'Attendance logged successfully',
      created,
      updatedUserPlans,
    })
  } catch (err) {
    console.error('=== /admin/log-attendance-by-class ERROR ===')
    console.error('Error message:', err.message)
    console.error('Error stack:', err.stack)
    console.error('Full error:', err)
    console.error('=== /admin/log-attendance-by-class END (FAILED) ===\n')

    await t.rollback()
    return res.status(500).json({ error: 'Server error' })
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
      if (isNaN(when.getTime())) {
        await t.rollback()
        return res.status(400).json({ error: 'Invalid date format' })
      }

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

      // Parse join_time and leave_time (HH:mm format) into full timestamps
      let parsedJoinTime = null
      let parsedLeaveTime = null

      if (join_time && typeof join_time === 'string') {
        const [hours, minutes] = join_time.split(':').map(Number)
        if (!isNaN(hours) && !isNaN(minutes)) {
          parsedJoinTime = new Date(when)
          parsedJoinTime.setHours(hours, minutes, 0, 0)
        }
      }

      if (leave_time && typeof leave_time === 'string') {
        const [hours, minutes] = leave_time.split(':').map(Number)
        if (!isNaN(hours) && !isNaN(minutes)) {
          parsedLeaveTime = new Date(when)
          parsedLeaveTime.setHours(hours, minutes, 0, 0)
        }
      }

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
            join_time: parsedJoinTime,
            leave_time: parsedLeaveTime,
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
          join_time: parsedJoinTime,
          leave_time: parsedLeaveTime,
          duration_minutes,
          marked_by: 'INSTRUCTOR',
          instructor_id: null,
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

router.get('/same-class/:classId', async (req, res) => {
  try {
    const { classId } = req.params

    // 1️⃣ Fetch base class
    const baseClass = await ZoomClassModel.findOne({
      where: { zoom_class_id: classId },
    })

    if (!baseClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      })
    }

    // 2️⃣ Fetch matching classes
    const matchingClasses = await ZoomClassModel.findAll({
      where: {
        zoom_class_name: baseClass.zoom_class_name,
        institute_id: baseClass.institute_id,
        teacher_id: baseClass.teacher_id,
        recurring_days: baseClass.recurring_days,
        recurring_start_time: baseClass.recurring_start_time,
        recurring_end_time: baseClass.recurring_end_time,
      },
    })

    const classIds = matchingClasses.map((c) => c.zoom_class_id)

    // 3️⃣ Fetch attendance (NO includes)
    const attendance = await ClassAttendance.findAll({
      where: { class_id: classIds },
      order: [['date', 'DESC']],
    })

    // 4️⃣ Collect user IDs
    const userIds = [...new Set(attendance.map((a) => a.user_id))]

    // 5️⃣ Fetch user data manually (still using model)
    const users = await User.findAll({
      where: { user_id: userIds },
      attributes: ['user_id', 'name', 'email', 'phone'],
    })

    // 6️⃣ Map user info to attendance
    const userMap = {}
    users.forEach((u) => (userMap[u.user_id] = u))

    const enrichedAttendance = attendance.map((att) => ({
      ...att.toJSON(),
      user: userMap[att.user_id] || null,
    }))

    return res.json({
      success: true,
      classIds,
      total_attendance: attendance.length,
      attendees: enrichedAttendance,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance',
    })
  }
})

module.exports = router

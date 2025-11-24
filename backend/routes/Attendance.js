const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const { ZoomClassModel } = require('../models/sql/ZoomClassModel')
const { ClassAttendance } = require('../models/sql/ClassAttendance')
const { Plan } = require('../models/sql/Plan')
const { UserPlanAttendance } = require('../models/sql/UserPlanAttendance')
const { UserPlan } = require('../models/sql/UserPlan')
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

router.post('/admin/log-attendance-by-class', async (req, res) => {
  const t = await sequelize.transaction()
  try {
    console.log('=== /admin/log-attendance-by-class START ===')
    const { entries } = req.body

    console.log('Request body:', JSON.stringify(req.body, null, 2))
    console.log('Entries:', entries)

    if (
      !entries ||
      !entries.class_name ||
      !entries.class_type ||
      !entries.join_time ||
      !entries.users ||
      !Array.isArray(entries.users)
    ) {
      console.log('❌ Validation failed')
      console.log('  class_name:', entries?.class_name)
      console.log('  class_type:', entries?.class_type)
      console.log('  join_time:', entries?.join_time)
      console.log('  users:', entries?.users)
      console.log('  users is array:', Array.isArray(entries?.users))

      await t.rollback()
      return res.status(400).json({
        error:
          'Missing required fields: class_name, class_type, join_time, users array',
      })
    }

    console.log(`✓ Validation passed`)
    console.log(`Processing ${entries.users.length} users`)

    const created = []
    const updatedUserPlans = []

    for (const [userIdx, user] of entries.users.entries()) {
      console.log(
        `\n--- Processing User ${userIdx + 1}/${entries.users.length} ---`
      )
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

      console.log('User data:', {
        user_id,
        plan_id,
        user_plan_id,
        class_name,
        date,
        join_time,
        leave_time,
        duration_minutes,
        class_type,
      })

      if (!user_id || !plan_id || !user_plan_id || !date) {
        console.log('❌ Missing required user fields')
        await t.rollback()
        return res.status(400).json({
          error: `Missing required fields for user ${user_id}`,
        })
      }

      console.log('✓ User fields validated')

      // 1. Find the applicable class for this user
      console.log(
        `Finding class: name="${class_name}", type="${class_type}", plan_id=${plan_id}, start_time="${join_time}"`
      )

      const userApplicableClass = await ZoomClassModel.findOne({
        where: {
          plan_id: plan_id,
          zoom_class_name: class_name,
          class_type: class_type,
          recurring_start_time: join_time,
        },
        transaction: t,
      })

      console.log(
        'Class search result:',
        userApplicableClass ? '✓ Found' : '❌ Not found'
      )
      if (userApplicableClass) {
        console.log('  Class details:', {
          zoom_class_id: userApplicableClass.zoom_class_id,
          zoom_class_name: userApplicableClass.zoom_class_name,
          plan_id: userApplicableClass.plan_id,
          recurring_start_time: userApplicableClass.recurring_start_time,
          recurring_end_time: userApplicableClass.recurring_end_time,
        })
      }

      if (!userApplicableClass) {
        console.log(`❌ Class not found for user_plan_id ${user_plan_id}`)
        await t.rollback()
        return res.status(400).json({
          error: `Class ${class_name} not applicable for user_plan_id ${user_plan_id}`,
        })
      }

      // 2. Parse date and times
      console.log(`Parsing date: "${date}"`)
      const when = new Date(date)
      console.log(
        'Parsed date:',
        when.toISOString(),
        'Valid:',
        !isNaN(when.getTime())
      )

      if (isNaN(when.getTime())) {
        console.log('❌ Invalid date format')
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

      console.log('Day range:', {
        startOfDay: startOfDay.toISOString(),
        nextDay: nextDay.toISOString(),
      })

      // Parse join_time (HH:mm format)
      console.log(`Parsing join_time: "${join_time}"`)
      let parsedJoinTime = null
      if (join_time && typeof join_time === 'string') {
        const [hours, minutes] = join_time.split(':').map(Number)
        console.log(`  Hours: ${hours}, Minutes: ${minutes}`)
        if (!isNaN(hours) && !isNaN(minutes)) {
          parsedJoinTime = new Date(when)
          parsedJoinTime.setHours(hours, minutes, 0, 0)
          console.log(`  ✓ Parsed: ${parsedJoinTime.toISOString()}`)
        }
      }

      // Parse leave_time (HH:mm format)
      console.log(`Parsing leave_time: "${leave_time}"`)
      let parsedLeaveTime = null
      if (leave_time && typeof leave_time === 'string') {
        const [hours, minutes] = leave_time.split(':').map(Number)
        console.log(`  Hours: ${hours}, Minutes: ${minutes}`)
        if (!isNaN(hours) && !isNaN(minutes)) {
          parsedLeaveTime = new Date(when)
          parsedLeaveTime.setHours(hours, minutes, 0, 0)
          console.log(`  ✓ Parsed: ${parsedLeaveTime.toISOString()}`)
        }
      }

      // 3. Lock and fetch UserPlanAttendance
      console.log(
        `Fetching UserPlanAttendance for user_plan_id: ${user_plan_id}`
      )
      let upa = await UserPlanAttendance.findOne({
        where: { user_plan_id },
        transaction: t,
        lock: t.LOCK.UPDATE,
      })

      console.log('UPA result:', upa ? '✓ Found' : '❌ Not found')
      if (upa) {
        console.log('  UPA details:', {
          user_plan_id: upa.user_plan_id,
          classes_attended: upa.classes_attended,
          classes_allowed: upa.classes_allowed,
          status: upa.status,
        })
      }

      if (!upa) {
        console.log(
          `❌ UserPlanAttendance not found for user_plan_id ${user_plan_id}`
        )
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
          console.log(`✓ New UserPlanAttendance created (id=${newUPA.id})`)
        } else {
          console.log(`⊘ UserPlanAttendance already existed (id=${newUPA.id})`)
        }

        upa = newUPA
      }

      // 4. Check if attendance already exists for that user/class on that date
      console.log(
        `Checking existing attendance for user_id=${user_id}, class_id=${userApplicableClass.zoom_class_id}`
      )
      const existing = await ClassAttendance.findOne({
        where: {
          user_id,
          class_id: userApplicableClass.zoom_class_id,
          date: { [Op.gte]: startOfDay, [Op.lt]: nextDay },
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      })

      console.log('Existing attendance:', existing ? '✓ Found' : '✗ Not found')

      if (existing) {
        console.log(`Updating existing attendance record (id=${existing.id})`)
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

        console.log('✓ Attendance record updated')

        created.push({
          attendanceId: existing.id,
          action: 'updated',
          user_id,
          class_id: userApplicableClass.zoom_class_id,
        })
      } else {
        console.log('Creating new attendance record')
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

        console.log(`✓ New attendance record created (id=${newAttendance.id})`)

        // 6. Increment classes_attended in UserPlanAttendance
        console.log(
          `Incrementing classes_attended: ${upa.classes_attended} -> ${(upa.classes_attended || 0) + 1}`
        )
        await UserPlanAttendance.update(
          { classes_attended: (upa.classes_attended || 0) + 1 },
          { where: { user_plan_id }, transaction: t }
        )

        console.log('✓ classes_attended incremented')

        created.push(
          newAttendance.toJSON ? newAttendance.toJSON() : newAttendance
        )
      }

      // 7. Fetch fresh UPA row for response
      console.log('Fetching updated UPA row')
      upa = await UserPlanAttendance.findOne({
        where: { user_plan_id },
        transaction: t,
      })

      console.log('Updated UPA:', {
        user_plan_id: upa.user_plan_id,
        classes_attended: upa.classes_attended,
        classes_allowed: upa.classes_allowed,
      })

      updatedUserPlans.push(upa.toJSON ? upa.toJSON() : upa)
    }

    console.log('\nCommitting transaction...')
    await t.commit()
    console.log('✓ Transaction committed')
    console.log('=== /admin/log-attendance-by-class END (SUCCESS) ===\n')

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

module.exports = router

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

router.get('/admin/get-class-attendance/:class_id', async (req, res) => {
  try {
    console.log('=== /admin/get-class-attendance START ===')
    const { class_id } = req.params

    console.log('class_id:', class_id)

    if (!class_id) {
      console.log('❌ Validation failed - class_id is required')
      return res.status(400).json({ error: 'class_id is required' })
    }

    console.log('✓ Validation passed')

    // Fetch all attendance records for this class
    console.log(`Finding attendance records for class_id: ${class_id}`)
    const attendanceRecords = await ClassAttendance.findAll({
      where: {
        class_id: class_id,
      },
      include: [
        {
          model: require('../models/sql/User').User,
          attributes: ['user_id', 'name', 'email', 'phone', 'username'],
          required: false,
        },
      ],
      order: [
        ['date', 'DESC'],
        ['join_time', 'ASC'],
      ],
      raw: false,
    })

    console.log(`Found ${attendanceRecords.length} attendance records`)
    console.log(
      'Sample attendance:',
      JSON.stringify(attendanceRecords.slice(0, 2), null, 2)
    )

    // Group by date
    const groupedByDate = {}
    attendanceRecords.forEach((record) => {
      const dateKey = new Date(record.date).toISOString().split('T')[0]
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = []
      }
      groupedByDate[dateKey].push({
        user_id: record.user_id,
        user_name: record.User?.name || 'Unknown',
        user_email: record.User?.email || '',
        user_phone: record.User?.phone || '',
        attendance_status: record.attendance_status,
        join_time: record.join_time,
        leave_time: record.leave_time,
        duration_minutes: record.duration_minutes,
        marked_by: record.marked_by,
        device_id: record.device_id,
        created_at: record.created,
        updated_at: record.updated,
      })
    })

    console.log(`Grouped into ${Object.keys(groupedByDate).length} date groups`)
    console.log('=== /admin/get-class-attendance END (SUCCESS) ===\n')

    return res.status(200).json({
      class_id,
      total_records: attendanceRecords.length,
      attendance_by_date: groupedByDate,
      attendance_list: attendanceRecords.map((record) => ({
        user_id: record.user_id,
        user_name: record.User?.name || 'Unknown',
        user_email: record.User?.email || '',
        user_phone: record.User?.phone || '',
        attendance_status: record.attendance_status,
        date: record.date,
        join_time: record.join_time,
        leave_time: record.leave_time,
        duration_minutes: record.duration_minutes,
        marked_by: record.marked_by,
        device_id: record.device_id,
        created_at: record.created,
        updated_at: record.updated,
      })),
    })
  } catch (err) {
    console.error('=== /admin/get-class-attendance ERROR ===')
    console.error('Error message:', err.message)
    console.error('Error stack:', err.stack)
    console.error('Full error:', err)
    console.error('=== /admin/get-class-attendance END (FAILED) ===\n')
    return res.status(500).json({ error: 'Failed to fetch class attendance' })
  }
})

// Endpoint to view attendance by user
router.get('/admin/get-user-attendance/:user_id', async (req, res) => {
  try {
    console.log('=== /admin/get-user-attendance START ===')
    const { user_id } = req.params

    console.log('user_id:', user_id)

    if (!user_id) {
      console.log('❌ Validation failed - user_id is required')
      return res.status(400).json({ error: 'user_id is required' })
    }

    console.log('✓ Validation passed')

    // Fetch all attendance records for this user
    console.log(`Finding attendance records for user_id: ${user_id}`)
    const attendanceRecords = await ClassAttendance.findAll({
      where: {
        user_id: user_id,
      },
      include: [
        {
          model: ZoomClassModel,
          attributes: [
            'zoom_class_id',
            'zoom_class_name',
            'class_type',
            'recurring_start_time',
            'recurring_end_time',
          ],
          required: false,
        },
        {
          model: Plan,
          attributes: ['plan_id', 'plan_name', 'number_of_zoom_classes'],
          required: false,
        },
      ],
      order: [['date', 'DESC']],
      raw: false,
    })

    console.log(`Found ${attendanceRecords.length} attendance records for user`)
    console.log(
      'Sample attendance:',
      JSON.stringify(attendanceRecords.slice(0, 2), null, 2)
    )

    // Group by month
    const groupedByMonth = {}
    attendanceRecords.forEach((record) => {
      const date = new Date(record.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!groupedByMonth[monthKey]) {
        groupedByMonth[monthKey] = []
      }

      groupedByMonth[monthKey].push({
        attendance_id: record.id,
        class_id: record.class_id,
        class_name: record.ZoomClass?.zoom_class_name || 'Unknown',
        class_type: record.ZoomClass?.class_type || '',
        class_time: record.ZoomClass?.recurring_start_time || '',
        plan_name: record.Plan?.plan_name || 'Unknown',
        date: record.date,
        attendance_status: record.attendance_status,
        join_time: record.join_time,
        leave_time: record.leave_time,
        duration_minutes: record.duration_minutes,
        marked_by: record.marked_by,
        device_id: record.device_id,
        remarks: record.remarks,
        created_at: record.created,
        updated_at: record.updated,
      })
    })

    console.log(
      `Grouped into ${Object.keys(groupedByMonth).length} month groups`
    )
    console.log('=== /admin/get-user-attendance END (SUCCESS) ===\n')

    return res.status(200).json({
      user_id,
      total_records: attendanceRecords.length,
      attendance_by_month: groupedByMonth,
      attendance_list: attendanceRecords.map((record) => ({
        attendance_id: record.id,
        class_id: record.class_id,
        class_name: record.ZoomClass?.zoom_class_name || 'Unknown',
        class_type: record.ZoomClass?.class_type || '',
        class_time: record.ZoomClass?.recurring_start_time || '',
        plan_name: record.Plan?.plan_name || 'Unknown',
        date: record.date,
        attendance_status: record.attendance_status,
        join_time: record.join_time,
        leave_time: record.leave_time,
        duration_minutes: record.duration_minutes,
        marked_by: record.marked_by,
        device_id: record.device_id,
        remarks: record.remarks,
        created_at: record.created,
        updated_at: record.updated,
      })),
    })
  } catch (err) {
    console.error('=== /admin/get-user-attendance ERROR ===')
    console.error('Error message:', err.message)
    console.error('Error stack:', err.stack)
    console.error('Full error:', err)
    console.error('=== /admin/get-user-attendance END (FAILED) ===\n')
    return res.status(500).json({ error: 'Failed to fetch user attendance' })
  }
})

// Endpoint to view attendance by class for each day
router.get('/admin/get-class-attendance-by-day/:class_id', async (req, res) => {
  try {
    console.log('=== /admin/get-class-attendance-by-day START ===')
    const { class_id } = req.params

    console.log('class_id:', class_id)

    if (!class_id) {
      console.log('❌ Validation failed - class_id is required')
      return res.status(400).json({ error: 'class_id is required' })
    }

    console.log('✓ Validation passed')

    // Fetch class details
    console.log(`Finding class: ${class_id}`)
    const yogaClass = await ZoomClassModel.findByPk(class_id)

    if (!yogaClass) {
      console.log('❌ Class not found')
      return res.status(404).json({ error: 'Class not found' })
    }

    console.log('✓ Class found:', {
      zoom_class_id: yogaClass.zoom_class_id,
      zoom_class_name: yogaClass.zoom_class_name,
      class_type: yogaClass.class_type,
    })

    // Fetch all attendance records for this class
    console.log(`Finding attendance records for class_id: ${class_id}`)
    const attendanceRecords = await ClassAttendance.findAll({
      where: {
        class_id: class_id,
      },
      include: [
        {
          model: require('../models/sql/User').User,
          attributes: ['user_id', 'name', 'email', 'phone', 'username'],
          required: false,
        },
      ],
      order: [
        ['date', 'DESC'],
        ['join_time', 'ASC'],
      ],
      raw: false,
    })

    console.log(`Found ${attendanceRecords.length} total attendance records`)

    // Group by date
    const groupedByDate = {}
    let totalAttended = 0
    let totalAbsent = 0

    attendanceRecords.forEach((record) => {
      const dateKey = new Date(record.date).toISOString().split('T')[0]

      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {
          date: dateKey,
          attended: [],
          absent: [],
          total_attended: 0,
          total_absent: 0,
        }
      }

      const attendanceData = {
        attendance_id: record.id,
        user_id: record.user_id,
        user_name: record.User?.name || 'Unknown',
        user_email: record.User?.email || '',
        user_phone: record.User?.phone || '',
        user_username: record.User?.username || '',
        attendance_status: record.attendance_status,
        join_time: record.join_time,
        leave_time: record.leave_time,
        duration_minutes: record.duration_minutes,
        marked_by: record.marked_by,
        device_id: record.device_id,
        remarks: record.remarks,
        created_at: record.created,
        updated_at: record.updated,
      }

      if (record.attendance_status === 'ATTENDED') {
        groupedByDate[dateKey].attended.push(attendanceData)
        groupedByDate[dateKey].total_attended += 1
        totalAttended += 1
      } else {
        groupedByDate[dateKey].absent.push(attendanceData)
        groupedByDate[dateKey].total_absent += 1
        totalAbsent += 1
      }
    })

    // Convert to array and sort by date descending
    const attendanceByDay = Object.values(groupedByDate).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    )

    console.log(`Grouped into ${attendanceByDay.length} date groups`)
    console.log('=== /admin/get-class-attendance-by-day END (SUCCESS) ===\n')

    return res.status(200).json({
      class_id,
      class_name: yogaClass.zoom_class_name,
      class_type: yogaClass.class_type,
      total_records: attendanceRecords.length,
      total_attended: totalAttended,
      total_absent: totalAbsent,
      attendance_by_day: attendanceByDay,
    })
  } catch (err) {
    console.error('=== /admin/get-class-attendance-by-day ERROR ===')
    console.error('Error message:', err.message)
    console.error('Error stack:', err.stack)
    console.error('Full error:', err)
    console.error('=== /admin/get-class-attendance-by-day END (FAILED) ===\n')
    return res
      .status(500)
      .json({ error: 'Failed to fetch class attendance by day' })
  }
})

module.exports = router

const express = require('express')
const axios = require('axios')
const { ZoomClassModel } = require('../models/sql/ZoomClassModel')
const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_NOT_FOUND,
} = require('../utils/http_status_codes')
const { Op } = require('sequelize')
const router = express.Router()
const moment = require('moment-timezone')

const getZoomAccessToken = async () => {
  try {
    const tokenResponse = await axios.post(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
      {},
      {
        auth: {
          username: process.env.ZOOM_CLIENT_ID,
          password: process.env.ZOOM_CLIENT_SECRET,
        },
      }
    )
    return tokenResponse.data.access_token
  } catch (err) {
    console.error(
      'Error fetching Zoom access token:',
      err.response?.data || err
    )
    throw new Error('Unable to authenticate with Zoom')
  }
}

const createZoomMeeting = async (topic, startTime, isRecurring = false) => {
  const accessToken = await getZoomAccessToken()
  try {
    const meetingData = {
      topic,
      type: isRecurring ? 3 : 2, // type 2 = scheduled, type 3 = recurring
      timezone: 'Asia/Kolkata',
      pre_schedule: true, // Enable pre-scheduling
      settings: {
        host_video: true,
        participant_video: true,
        waiting_room: false,
        join_before_host: true, // Allow participants to join before host starts meeting
        auto_recording: 'cloud', // Optional: auto-record meetings
      },
    }

    // Only add start_time and duration for one-time classes
    if (!isRecurring && startTime) {
      // Subtract 5 minutes for early access
      const meetingStartTime = new Date(
        new Date(startTime).getTime() - 5 * 60000
      )
      meetingData.start_time = meetingStartTime.toISOString()
      meetingData.duration = 65 // Add 5 minutes to duration
    }

    const res = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      meetingData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )
    //console.log(res)
    return {
      joinUrl: res.data.join_url, // already contains ?pwd=...
      meetingId: res.data.id,
      password: res.data.password,
      encryptedPassword: res.data.encrypted_password,
    }
  } catch (err) {
    console.error('Error creating Zoom meeting:', err.response?.data || err)
    throw new Error('Zoom meeting creation failed')
  }
}

router.get('/health', async (req, res) => {
  return res.status(HTTP_OK).json({ message: 'Zoom Route is healthy' })
})

router.post('/api/classes', async (req, res) => {
  try {
    const {
      zoom_class_name,
      plan_id,
      institute_id,
      teacher_id,
      class_type,
      start_time,
      end_time,
      recurring_days,
      recurring_start_time,
      recurring_end_time,
    } = req.body

    if (
      !zoom_class_name ||
      !class_type ||
      !Array.isArray(plan_id) ||
      plan_id.length === 0 ||
      !institute_id ||
      !Array.isArray(teacher_id) ||
      teacher_id.length === 0
    ) {
      return res.status(HTTP_BAD_REQUEST).json({
        error:
          'Missing required fields: zoom_class_name, plan_id[], institute_id, teacher_id[]',
      })
    }

    // Handle one-time class
    if (class_type === 'one_time') {
      // Check for time conflicts for each teacher
      const conflictingTeachers = []
      for (const tId of teacher_id) {
        const conflict = await ZoomClassModel.findOne({
          where: {
            teacher_id: tId,
            start_time: { [Op.lt]: end_time },
            end_time: { [Op.gt]: start_time },
          },
        })
        if (conflict) {
          conflictingTeachers.push(tId)
        }
      }

      if (conflictingTeachers.length > 0) {
        return res.status(HTTP_BAD_REQUEST).json({
          error: `Time conflict: One or more selected teachers already have a class scheduled during this time.`,
          conflictingTeachers,
        })
      }

      // No conflicts, create classes for each teacher
      const createdClasses = []
      for (const tId of teacher_id) {
        const meeting = await createZoomMeeting(zoom_class_name, start_time)

        for (const pId of plan_id) {
          const iId = institute_id
          const existingClass = await ZoomClassModel.findOne({
            where: {
              teacher_id: tId,
              plan_id: pId,
              institute_id: iId,
              start_time: start_time,
              end_time: end_time,
            },
          })
          if (existingClass) {
            continue
          }

          const newClass = await ZoomClassModel.create({
            zoom_class_name: zoom_class_name,
            plan_id: pId,
            institute_id: iId,
            teacher_id: tId,
            start_time: start_time,
            end_time: end_time,
            zoom_url: meeting.joinUrl,
            zoom_meeting_id: meeting.meetingId,
            zoom_meeting_password: meeting.password,
            class_type: 'one_time',
          })

          createdClasses.push(newClass)
        }
      }

      if (createdClasses.length === 0) {
        return res.status(HTTP_BAD_REQUEST).json({
          error: 'Class already exists for this time for all combinations',
        })
      }

      return res.status(200).json(createdClasses)
    }

    // Handle recurring class
    if (class_type === 'recurring') {
      // Validate recurring fields
      if (
        !Array.isArray(recurring_days) ||
        recurring_days.length === 0 ||
        !recurring_start_time ||
        !recurring_end_time
      ) {
        return res.status(HTTP_BAD_REQUEST).json({
          error:
            'Missing recurring class fields: recurring_days, recurring_start_time, recurring_end_time',
        })
      }

      // For each teacher, check for conflicts on any of the selected days and time range
      const conflictingTeachers = []
      for (const tId of teacher_id) {
        // Find any class for this teacher that overlaps on any recurring day and time
        const conflicts = await ZoomClassModel.findOne({
          where: {
            teacher_id: tId,
            class_type: 'recurring',
            recurring_days: { [Op.overlap]: recurring_days },
            recurring_start_time: { [Op.lt]: recurring_end_time },
            recurring_end_time: { [Op.gt]: recurring_start_time },
          },
        })
        if (conflicts) {
          conflictingTeachers.push(tId)
        }
      }

      if (conflictingTeachers.length > 0) {
        return res.status(HTTP_BAD_REQUEST).json({
          error: `Time conflict: One or more selected teachers already have a recurring class scheduled during this time.`,
          conflictingTeachers,
        })
      }

      // No conflicts, create recurring classes for each teacher
      const createdClasses = []
      for (const tId of teacher_id) {
        // Create a unique Zoom meeting for this teacher's recurring slot
        const meeting = await createZoomMeeting(zoom_class_name, null) // No specific start_time for recurring
        //console.log(meeting)
        for (const pId of plan_id) {
          const iId = institute_id
          // Check if recurring class already exists for this teacher/plan/institute/days/time
          const existingClass = await ZoomClassModel.findOne({
            where: {
              teacher_id: tId,
              plan_id: pId,
              institute_id: iId,
              class_type: 'recurring',
              recurring_days: { [Op.overlap]: recurring_days },
              recurring_start_time: recurring_start_time,
              recurring_end_time: recurring_end_time,
            },
          })
          if (existingClass) {
            continue
          }

          const newClass = await ZoomClassModel.create({
            zoom_class_name: zoom_class_name,
            plan_id: pId,
            institute_id: iId,
            teacher_id: tId,
            class_type: 'recurring',
            recurring_days,
            recurring_start_time,
            recurring_end_time,
            zoom_url: meeting.joinUrl,
            zoom_meeting_id: meeting.meetingId,
            zoom_meeting_password: meeting.password,
          })

          createdClasses.push(newClass)
        }
      }

      if (createdClasses.length === 0) {
        return res.status(HTTP_BAD_REQUEST).json({
          error:
            'Recurring class already exists for this time for all combinations',
        })
      }

      return res.status(200).json(createdClasses)
    }

    // If class_type is not recognized
    return res.status(HTTP_BAD_REQUEST).json({
      error: 'Invalid class_type. Must be "one_time" or "recurring".',
    })
  } catch (error) {
    console.error(error)
    res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: error.message || 'Failed to create Zoom meeting' })
  }
})

router.get('/api/classes', async (req, res) => {
  try {
    const classes = await ZoomClassModel.findAll()
    res.status(HTTP_OK).json(classes)
  } catch (err) {
    console.error(err)
    res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to fetch classes' })
  }
})

router.get('/api/classes/today', async (req, res) => {
  try {
    const { teacher_id, plan_id, timezone } = req.query
    const userTZ = timezone || 'Asia/Kolkata'

    const nowIST = moment.tz('Asia/Kolkata')
    const startOfDayIST = nowIST.clone().startOf('day')
    const endOfDayIST = nowIST.clone().endOf('day')
    const todayDayNum = nowIST.day()

    let whereClause = {}
    if (teacher_id) whereClause.teacher_id = teacher_id
    if (plan_id) whereClause.plan_id = plan_id

    const oneTimeClause = {
      ...whereClause,
      class_type: 'one_time',
      start_time: {
        [Op.gte]: startOfDayIST.toDate(),
        [Op.lte]: endOfDayIST.toDate(),
      },
    }

    const recurringClause = {
      ...whereClause,
      class_type: 'recurring',
      recurring_days: { [Op.contains]: [todayDayNum] },
    }

    const classes = await ZoomClassModel.findAll({
      where: { [Op.or]: [oneTimeClause, recurringClause] },
    })

    // Convert times to user timezone before returning
    const result = classes.map((cls) => {
      let startTime, endTime

      if (cls.class_type === 'one_time') {
        startTime = moment(cls.start_time)
          .tz('Asia/Kolkata')
          .tz(userTZ)
          .format()
        endTime = moment(cls.end_time).tz('Asia/Kolkata').tz(userTZ).format()
      } else {
        // recurring => stored as HH:mm in IST
        startTime = moment
          .tz(cls.recurring_start_time, 'HH:mm', 'Asia/Kolkata')
          .tz(userTZ)
          .format()
        endTime = moment
          .tz(cls.recurring_end_time, 'HH:mm', 'Asia/Kolkata')
          .tz(userTZ)
          .format()
      }

      return {
        ...cls.toJSON(),
        local_start_time: startTime,
        local_end_time: endTime,
      }
    })

    res.status(200).json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to fetch today's classes" })
  }
})

router.get('/admin/classes/today', async (req, res) => {
  try {
    // Use Asia/Kolkata timezone consistently
    const today = moment.tz('Asia/Kolkata')
    const dayOfWeek = today.day() // 0 = Sunday, 6 = Saturday

    const allClasses = await ZoomClassModel.findAll({
      where: {
        deletedAt: null,
      },
      raw: true,
    })

    // Filter classes scheduled for today
    const todayClasses = allClasses.filter((cls) => {
      if (cls.class_type === 'one_time') {
        // Convert start_time to Asia/Kolkata and compare dates
        const classDate = moment.tz(cls.start_time, 'Asia/Kolkata')
        return classDate.format('YYYY-MM-DD') === today.format('YYYY-MM-DD')
      }

      // recurring class
      if (cls.class_type === 'recurring') {
        let days = cls.recurring_days
        if (typeof days === 'string') {
          // Handle both array string and JSON string formats
          days = days.startsWith('[')
            ? JSON.parse(days)
            : days.split(',').map(Number)
        }
        return Array.isArray(days) && days.includes(dayOfWeek)
      }

      return false
    })

    // Remove duplicates by zoom_url
    const distinctMap = new Map()
    todayClasses.forEach((cls) => {
      if (!distinctMap.has(cls.zoom_url)) {
        distinctMap.set(cls.zoom_url, cls)
      }
    })

    const distinctClasses = Array.from(distinctMap.values())

    // Sort by time (using Asia/Kolkata timezone)
    distinctClasses.sort((a, b) => {
      let aTime, bTime

      if (a.class_type === 'one_time' && a.start_time) {
        aTime = moment.tz(a.start_time, 'Asia/Kolkata')
      } else if (a.class_type === 'recurring' && a.recurring_start_time) {
        aTime = moment.tz(
          `1970-01-01T${a.recurring_start_time}`,
          'Asia/Kolkata'
        )
      } else {
        aTime = moment.tz('1970-01-01T00:00:00', 'Asia/Kolkata')
      }

      if (b.class_type === 'one_time' && b.start_time) {
        bTime = moment.tz(b.start_time, 'Asia/Kolkata')
      } else if (b.class_type === 'recurring' && b.recurring_start_time) {
        bTime = moment.tz(
          `1970-01-01T${b.recurring_start_time}`,
          'Asia/Kolkata'
        )
      } else {
        bTime = moment.tz('1970-01-01T00:00:00', 'Asia/Kolkata')
      }

      return aTime.diff(bTime)
    })

    res.status(200).json(distinctClasses)
  } catch (err) {
    console.error('Error fetching today classes:', err)
    res.status(500).json({ error: err.message || 'Failed to fetch classes' })
  }
})

router.get('/api/classes/:id', async (req, res) => {
  try {
    const classItem = await ZoomClassModel.findByPk(req.params.id)
    if (!classItem) {
      return res.status(HTTP_NOT_FOUND).json({ error: 'Class not found' })
    }
    res.status(HTTP_OK).json(classItem)
  } catch (err) {
    console.error(err)
    res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Error fetching class details' })
  }
})

router.put('/api/classes/:id', async (req, res) => {
  try {
    const {
      zoom_class_name,
      recurring_start_time,
      recurring_end_time,
      recurring_days,
    } = req.body
    const classItem = await ZoomClassModel.findByPk(req.params.id)

    if (!classItem) {
      return res.status(HTTP_NOT_FOUND).json({ error: 'Class not found' })
    }

    // If it's a one-time class with new start/end times, update Zoom meeting
    if (
      classItem.class_type === 'one_time' &&
      req.body.start_time &&
      req.body.end_time
    ) {
      const accessToken = await getZoomAccessToken()
      await axios.patch(
        `https://api.zoom.us/v2/meetings/${classItem.zoom_meeting_id}`,
        {
          topic: zoom_class_name || classItem.zoom_class_name,
          start_time: new Date(req.body.start_time).toISOString(),
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
    }

    // Update class record
    const updateData = {
      zoom_class_name: zoom_class_name || classItem.zoom_class_name,
    }

    if (classItem.class_type === 'one_time') {
      updateData.start_time = req.body.start_time || classItem.start_time
      updateData.end_time = req.body.end_time || classItem.end_time
    } else if (classItem.class_type === 'recurring') {
      updateData.recurring_start_time =
        recurring_start_time || classItem.recurring_start_time
      updateData.recurring_end_time =
        recurring_end_time || classItem.recurring_end_time
      updateData.recurring_days = recurring_days || classItem.recurring_days
    }

    await classItem.update(updateData)

    res.status(HTTP_OK).json({
      message: 'Class updated successfully',
      class: classItem,
    })
  } catch (err) {
    console.error('Error updating class:', err)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: err.message || 'Failed to update class',
    })
  }
})

router.delete('/api/classes/:id', async (req, res) => {
  try {
    const classItem = await ZoomClassModel.findByPk(req.params.id)

    if (!classItem) {
      return res.status(HTTP_NOT_FOUND).json({ error: 'Class not found' })
    }

    // Delete Zoom meeting
    try {
      const accessToken = await getZoomAccessToken()
      await axios.delete(
        `https://api.zoom.us/v2/meetings/${classItem.zoom_meeting_id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
    } catch (zoomErr) {
      console.warn(
        'Zoom meeting not found or already deleted:',
        zoomErr.response?.data || zoomErr
      )
    }

    // Delete from database
    await classItem.destroy()

    res.status(HTTP_OK).json({
      message: 'Class deleted successfully',
    })
  } catch (err) {
    console.error('Error deleting class:', err)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: err.message || 'Failed to delete class',
    })
  }
})

module.exports = router

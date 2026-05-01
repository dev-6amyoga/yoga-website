const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const { Op } = require('sequelize')
const { sequelize } = require('../../init.sequelize')
const Class = require('../../models/mongo/Class')
const { ClassAttendance } = require('../../models/sql/ClassAttendance')
const { User } = require('../../models/sql/User')
const moment = require('moment-timezone')

const {
  HTTP_OK,
  HTTP_BAD_REQUEST,
  HTTP_NOT_FOUND,
  HTTP_INTERNAL_SERVER_ERROR,
} = require('../../utils/http_status_codes')

/**
 * GET /api/teacher/classes
 * Get all classes for the logged-in teacher
 */
router.get('/', async (req, res) => {
  try {
    const teacherId = req.user.user_id

    // Get classes from MongoDB
    const classes = await Class.find({ teacher_id: teacherId }).sort({
      createdAt: -1,
    })

    return res.status(HTTP_OK).json({
      status: 'success',
      data: classes || [],
    })
  } catch (error) {
    console.error('Error fetching classes:', error)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
      code: 'SERVER_ERROR',
    })
  }
})

/**
 * POST /api/teacher/classes
 * Create a new class
 */
router.post('/', async (req, res) => {
  try {
    const teacherId = req.user.user_id
    const {
      name,
      description,
      schedule,
      type,
      recurringDays,
      startTime,
      endTime,
      maxStudents,
    } = req.body

    // Validate required fields
    if (!name || !description || !type) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: 'error',
        message: 'Missing required fields: name, description, type',
        code: 'VALIDATION_ERROR',
      })
    }

    const newClass = new Class({
      class_name: name,
      class_desc: description,
      teacher_id: teacherId,
      class_type: type,
      schedule: schedule,
      recurrance_days: recurringDays || [],
      recurring_class_start_time: startTime,
      recurring_class_end_time: endTime,
      max_students: maxStudents || 30,
      allowed_students: [],
    })

    const savedClass = await newClass.save()

    return res.status(HTTP_OK).json({
      status: 'success',
      message: 'Class created successfully',
      data: savedClass,
    })
  } catch (error) {
    console.error('Error creating class:', error)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
      code: 'SERVER_ERROR',
    })
  }
})

/**
 * GET /api/teacher/classes/:classId
 * Get single class details
 */
router.get('/:classId', async (req, res) => {
  try {
    const { classId } = req.params
    const teacherId = req.user.user_id

    // Validate classId is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: 'error',
        message: 'Invalid class ID format',
        code: 'VALIDATION_ERROR',
      })
    }

    const classData = await Class.findOne({
      _id: classId,
      teacher_id: teacherId,
    })

    if (!classData) {
      return res.status(HTTP_NOT_FOUND).json({
        status: 'error',
        message: 'Class not found',
        code: 'NOT_FOUND',
      })
    }

    return res.status(HTTP_OK).json({
      status: 'success',
      data: classData,
    })
  } catch (error) {
    console.error('Error fetching class:', error)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
      code: 'SERVER_ERROR',
    })
  }
})

/**
 * POST /api/teacher/classes/:classId/join
 * Join a class (for teacher streaming)
 */
router.post('/:classId/join', async (req, res) => {
  try {
    const { classId } = req.params
    const userId = req.user.user_id

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: 'error',
        message: 'Invalid class ID format',
        code: 'VALIDATION_ERROR',
      })
    }

    const classData = await Class.findById(classId)

    if (!classData) {
      return res.status(HTTP_NOT_FOUND).json({
        status: 'error',
        message: 'Class not found',
        code: 'NOT_FOUND',
      })
    }

    // Check if user is the teacher
    if (classData.teacher_id.toString() !== userId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden - You are not the teacher of this class',
        code: 'FORBIDDEN',
      })
    }

    return res.status(HTTP_OK).json({
      status: 'success',
      message: 'Joined class successfully',
      data: {
        classId,
        joinedAt: new Date(),
        className: classData.class_name,
      },
    })
  } catch (error) {
    console.error('Error joining class:', error)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
      code: 'SERVER_ERROR',
    })
  }
})

/**
 * POST /api/teacher/classes/:classId/attendance/log
 * Log attendance for students in a class
 */
router.post('/:classId/attendance/log', async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    const { classId } = req.params
    const { studentIds, status, timestamp } = req.body
    const teacherId = req.user.user_id

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: 'error',
        message: 'Missing or invalid studentIds array',
        code: 'VALIDATION_ERROR',
      })
    }

    if (!status) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: 'error',
        message: 'Missing attendance status',
        code: 'VALIDATION_ERROR',
      })
    }

    const attendanceRecords = []

    for (const studentId of studentIds) {
      const record = await ClassAttendance.create(
        {
          class_id: classId.toString(),
          user_id: studentId,
          instructor_id: teacherId,
          attendance_status: status.toUpperCase(),
          marked_by: 'INSTRUCTOR',
          marked_at: timestamp ? new Date(timestamp) : new Date(),
        },
        { transaction }
      )
      attendanceRecords.push(record)
    }

    await transaction.commit()

    return res.status(HTTP_OK).json({
      status: 'success',
      message: `Attendance logged for ${studentIds.length} student(s)`,
      data: {
        attendanceRecords,
        count: studentIds.length,
      },
    })
  } catch (error) {
    await transaction.rollback()
    console.error('Error logging attendance:', error)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
      code: 'SERVER_ERROR',
    })
  }
})

/**
 * GET /api/teacher/classes/:classId/attendance/logs
 * Get attendance logs for a class
 */
router.get('/:classId/attendance/logs', async (req, res) => {
  try {
    const { classId } = req.params
    const { page = 1, limit = 20 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    const logs = await ClassAttendance.findAndCountAll({
      where: { class_id: classId.toString() },
      include: [
        {
          model: User,
          attributes: ['user_id', 'name', 'email'],
          as: 'student',
        },
      ],
      limit: parseInt(limit),
      offset,
      order: [['marked_at', 'DESC']],
      distinct: true,
    })

    return res.status(HTTP_OK).json({
      status: 'success',
      data: {
        logs: logs.rows.map((log) => ({
          id: log.class_attendance_id,
          date: moment(log.marked_at).format('YYYY-MM-DD'),
          studentId: log.user_id,
          studentName: log.student?.name || 'Unknown',
          studentEmail: log.student?.email || 'Unknown',
          status: log.attendance_status,
          markedBy: log.marked_by,
          markedAt: log.marked_at,
        })),
        pagination: {
          total: logs.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(logs.count / parseInt(limit)),
        },
      },
    })
  } catch (error) {
    console.error('Error fetching attendance logs:', error)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
      code: 'SERVER_ERROR',
    })
  }
})

/**
 * GET /api/teacher/classes/:classId/members
 * Get member details for a class
 */
router.get('/:classId/members', async (req, res) => {
  try {
    const { classId } = req.params

    // Get unique students with attendance in this class
    const members = await ClassAttendance.findAll({
      where: { class_id: classId.toString() },
      attributes: ['user_id', 'class_attendance_id'],
      include: [
        {
          model: User,
          attributes: ['user_id', 'name', 'email', 'phone', 'created_at'],
          as: 'student',
          required: true,
        },
      ],
      raw: false,
      subQuery: false,
    })

    // Group by user_id to get unique members
    const uniqueMembers = {}
    members.forEach((m) => {
      if (!uniqueMembers[m.user_id]) {
        uniqueMembers[m.user_id] = {
          id: m.user_id,
          name: m.student.name,
          email: m.student.email,
          phone: m.student.phone || 'N/A',
          joinDate: moment(m.student.created_at).format('YYYY-MM-DD'),
          classesAttended: 0,
          status: 'active',
        }
      }
      uniqueMembers[m.user_id].classesAttended += 1
    })

    const membersList = Object.values(uniqueMembers)

    return res.status(HTTP_OK).json({
      status: 'success',
      data: {
        members: membersList,
        totalMembers: membersList.length,
      },
    })
  } catch (error) {
    console.error('Error fetching class members:', error)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
      code: 'SERVER_ERROR',
    })
  }
})

module.exports = router

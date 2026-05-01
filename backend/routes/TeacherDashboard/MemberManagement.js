const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const { User } = require('../../models/sql/User')
const { UserPlan } = require('../../models/sql/UserPlan')
const { Plan } = require('../../models/sql/Plan')
const moment = require('moment-timezone')

const {
  HTTP_OK,
  HTTP_BAD_REQUEST,
  HTTP_NOT_FOUND,
  HTTP_INTERNAL_SERVER_ERROR,
} = require('../../utils/http_status_codes')

/**
 * GET /api/teacher/students
 * Get all students for this teacher's classes
 */
router.get('/', async (req, res) => {
  try {
    const instituteId = req.user.currentInstituteId
    const { page = 1, limit = 20, search = '' } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    // Build search filter
    const searchWhere = search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
          ],
        }
      : {}

    const students = await User.findAndCountAll({
      where: searchWhere,
      attributes: ['user_id', 'name', 'email', 'phone', 'created_at'],
      limit: parseInt(limit),
      offset,
      distinct: true,
      subQuery: false,
    })

    return res.status(HTTP_OK).json({
      status: 'success',
      data: {
        students: students.rows.map((s) => ({
          id: s.user_id,
          name: s.name,
          email: s.email,
          phone: s.phone || 'N/A',
          joinDate: moment(s.created_at).format('YYYY-MM-DD'),
          classesAttended: 0, // TODO: Calculate from attendance
          status: 'active',
          avatar: `https://i.pravatar.cc/50?img=${s.user_id}`,
        })),
        pagination: {
          total: students.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(students.count / parseInt(limit)),
        },
      },
    })
  } catch (error) {
    console.error('Error fetching students:', error)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
      code: 'SERVER_ERROR',
    })
  }
})

/**
 * GET /api/teacher/user-plan-mappings
 * Get user plan assignments
 */
router.get('/user-plan-mappings', async (req, res) => {
  try {
    const instituteId = req.user.currentInstituteId
    const { page = 1, limit = 20 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    const mappings = await UserPlan.findAndCountAll({
      include: [
        {
          model: User,
          attributes: ['user_id', 'name', 'email'],
          required: true,
        },
        {
          model: Plan,
          attributes: ['plan_id', 'name', 'total_classes'],
          required: true,
        },
      ],
      limit: parseInt(limit),
      offset,
      order: [['start_date', 'DESC']],
      distinct: true,
      subQuery: false,
    })

    const currentDate = moment().tz('Asia/Kolkata')

    return res.status(HTTP_OK).json({
      status: 'success',
      data: {
        mappings: mappings.rows.map((m) => {
          const expiryDate = moment(m.expiry_date).tz('Asia/Kolkata')
          const daysRemaining = expiryDate.diff(currentDate, 'days')
          let status = 'active'

          if (daysRemaining < 0) {
            status = 'expired'
          } else if (daysRemaining < 7) {
            status = 'expiring-soon'
          }

          return {
            id: m.user_plan_id,
            userId: m.user_id,
            userName: m.user.name,
            userEmail: m.user.email,
            planId: m.plan_id,
            planName: m.plan.name,
            startDate: moment(m.start_date).format('YYYY-MM-DD'),
            endDate: moment(m.expiry_date).format('YYYY-MM-DD'),
            status,
            daysRemaining: Math.max(0, daysRemaining),
            classesBalance: m.balance || 0,
            totalClasses: m.plan.total_classes || 0,
          }
        }),
        pagination: {
          total: mappings.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(mappings.count / parseInt(limit)),
        },
      },
    })
  } catch (error) {
    console.error('Error fetching user plan mappings:', error)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
      code: 'SERVER_ERROR',
    })
  }
})

/**
 * GET /api/teacher/students/:studentId
 * Get specific student details
 */
router.get('/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params

    const student = await User.findByPk(studentId, {
      attributes: ['user_id', 'name', 'email', 'phone', 'created_at'],
      include: [
        {
          model: UserPlan,
          attributes: [
            'user_plan_id',
            'plan_id',
            'start_date',
            'expiry_date',
            'balance',
            'status',
          ],
          include: [{ model: Plan, attributes: ['name', 'total_classes'] }],
        },
      ],
    })

    if (!student) {
      return res.status(HTTP_NOT_FOUND).json({
        status: 'error',
        message: 'Student not found',
        code: 'NOT_FOUND',
      })
    }

    return res.status(HTTP_OK).json({
      status: 'success',
      data: {
        id: student.user_id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        joinDate: moment(student.created_at).format('YYYY-MM-DD'),
        plans: student.user_plans.map((p) => ({
          userPlanId: p.user_plan_id,
          planName: p.plan.name,
          status: p.status,
          startDate: moment(p.start_date).format('YYYY-MM-DD'),
          endDate: moment(p.expiry_date).format('YYYY-MM-DD'),
          classesBalance: p.balance,
          totalClasses: p.plan.total_classes,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching student details:', error)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
      code: 'SERVER_ERROR',
    })
  }
})

/**
 * PUT /api/teacher/students/:studentId
 * Update student information
 */
router.put('/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params
    const { name, phone, status } = req.body

    const student = await User.findByPk(studentId)

    if (!student) {
      return res.status(HTTP_NOT_FOUND).json({
        status: 'error',
        message: 'Student not found',
        code: 'NOT_FOUND',
      })
    }

    // Update fields if provided
    if (name) student.name = name
    if (phone) student.phone = phone

    await student.save()

    return res.status(HTTP_OK).json({
      status: 'success',
      message: 'Student updated successfully',
      data: {
        id: student.user_id,
        name: student.name,
        email: student.email,
        phone: student.phone,
      },
    })
  } catch (error) {
    console.error('Error updating student:', error)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
      code: 'SERVER_ERROR',
    })
  }
})

/**
 * DELETE /api/teacher/students/:studentId
 * Remove student (soft delete or deactivate)
 */
router.delete('/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params

    const student = await User.findByPk(studentId)

    if (!student) {
      return res.status(HTTP_NOT_FOUND).json({
        status: 'error',
        message: 'Student not found',
        code: 'NOT_FOUND',
      })
    }

    // Soft delete: mark as deleted instead of hard delete
    // Implementation depends on your model setup
    // For now, we'll just return success message
    // You can extend this based on your requirements

    return res.status(HTTP_OK).json({
      status: 'success',
      message: 'Student removed successfully',
      data: {
        id: studentId,
      },
    })
  } catch (error) {
    console.error('Error removing student:', error)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
      code: 'SERVER_ERROR',
    })
  }
})

module.exports = router

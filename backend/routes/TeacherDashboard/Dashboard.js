const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const { ClassAttendance } = require('../../models/sql/ClassAttendance')
const { Transaction } = require('../../models/sql/Transaction')
const { User } = require('../../models/sql/User')
const moment = require('moment-timezone')
const Class = require('../../models/mongo/Class')

const {
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require('../../utils/http_status_codes')

/**
 * GET /api/teacher/dashboard/stats
 * Get dashboard statistics for the teacher
 */
router.get('/stats', async (req, res) => {
  try {
    const teacherId = req.user.user_id
    const instituteId = req.user.currentInstituteId
    const today = moment().tz('Asia/Kolkata').startOf('day')
    const monthStart = today.clone().startOf('month')

    // Get classes count
    const classes = await Class.find({ teacher_id: teacherId })
    const classesCount = classes.length
    const activeClassesCount = classes.filter(
      (c) => c.status !== 'archived' && c.status !== 'completed'
    ).length

    // Get unique students from attendance
    const attendance = await ClassAttendance.findAll({
      where: { instructor_id: teacherId },
      attributes: ['user_id'],
      raw: true,
    })

    const uniqueStudentIds = [...new Set(attendance.map((a) => a.user_id))]
    const studentsCount = uniqueStudentIds.length

    // Get transactions
    const allTransactions = await Transaction.findAll({
      where: {},
      attributes: ['id', 'amount', 'status', 'created_at'],
    })

    const completedTransactions = allTransactions.filter(
      (t) => t.status === 'completed'
    )
    const pendingTransactions = allTransactions.filter(
      (t) => t.status === 'pending'
    )
    const failedTransactions = allTransactions.filter(
      (t) => t.status === 'failed'
    )

    const totalRevenue = completedTransactions.reduce(
      (sum, t) => sum + parseFloat(t.amount || 0),
      0
    )

    // This month stats
    const thisMonthTransactions = allTransactions.filter((t) =>
      moment(t.created_at).tz('Asia/Kolkata').isSameOrAfter(monthStart)
    )

    const thisMonthRevenue = thisMonthTransactions
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)

    const thisMonthClassesHeld = await ClassAttendance.count({
      where: {
        instructor_id: teacherId,
        marked_at: { [Op.gte]: monthStart },
      },
      distinct: true,
      col: 'class_id',
    })

    return res.status(HTTP_OK).json({
      status: 'success',
      data: {
        statistics: {
          classesCount,
          activeClasses: activeClassesCount,
          studentsCount,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          totalTransactions: allTransactions.length,
          successfulTransactions: completedTransactions.length,
          pendingTransactions: pendingTransactions.length,
          failedTransactions: failedTransactions.length,
        },
        thisMonth: {
          newStudents: 0, // TODO: Calculate from UserPlan created_at
          classesHeld: thisMonthClassesHeld,
          revenueGenerated: parseFloat(thisMonthRevenue.toFixed(2)),
        },
        trends: {
          completionRate:
            allTransactions.length > 0
              ? parseFloat(
                  (
                    (completedTransactions.length / allTransactions.length) *
                    100
                  ).toFixed(1)
                )
              : 0,
          averageTransaction:
            completedTransactions.length > 0
              ? parseFloat(
                  (
                    completedTransactions.reduce(
                      (sum, t) => sum + parseFloat(t.amount || 0),
                      0
                    ) / completedTransactions.length
                  ).toFixed(2)
                )
              : 0,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
      code: 'SERVER_ERROR',
    })
  }
})

/**
 * GET /api/teacher/dashboard/summary
 * Get dashboard summary/overview
 */
router.get('/summary', async (req, res) => {
  try {
    const teacherId = req.user.user_id

    // Get recent transactions
    const recentTransactions = await Transaction.findAll({
      attributes: ['transaction_id', 'amount', 'status', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 5,
    })

    // Get upcoming classes (from MongoDB)
    const Class = require('../../models/mongo/Class')
    const upcomingClasses = await Class.find({
      teacher_id: teacherId,
    })
      .sort({ created_at: -1 })
      .limit(5)

    return res.status(HTTP_OK).json({
      status: 'success',
      data: {
        recentTransactions: recentTransactions.map((t) => ({
          id: t.transaction_id,
          amount: t.amount,
          status: t.status,
          date: moment(t.created_at)
            .tz('Asia/Kolkata')
            .format('YYYY-MM-DD HH:mm'),
        })),
        upcomingClasses: upcomingClasses.map((c) => ({
          id: c._id,
          name: c.class_name,
          schedule: c.schedule,
          status: c.status,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching dashboard summary:', error)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
      code: 'SERVER_ERROR',
    })
  }
})

module.exports = router

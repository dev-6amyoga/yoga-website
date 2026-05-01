const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const { Transaction } = require('../../models/sql/Transaction')
const { User } = require('../../models/sql/User')
const { UserPlan } = require('../../models/sql/UserPlan')
const { Plan } = require('../../models/sql/Plan')
const moment = require('moment-timezone')
const csv = require('csv-stringify')

const {
  HTTP_OK,
  HTTP_BAD_REQUEST,
  HTTP_NOT_FOUND,
  HTTP_INTERNAL_SERVER_ERROR,
} = require('../../utils/http_status_codes')

/**
 * GET /api/teacher/transactions
 * Get all transactions with filters
 */
router.get('/', async (req, res) => {
  try {
    const instituteId = req.user.currentInstituteId
    const {
      page = 1,
      limit = 20,
      status = 'all',
      dateRange = 'all',
      search = '',
    } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    // Build where clause
    let where = {}

    // Add status filter
    if (status !== 'all') {
      where.status = status
    }

    // Add date range filter
    if (dateRange !== 'all') {
      const today = moment().tz('Asia/Kolkata')
      let filterDate

      if (dateRange === 'today') {
        filterDate = today.clone().subtract(1, 'day').startOf('day')
      } else if (dateRange === 'week') {
        filterDate = today.clone().subtract(7, 'days').startOf('day')
      } else if (dateRange === 'month') {
        filterDate = today.clone().subtract(1, 'month').startOf('day')
      }

      if (filterDate) {
        where.created_at = { [Op.gte]: filterDate }
      }
    }

    // Get transactions
    const transactions = await Transaction.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ['user_id', 'name', 'email'],
          required: true,
        },
        {
          model: UserPlan,
          attributes: ['user_plan_id', 'plan_id'],
          include: [
            {
              model: Plan,
              attributes: ['name'],
              required: true,
            },
          ],
          required: false,
        },
      ],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
      distinct: true,
      subQuery: false,
    })

    // Apply search filter on results if needed
    let filteredTransactions = transactions.rows
    if (search) {
      const searchLower = search.toLowerCase()
      filteredTransactions = transactions.rows.filter(
        (t) =>
          t.user.name.toLowerCase().includes(searchLower) ||
          t.user.email.toLowerCase().includes(searchLower) ||
          t.transaction_id?.toLowerCase().includes(searchLower)
      )
    }

    // Calculate summary stats
    const allTransactions = await Transaction.findAll({
      where: {},
      attributes: ['id', 'amount', 'status'],
    })

    const summary = {
      totalRevenue: allTransactions
        .filter((t) => t.status === 'completed')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),
      totalTransactions: allTransactions.length,
      successfulTransactions: allTransactions.filter(
        (t) => t.status === 'completed'
      ).length,
      pendingTransactions: allTransactions.filter((t) => t.status === 'pending')
        .length,
    }

    return res.status(HTTP_OK).json({
      status: 'success',
      data: {
        transactions: filteredTransactions.map((t) => ({
          id: t.transaction_id,
          studentName: t.user.name,
          studentEmail: t.user.email,
          amount: parseFloat(t.amount),
          type: t.transaction_type || 'Plan Purchase',
          date: moment(t.created_at).tz('Asia/Kolkata').format('YYYY-MM-DD'),
          status: t.status,
          planName: t.user_plan?.plan?.name || 'N/A',
          paymentMethod: t.payment_method || 'Unknown',
          invoiceUrl: t.invoice_url || null,
        })),
        pagination: {
          total: filteredTransactions.length,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(filteredTransactions.length / parseInt(limit)),
        },
        summary,
      },
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
      code: 'SERVER_ERROR',
    })
  }
})

/**
 * GET /api/teacher/transactions/:transactionId
 * Get specific transaction details
 */
router.get('/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params

    const transaction = await Transaction.findOne({
      where: { transaction_id: transactionId },
      include: [
        {
          model: User,
          attributes: ['user_id', 'name', 'email'],
        },
        {
          model: UserPlan,
          include: [
            {
              model: Plan,
              attributes: ['name'],
            },
          ],
        },
      ],
    })

    if (!transaction) {
      return res.status(HTTP_NOT_FOUND).json({
        status: 'error',
        message: 'Transaction not found',
        code: 'NOT_FOUND',
      })
    }

    return res.status(HTTP_OK).json({
      status: 'success',
      data: {
        id: transaction.transaction_id,
        studentId: transaction.user_id,
        studentName: transaction.user.name,
        studentEmail: transaction.user.email,
        amount: parseFloat(transaction.amount),
        type: transaction.transaction_type,
        date: moment(transaction.created_at)
          .tz('Asia/Kolkata')
          .format('YYYY-MM-DD HH:mm:ss'),
        status: transaction.status,
        planName: transaction.user_plan?.plan?.name || 'N/A',
        paymentMethod: transaction.payment_method,
        transactionReference: transaction.transaction_ref,
        invoiceUrl: transaction.invoice_url,
        notes: transaction.notes || '',
      },
    })
  } catch (error) {
    console.error('Error fetching transaction details:', error)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
      code: 'SERVER_ERROR',
    })
  }
})

/**
 * GET /api/teacher/transactions/export
 * Export transactions as CSV
 */
router.get('/export/csv', async (req, res) => {
  try {
    const { dateRange = 'month' } = req.query

    // Get transactions based on date range
    let where = {}
    if (dateRange !== 'all') {
      const today = moment().tz('Asia/Kolkata')
      let filterDate

      if (dateRange === 'today') {
        filterDate = today.clone().subtract(1, 'day').startOf('day')
      } else if (dateRange === 'week') {
        filterDate = today.clone().subtract(7, 'days').startOf('day')
      } else if (dateRange === 'month') {
        filterDate = today.clone().subtract(1, 'month').startOf('day')
      } else if (dateRange === 'year') {
        filterDate = today.clone().subtract(1, 'year').startOf('day')
      }

      if (filterDate) {
        where.created_at = { [Op.gte]: filterDate }
      }
    }

    const transactions = await Transaction.findAll({
      where,
      include: [
        {
          model: User,
          attributes: ['name', 'email'],
        },
        {
          model: UserPlan,
          include: [{ model: Plan, attributes: ['name'] }],
        },
      ],
      order: [['created_at', 'DESC']],
    })

    // Format data for CSV
    const csvData = transactions.map((t) => ({
      'Transaction ID': t.transaction_id,
      'Student Name': t.user.name,
      'Student Email': t.user.email,
      Amount: t.amount,
      Type: t.transaction_type,
      Date: moment(t.created_at)
        .tz('Asia/Kolkata')
        .format('YYYY-MM-DD HH:mm:ss'),
      Status: t.status,
      'Plan Name': t.user_plan?.plan?.name || 'N/A',
      'Payment Method': t.payment_method,
    }))

    // Generate CSV
    csv(
      csvData,
      {
        header: true,
        columns: [
          'Transaction ID',
          'Student Name',
          'Student Email',
          'Amount',
          'Type',
          'Date',
          'Status',
          'Plan Name',
          'Payment Method',
        ],
      },
      (err, output) => {
        if (err) {
          console.error('Error generating CSV:', err)
          return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            status: 'error',
            message: 'Error generating CSV',
            code: 'SERVER_ERROR',
          })
        }

        // Send as file download
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="transactions-${moment().format('YYYY-MM-DD')}.csv"`
        )
        res.send(output)
      }
    )
  } catch (error) {
    console.error('Error exporting transactions:', error)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
      code: 'SERVER_ERROR',
    })
  }
})

module.exports = router

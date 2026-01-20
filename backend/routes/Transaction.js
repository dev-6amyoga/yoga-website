const express = require('express')
const router = express.Router()
const { Transaction } = require('../models/sql/Transaction')
const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require('../utils/http_status_codes')
const { authenticateToken } = require('../utils/jwt')
const { hasPermission } = require('../utils/hasPermission')
const { DiscountCoupon } = require('../models/sql/DiscountCoupon')
const { User } = require('../models/sql/User')
const { ReferralCode } = require('../models/sql/ReferralCode')
const { Currency } = require('../models/sql/Currency')
const { UserPlan } = require('../models/sql/UserPlan')
const { Plan } = require('../models/sql/Plan')
const { Refund } = require('../models/sql/Refund')
const { sequelize } = require('../init.sequelize')
const { TRANSACTION_SUCCESS } = require('../enums/transaction_status')
const { Op } = require('sequelize')

module.exports = router

router.post('/get-transaction-by-user-id', async (req, res) => {
  const { user_id } = req.body
  //console.log(user_id)
  if (!user_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Missing required fields' })
  }
  try {
    const all_transaction_for_user = await Transaction.findAll({
      where: {
        user_id: user_id,
      },
    })

    return res.status(HTTP_OK).json({ all_transaction_for_user })
  } catch (err) {
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to fetch transactions!' })
  }
})

router.post('/add-transaction', async (req, res) => {
  const {
    payment_for,
    payment_method,
    amount,
    payment_status,
    payment_date,
    transaction_order_id,
    transaction_payment_id,
    transaction_signature,
    user_id,
  } = req.body
  //console.log(req.body)
  if (
    !payment_for ||
    !payment_method ||
    amount === undefined ||
    amount === null ||
    !payment_status ||
    !payment_date ||
    !transaction_order_id ||
    !transaction_payment_id ||
    !transaction_signature ||
    !user_id
  ) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Missing required fields' })
  }
  //console.log('Adding new transaction:', req.body)
  try {
    const newTransaction = await Transaction.create({
      payment_for,
      payment_method,
      amount,
      payment_status,
      payment_date,
      transaction_order_id,
      transaction_payment_id,
      transaction_signature,
      user_id,
    })

    return res.status(HTTP_OK).json({ newTransaction })
  } catch (err) {
    console.error(err)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to add a new transaction' })
  }
})

router.get('/get-all', async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      include: [
        { model: User },
        { model: UserPlan, include: [{ model: Plan }] },
        { model: Refund },
        { model: DiscountCoupon },
        { model: ReferralCode },
        { model: Currency },
      ],
    })
    return res.status(HTTP_OK).json({ transactions })
  } catch (err) {
    //console.log(err)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to fetch transactions!' })
  }
})

router.get('/admin-stats/revenue-per-month', async (req, res) => {
  try {
    const revenuePerMonth = await Transaction.findAll({
      where: {
        payment_status: {
          [Op.or]: [TRANSACTION_SUCCESS, 'succeeded'],
        },
      },
      attributes: [
        [
          sequelize.fn('to_char', sequelize.col('payment_date'), 'YYYYMM'),
          'month',
        ],
        [sequelize.fn('sum', sequelize.col('amount')), 'Revenue'],
      ],
      include: [{ model: Currency, attributes: ['short_tag'], as: 'currency' }],
      group: [
        sequelize.fn('to_char', sequelize.col('payment_date'), 'YYYYMM'),
        'currency.short_tag',
        'currency.currency_id',
      ],
    })

    // reduce per month key
    const reduced = revenuePerMonth.reduce((acc, { dataValues }) => {
      const { month, Revenue, currency } = dataValues

      if (currency === null) {
        return acc
      }

      const idx = acc.findIndex((el) => el.month === month)

      if (idx === -1) {
        acc.push({
          month,
          [currency.short_tag]: Revenue,
        })
        return acc
      }

      acc[idx][currency.short_tag] = Revenue
      return acc
    }, [])

    return res.status(HTTP_OK).json({ revenuePerMonth: reduced })
  } catch (err) {
    //console.log(err)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to fetch transactions!' })
  }
})

router.get('/admin-stats/current-month-revenue', async (req, res) => {
  try {
    const currentMonthRevenue = await Transaction.findAll({
      where: {
        payment_status: {
          [Op.or]: [TRANSACTION_SUCCESS, 'succeeded'],
        },
        payment_date: {
          [Op.gte]: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
          ),
          [Op.lte]: new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            0
          ),
        },
      },
      attributes: [[sequelize.fn('sum', sequelize.col('amount')), 'revenue']],
      include: [{ model: Currency, attributes: ['short_tag'], as: 'currency' }],
      group: ['currency.short_tag', 'currency.currency_id'],
    })

    return res
      .status(HTTP_OK)
      .json({ currentMonthRevenue: currentMonthRevenue })
  } catch (err) {
    //console.log(err)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to fetch transactions!' })
  }
})

router.get('/get-all-discounted', async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: {
        discount_coupon_id: {
          [Op.not]: null,
        },
      },
      include: [
        { model: User },
        { model: UserPlan, include: [{ model: Plan }] },
        { model: Refund },
        { model: DiscountCoupon },
        { model: ReferralCode },
        { model: Currency },
      ],
    })
    return res.status(HTTP_OK).json({ transactions })
  } catch (err) {
    //console.log(err)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to fetch transactions!' })
  }
})

router.get('/gst-summary', async (req, res) => {
  try {
    const { from, to } = req.query

    const where = [`payment_status = 'successful'`]
    if (from) where.push(`payment_date >= :from`)
    if (to) where.push(`payment_date <= :to`)
    const query = `
WITH adjusted AS (
  SELECT
    payment_date,
    CASE
      WHEN payment_date < DATE '2026-01-01' THEN amount / 100
      ELSE amount
    END AS adj_amount
  FROM public."transaction"
  WHERE ${where.join(' AND ')}
)
SELECT
  TO_CHAR(payment_date, 'YYYY-MM') AS month,
  SUM(adj_amount) AS gross_revenue,
  ROUND(SUM(adj_amount) / 1.05, 2) AS taxable_value,
  ROUND((SUM(adj_amount) / 1.05) * 0.025, 2) AS cgst_2_5,
  ROUND((SUM(adj_amount) / 1.05) * 0.025, 2) AS sgst_2_5,
  ROUND((SUM(adj_amount) / 1.05) * 0.05, 2) AS total_gst,
  ROUND(SUM(adj_amount) / 1.05, 2) AS net_revenue
FROM adjusted
GROUP BY TO_CHAR(payment_date, 'YYYY-MM')
ORDER BY month DESC;

    `
    const data = await sequelize.query(query, {
      replacements: { from, to },
      type: sequelize.QueryTypes.SELECT,
    })
    res.json({ data })
  } catch (err) {
    console.error('GST SUMMARY ERROR', err)
    res.status(500).json({ error: 'Failed to fetch GST summary' })
  }
})

router.get('/gst-transactions', async (req, res) => {
  try {
    const { from, to } = req.query

    const where = [`t.payment_status = 'successful'`]
    if (from) where.push(`t.payment_date >= :from`)
    if (to) where.push(`t.payment_date <= :to`)

    const query = `
  SELECT
    u.name,
    u.email,
    u.phone,
    CASE
      WHEN t.payment_date < DATE '2026-01-01' THEN t.amount / 100
      ELSE t.amount
    END AS amount_with_gst,
    ROUND(
      (CASE
        WHEN t.payment_date < DATE '2026-01-01' THEN t.amount / 100
        ELSE t.amount
      END) / 1.05, 2
    ) AS amount_without_gst,
    ROUND(
      ((CASE
        WHEN t.payment_date < DATE '2026-01-01' THEN t.amount / 100
        ELSE t.amount
      END) / 1.05) * 0.025, 2
    ) AS cgst_2_5,
    ROUND(
      ((CASE
        WHEN t.payment_date < DATE '2026-01-01' THEN t.amount / 100
        ELSE t.amount
      END) / 1.05) * 0.025, 2
    ) AS sgst_2_5,
    TO_CHAR(t.payment_date, 'YYYY-MM-DD') AS payment_date,
TO_CHAR(t.payment_date, 'FMMonth') AS month,
    TO_CHAR(t.payment_date, 'YYYY') AS year,
    t.payment_method,
    t.transaction_order_id,
    t.transaction_payment_id
  FROM public."transaction" t
  JOIN public."user" u ON u.user_id = t.user_id
  WHERE ${where.join(' AND ')}
  ORDER BY t.payment_date DESC
`

    const data = await sequelize.query(query, {
      replacements: { from, to },
      type: sequelize.QueryTypes.SELECT,
    })

    res.json({ data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch transactions' })
  }
})

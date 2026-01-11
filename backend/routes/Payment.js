const express = require('express')
const {
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  RAZORPAY_LIVE_KEY_ID,
  RAZORPAY_LIVE_KEY_SECRET,
  SECRET_KEY,
} = process.env
// const { sequelize } = require("../init.sequelize");
const router = express.Router()
const Razorpay = require('razorpay')
const crypto = require('crypto')
const { sequelize } = require('../init.sequelize')
const { Transaction } = require('../models/sql/Transaction')
const {
  HTTP_BAD_REQUEST,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_OK,
} = require('../utils/http_status_codes')
const {
  TRANSACTION_FAILED,
  TRANSACTION_CANCELLED,
  TRANSACTION_TIMEOUT,
  TRANSACTION_SUCCESS,
} = require('../enums/transaction_status')
const { Refund } = require('../models/sql/Refund')
const {
  REFUND_PENDING,
  REFUND_PROCESSED,
  REFUND_ERROR,
} = require('../enums/refund_status')
const { Op } = require('sequelize')
const { authenticateToken } = require('../utils/jwt')
const axios = require('axios')
const { commitUnified } = require('../services/commitUnified')
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

router.post('/order', async (req, res) => {
  try {
    const {
      amount,
      currency,
      user_id,
      plan_id,
      discount_coupon_id,
      user_plan_payload,
    } = req.body
    console.log(req.body)
    if (!amount || !currency || !user_id || !plan_id) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount),
      currency,
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1,
      notes: {
        user_id: String(user_id),
        plan_id: String(plan_id),
        discount_coupon_id: discount_coupon_id
          ? String(discount_coupon_id)
          : '',
        user_plan_payload: JSON.stringify(user_plan_payload),
      },
    })

    return res.status(200).json({ order })
  } catch (err) {
    console.error('Order creation failed:', err)
    return res.status(500).json({ message: 'Order creation failed' })
  }
})

router.post('/commit', async (req, res) => {
  try {
    await commitUnified(req.body)
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Commit failed:', err)
    return res.status(500).json({ message: 'Commit failed' })
  }
})

router.post('/webhook/razorpay', async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET
    const signature = req.headers['x-razorpay-signature']

    if (!signature) {
      console.error('❌ No Razorpay signature header')
      return res.status(400).send('No signature')
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(req.body)
      .digest('hex')

    if (signature !== expectedSignature) {
      console.error('❌ Invalid Razorpay webhook signature')
      return res.status(401).send('Invalid signature')
    }

    const event = JSON.parse(req.body.toString())
    const payment = event?.payload?.payment?.entity

    if (!payment) {
      return res.status(200).json({ ok: true })
    }

    const status =
      payment.status === 'captured' ? TRANSACTION_SUCCESS : TRANSACTION_FAILED

    const notes = payment.notes || {}

    const user_plan_payload = notes.user_plan_payload
      ? JSON.parse(notes.user_plan_payload)
      : null

    await commitUnified({
      user_id: notes.user_id,
      plan_id: notes.plan_id,
      status,
      payment_for: 'USER_PLAN',
      payment_method: 'razorpay',
      amount: payment.amount / 100,
      order_id: payment.order_id,
      payment_id: payment.id,
      signature,
      currency_id: 1,
      discount_coupon_id: notes.discount_coupon_id || null,
      user_plan_payload,
    })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('❌ Webhook error:', err)
    return res.status(500).send('Webhook error')
  }
})

module.exports = router

const triggerInvoiceAndAdmin = async (user_id, order_id, transaction) => {
  try {
    // Send invoice
    await FetchInternal('/invoice/student/mail-invoice', {
      user_id,
      transaction_order_id: order_id,
    })

    // Notify admin
    await FetchInternal('/invoice/student/notify-admin', {
      user_id,
      transaction_order_id: order_id,
    })
  } catch (err) {
    console.error('Post-payment side effects failed:', err)
  }
}

router.post('/commit', async (req, res) => {
  try {
    const {
      user_id,
      plan_id,
      status,
      payment_for,
      payment_method,
      amount,
      signature,
      order_id,
      payment_id,
      currency_id,
      discount_coupon_id,
    } = req.body

    if (!user_id || !status || !order_id) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: 'Missing required fields' })
    }

    if (status === TRANSACTION_SUCCESS && payment_method === 'razorpay') {
      const digest = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${order_id}|${payment_id}`)
        .digest('hex')

      if (digest !== signature) {
        return res
          .status(HTTP_BAD_REQUEST)
          .json({ message: 'Invalid signature' })
      }
    }

    await commitUnified({
      user_id,
      plan_id,
      status,
      payment_for,
      payment_method,
      amount,
      order_id,
      payment_id,
      signature,
      currency_id,
      discount_coupon_id,
    })

    return res.status(HTTP_OK).json({ ok: true })
  } catch (err) {
    console.error('Commit error', err)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ message: 'Server error' })
  }
})

router.post('/refund/history', async (req, res) => {
  const { transaction_id } = req.body

  if (!transaction_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: 'Missing required fields' })
  }

  // const razorpay = new Razorpay({
  // 	key_id: RAZORPAY_KEY_ID,
  // 	key_secret: RAZORPAY_KEY_SECRET,
  // });

  try {
    const transaction = await Transaction.findOne({
      where: {
        transaction_id: transaction_id,
      },
    })

    if (!transaction) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: 'Transaction not found' })
    }

    const refunds = await transaction.getRefunds()
    // //console.log(refunds);

    return res.status(HTTP_OK).json({ refunds })
  } catch (err) {
    //console.log(err);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ message: 'Failed to fetch refund history' })
  }
})

router.post('/refund/create', async (req, res) => {
  //console.log(req.body);
  const { transaction_payment_id, amount, currency } = req.body

  if (!transaction_payment_id || !amount || !currency) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: 'Missing required fields' })
  }

  if (amount <= 100) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: 'Minimum refundable amount is 1' })
  }

  const t = await sequelize.transaction()
  let refund = null
  let razorpayResponse = null

  try {
    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    })

    const transaction = await Transaction.findOne({
      where: {
        transaction_payment_id: transaction_payment_id,
      },
      transaction: t,
    })

    if (!transaction) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: 'Transaction not found' })
    }

    if (transaction.payment_status !== TRANSACTION_SUCCESS) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: 'Transaction is not successful' })
    }

    if (transaction.amount !== amount) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: 'Amount does not match' })
    }

    // check if refund already exists
    const refunds = await Refund.findAll({
      where: {
        transaction_id: transaction.transaction_id,
        refund_status: { [Op.or]: [REFUND_PENDING, REFUND_PROCESSED] },
      },
    })

    if (refunds.length > 0) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: 'Refund already exists/is in progress.' })
    }

    // create a refund transaction
    refund = await Refund.create(
      {
        transaction_id: transaction.transaction_id,
        refund_reason: 'Refund for transaction',
        payment_method: 'razorpay',
        amount: amount,
        refund_status: REFUND_PENDING,
        payment_date: new Date(),
      },
      { transaction: t }
    )

    /*
		REQ: 
		path param : payment_id
		body : {
			"amount": "100",
			"speed": "normal",
			"notes": {
				"notes_key_1": "Beam me up Scotty.",
				"notes_key_2": "Engage"
			},
			"receipt": "Receipt No. 31"
		}
		RES : {
				"id": "rfnd_FP8QHiV938haTz",
				"entity": "refund",
				"amount": 500100,
				"receipt": "Receipt No. 31",
				"currency": "INR",
				"payment_id": "pay_29QQoUBi66xm2f",
				"notes": []
				"receipt": null,
				"acquirer_data": {
						"arn": null
				},
				"created_at": 1597078866,
				"batch_id": null,
				"status": "processed",
				"speed_processed": "normal",
				"speed_requested": "normal"
		}
		ERR: 
		{
				"error": {
						"code": "BAD_REQUEST_ERROR",
						"description": "The amount must be atleast INR 1.00",
						"source": "business",
						"step": "payment_initiation",
						"reason": "input_validation_failed",
						"metadata": {},
						"field": "amount"
				}
		}
		*/

    //console.log(transaction_payment_id, {
    // 	amount: amount,
    // 	speed: "normal",
    // 	receipt: refund.refund_id,
    // });

    razorpayResponse = await razorpay.payments.refund(transaction_payment_id, {
      amount: amount,
      speed: 'normal',
      notes: {},
      receipt: String(refund.refund_id),
    })

    if (!razorpayResponse) {
      return res
        .status(HTTP_INTERNAL_SERVER_ERROR)
        .json({ message: 'Failed to issue a refund' })
    }

    if (razorpayResponse?.error) {
      refund.refund_error_code = razorpayResponse.error.code || null
      refund.refund_error_desc = razorpayResponse.error.description || null
      refund.refund_error_reason = razorpayResponse.error.reason || null
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: 'Failed to issue a refund' })
    }

    refund.refund_payment_id = razorpayResponse.id

    //console.log(razorpayResponse);

    await refund.save({ transaction: t })

    await t.commit()
    res.status(HTTP_OK).json('Successfully refunded')
  } catch (err) {
    //console.log(err);

    if (refund) {
      refund.refund_status = REFUND_ERROR
      refund.refund_error_code = err?.error?.code || null
      refund.refund_error_desc = err?.error?.description || null
      refund.refund_error_reason = err?.error?.reason || null
      await refund.save({ transaction: t })
      await t.commit()

      return res.status(HTTP_BAD_REQUEST).json({
        message: 'Unable to issue a refund',
      })
    } else {
      await t.rollback()
      return res.status(HTTP_BAD_REQUEST).json({
        message: 'Unable to issue a refund',
      })
    }
  }
})

router.post('/refund/webhook', async (req, res) => {
  /*
		EVENT: razorpay payment refund
		EVENT NAME :
	*/
})

module.exports = router

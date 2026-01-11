const axios = require('axios')
const { sequelize } = require('../init.sequelize')
const { Transaction } = require('../models/sql/Transaction')
const { UserPlan } = require('../models/sql/UserPlan')
const { Plan } = require('../models/sql/Plan')
const { User } = require('../models/sql/User')
const { Role } = require('../models/sql/Role')
const { UserPlanAttendance } = require('../models/sql/UserPlanAttendance')
const {
  USER_PLAN_ACTIVE,
  USER_PLAN_STAGED,
} = require('../enums/user_plan_status')
const { TRANSACTION_SUCCESS } = require('../enums/transaction_status')

const BACKEND_BASE = process.env.BACKEND_DOMAIN || 'http://localhost:4000'

async function commitUnified(payload) {
  const t = await sequelize.transaction()

  let createdTxn = false
  let createdPlan = false

  try {
    const {
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
      user_plan_payload,
    } = payload

    if (!user_id || !order_id || !status) {
      throw new Error('Missing required commit fields')
    }

    /* =======================================================
       1️⃣ TRANSACTION — IDEMPOTENT
       ======================================================= */

    const [txn, txnCreated] = await Transaction.findOrCreate({
      where: { transaction_order_id: order_id },
      defaults: {
        user_id,
        amount,
        payment_for,
        payment_method,
        payment_status: status,
        transaction_order_id: order_id,
        transaction_payment_id: payment_id || order_id,
        transaction_signature: signature || 'N/A',
        currency_id,
        discount_coupon_id: discount_coupon_id ?? null,
        payment_date: new Date(),
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    })

    createdTxn = txnCreated

    if (!txnCreated) {
      console.log('ℹ️ Duplicate transaction commit ignored:', order_id)
    }

    if (status !== TRANSACTION_SUCCESS) {
      await t.commit()
      return
    }

    /* =======================================================
       2️⃣ USER PLAN — IDEMPOTENT
       ======================================================= */

    const existingPlan = await UserPlan.findOne({
      where: { transaction_order_id: order_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    })

    if (existingPlan) {
      console.log('ℹ️ Plan already exists for:', order_id)
      await t.commit()
      return
    }

    if (!user_plan_payload) {
      throw new Error('Missing user_plan_payload')
    }

    const {
      purchase_date,
      validity_from,
      validity_to,
      cancellation_date,
      auto_renewal_enabled,
      referral_code_id,
      current_status,
      is_trial,
      user_type,
      institute_id,
    } = user_plan_payload

    if (!user_id || !plan_id || !purchase_date || !user_type) {
      throw new Error('Missing required registration fields')
    }

    const plan = await Plan.findOne({ where: { plan_id }, transaction: t })
    if (!plan) throw new Error("Plan doesn't exist")

    const user = await User.findOne(
      { where: { user_id }, attributes: ['user_id'] },
      { transaction: t }
    )
    if (!user) throw new Error("User doesn't exist")

    const role = await Role.findOne({
      where: { name: user_type },
      attributes: ['role_id'],
    })
    if (!role) throw new Error("Role doesn't exist")

    let computed_validity_to = validity_to
    if (validity_from && !validity_to) {
      const fromDate = new Date(validity_from)
      const toDate = new Date(fromDate)
      toDate.setDate(fromDate.getDate() + plan.plan_validity_days)
      computed_validity_to = toDate
    }

    const newUserPlan = await UserPlan.create(
      {
        purchase_date,
        validity_from,
        validity_to: computed_validity_to,
        cancellation_date,
        auto_renewal_enabled,
        discount_coupon_id,
        referral_code_id,
        user_id,
        plan_id,
        is_trial,
        institute_id,
        current_status,
        transaction_order_id: order_id,
        user_type,
      },
      { transaction: t }
    )

    createdPlan = true

    await UserPlanAttendance.create(
      {
        user_id,
        plan_id,
        user_plan_id: newUserPlan.user_plan_id,
        start_date: validity_from,
        expiry_date: computed_validity_to,
        classes_allowed: plan.number_of_zoom_classes,
        classes_attended: 0,
        status: current_status === USER_PLAN_ACTIVE ? 'ACTIVE' : current_status,
      },
      { transaction: t }
    )

    await t.commit()

    /* =======================================================
       3️⃣ SIDE EFFECTS — DO NOT BLOCK DB
       ======================================================= */

    if (createdTxn && createdPlan) {
      triggerInvoiceAndAdminNotify({
        user_id,
        transaction_order_id: order_id,
      })
    }
  } catch (err) {
    await t.rollback()
    console.error('❌ commitUnified failed:', err)
    throw err
  }
}

/* =======================================================
   SIDE EFFECTS (NON-BLOCKING)
   ======================================================= */

async function triggerInvoiceAndAdminNotify({ user_id, transaction_order_id }) {
  try {
    // Send invoice
    axios.post(`${BACKEND_BASE}/invoice/student/mail-invoice`, {
      user_id,
      transaction_order_id,
      plan_type: 'STANDARD_PLAN',
    })
  } catch (err) {
    console.error('⚠️ Invoice sending failed:', err?.message)
  }

  try {
    // Notify admin
    axios.post(`${BACKEND_BASE}/invoice/student/notify-admin`, {
      user_id,
      transaction_order_id,
      plan_type: 'STANDARD_PLAN',
    })
  } catch (err) {
    console.error('⚠️ Admin notify failed:', err?.message)
  }
}

module.exports = { commitUnified }

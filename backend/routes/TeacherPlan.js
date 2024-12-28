const express = require('express')
const { TeacherPlan } = require('../models/sql/TeacherPlan')

const router = express.Router()

router.post('/purchase', async (req, res) => {
  try {
    const {
      teacher_id,
      plan_id,
      purchase_date,
      validity_from,
      validity_to,
      transaction_order_id,
      current_status,
      auto_renewal_enabled,
      user_type,
    } = req.body

    const newPlan = await TeacherPlan.create({
      teacher_id,
      plan_id,
      purchase_date,
      validity_from,
      validity_to,
      transaction_order_id,
      current_status,
      auto_renewal_enabled,
      user_type,
    })

    res
      .status(200)
      .json({ message: 'Plan purchased successfully', plan: newPlan })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to purchase plan', error })
  }
})

router.get('/plans/:teacher_id', async (req, res) => {
  try {
    const { teacher_id } = req.params
    const today = new Date()

    const plans = await TeacherPlan.findAll({ where: { teacher_id } })

    if (plans.length === 0) {
      return res.status(200).json({
        planId: -1,
        plans: [],
        message: 'No plans available for this user.',
      })
    }

    // Categorize plans
    const categorizedPlans = plans.map((plan) => {
      let status = 'expired'

      if (today >= plan.validity_from && today <= plan.validity_to) {
        status = 'active'
      } else if (today < plan.validity_from) {
        status = 'upcoming'
      }

      return {
        user_plan_id: plan.user_plan_id,
        teacher_id: plan.teacher_id,
        purchase_date: plan.purchase_date,
        validity_from: plan.validity_from,
        validity_to: plan.validity_to,
        transaction_order_id: plan.transaction_order_id,
        current_status: plan.current_status,
        auto_renewal_enabled: plan.auto_renewal_enabled,
        user_type: plan.user_type,
        categorized_status: status,
      }
    })

    res.status(200).json({
      planId: plans[0].user_plan_id,
      plans: categorizedPlans,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to fetch plans', error })
  }
})

router.put('/update/:user_plan_id', async (req, res) => {
  try {
    const { user_plan_id } = req.params
    const updates = req.body

    const plan = await TeacherPlan.findByPk(user_plan_id)
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' })
    }

    await plan.update(updates)

    res.status(200).json({ message: 'Plan updated successfully', plan })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to update plan', error })
  }
})

router.delete('/delete/:user_plan_id', async (req, res) => {
  try {
    const { user_plan_id } = req.params

    const plan = await TeacherPlan.findByPk(user_plan_id)
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' })
    }

    await plan.destroy()

    res.status(200).json({ message: 'Plan deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to delete plan', error })
  }
})

router.get('/plan/:user_plan_id', async (req, res) => {
  try {
    const { user_plan_id } = req.params

    const plan = await TeacherPlan.findByPk(user_plan_id)
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' })
    }

    res.status(200).json(plan)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to retrieve plan', error })
  }
})

module.exports = router

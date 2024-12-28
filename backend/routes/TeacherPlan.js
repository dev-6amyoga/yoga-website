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

router.get('/teacher/:teacher_id', async (req, res) => {
  try {
    const { teacher_id } = req.params
    const plans = await TeacherPlan.findAll({ where: { teacher_id } })

    if (plans.length === 0) {
      return res.status(404).json({ message: 'No plans found for the teacher' })
    }

    res.status(200).json(plans)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to retrieve plans', error })
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

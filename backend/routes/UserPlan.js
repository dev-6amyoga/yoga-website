const express = require('express')
const router = express.Router()
const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require('../utils/http_status_codes')
const { UserPlan } = require('../models/sql/UserPlan')
const { Plan } = require('../models/sql/Plan')
const { User } = require('../models/sql/User')
const { Op } = require('sequelize')
const { sequelize } = require('../init.sequelize')
const { timeout } = require('../utils/promise_timeout')
const { UserInstitutePlanRole } = require('../models/sql/UserInstitutePlanRole')
const { Institute } = require('../models/sql/Institute')
const {
  USER_PLAN_ACTIVE,
  USER_PLAN_STAGED,
} = require('../enums/user_plan_status')
const { Role } = require('../models/sql/Role')
const WatchTimeQuota = require('../models/mongo/WatchTimeQuota')
const WatchHistory = require('../models/mongo/WatchHistory')
const WatchTimeLog = require('../models/mongo/WatchTimeLog')
const { authenticateToken } = require('../utils/jwt')
const { ROLE_TEACHER } = require('../enums/role')
const { UserPlanAttendance } = require('../models/sql/UserPlanAttendance')

router.get('/get-all-user-plans', async (req, res) => {
  try {
    const userplans = await UserPlan.findAll()
    res.status(HTTP_OK).json({ userplans })
  } catch (error) {
    console.error('Error fetching plans:', error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Internal Server Error',
    })
  }
})

router.post('/get-user-plan-by-id', async (req, res) => {
  const { user_id } = req.body
  if (!user_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Missing required fields' })
  }

  try {
    const userPlan = await UserPlan.findAll({
      where: {
        user_id: user_id,
      },
      include: [
        { model: User, attributes: ['name'] },
        {
          model: Plan,
          attributes: [
            'name',
            'has_basic_playlist',
            'has_playlist_creation',
            'playlist_creation_limit',
            'has_self_audio_upload',
            'number_of_teachers',
            'has_zoom_classes',
            'number_of_zoom_classes',
            'plan_validity_days',
            'watch_time_limit',
          ],
        },
      ],
      order: [['validity_to', 'DESC']],
    })

    let newPlanStartDate = new Date()
    let newPlanStatus = 'ACTIVE'

    if (userPlan && userPlan.length > 0) {
      const now = new Date()

      const activePlan = userPlan.find(
        (plan) =>
          plan.current_status === 'ACTIVE' && new Date(plan.validity_to) >= now
      )

      if (activePlan) {
        newPlanStartDate = new Date(activePlan.validity_to)
        newPlanStatus = 'STAGED'
      }
    }

    return res.status(HTTP_OK).json({
      userPlan: userPlan ? userPlan : null,
      newPlanPrediction: {
        start_date: newPlanStartDate,
        status: newPlanStatus,
      },
    })
  } catch (error) {
    console.error(error)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to fetch user' })
  }
})

router.post('/get-practice-now-plan', async (req, res) => {
  const { user_id } = req.body
  if (!user_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Missing required fields' })
  }
  try {
    const userPlan = await UserPlan.findAll({
      where: {
        user_id: user_id,
      },
      include: [
        { model: User, attributes: ['name'] },
        {
          model: Plan,
          attributes: [
            'plan_id',
            'name',
            'has_basic_playlist',
            'has_playlist_creation',
            'playlist_creation_limit',
            'has_self_audio_upload',
            'number_of_teachers',
            'has_zoom_classes',
            'number_of_zoom_classes',
            'plan_validity_days',
            'watch_time_limit',
          ],
        },
      ],
      order: [['validity_to', 'DESC']],
    })
    return res.status(HTTP_OK).json({ userPlan: userPlan ? userPlan : null })
  } catch (error) {
    console.error(error)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to fetch practice now plan' })
  }
})

router.post('/get-active-user-plan-by-id', async (req, res) => {
  const { user_id } = req.body
  if (!user_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Missing required fields' })
  }
  try {
    const userPlan = await UserPlan.findAll({
      where: {
        user_id: user_id,
        current_status: 'ACTIVE',
      },
      include: [
        { model: User, attributes: ['name'] },
        {
          model: Plan,
          attributes: [
            'name',
            'has_basic_playlist',
            'has_playlist_creation',
            'playlist_creation_limit',
            'has_self_audio_upload',
            'number_of_teachers',
          ],
        },
      ],
      order: [['validity_to', 'DESC']],
    })
    return res.status(HTTP_OK).json({ userPlan: userPlan ? userPlan : null })
  } catch (error) {
    console.error(error)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to fetch user' })
  }
})

router.post('/get-user-institute-plan-by-id', async (req, res) => {
  const { user_id, institute_id } = req.body
  if (!user_id || !institute_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Missing required fields' })
  }
  try {
    const userplans = await UserPlan.findAll({
      where: {
        user_id: user_id,
        institute_id: institute_id,
      },
      include: [
        { model: User, attributes: ['name'] },
        {
          model: Plan,
          attributes: [
            'plan_id',
            'name',
            'has_basic_playlist',
            'has_playlist_creation',
            'playlist_creation_limit',
            'has_self_audio_upload',
            'number_of_teachers',
            'plan_validity_days',
            'watch_time_limit',
          ],
        },
        { model: Institute, attributes: ['institute_id', 'name'] },
      ],
    })
    return res.status(HTTP_OK).json({ userplans: userplans ? userplans : null })
  } catch (error) {
    console.error(error)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to fetch user' })
  }
})

router.post(
  '/get-teacher-institute-plan',
  authenticateToken,
  async (req, res) => {
    const { institute_id } = req.body
    const { user_id } = req?.user

    if (!user_id || !institute_id) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: 'Missing required fields' })
    }

    try {
      // find if user is a teacher in institute

      const teacherUIPR = await UserInstitutePlanRole.findOne({
        where: {
          user_id: user_id,
          institute_id: institute_id,
        },
        include: [
          {
            model: Role,
            where: {
              name: ROLE_TEACHER,
            },
          },
        ],
      })

      if (!teacherUIPR) {
        return res
          .status(HTTP_BAD_REQUEST)
          .json({ error: 'User is not a teacher in this institute' })
      }

      // find institute plan
      const institute_plan = await UserPlan.findOne({
        where: {
          institute_id: institute_id,
          current_status: USER_PLAN_ACTIVE,
        },
        include: [
          {
            model: Plan,
            attributes: [
              'plan_id',
              'name',
              'has_basic_playlist',
              'has_playlist_creation',
              'playlist_creation_limit',
              'has_self_audio_upload',
              'number_of_teachers',
              'plan_validity_days',
              'watch_time_limit',
            ],
          },
        ],
      })

      if (!institute_plan) {
        return res
          .status(HTTP_BAD_REQUEST)
          .json({ error: 'Institute plan does not exist' })
      }

      return res.status(HTTP_OK).json({
        institute_plan: institute_plan ? institute_plan : null,
      })
    } catch (error) {
      console.error(error)
      return res
        .status(HTTP_INTERNAL_SERVER_ERROR)
        .json({ error: 'Failed to fetch user' })
    }
  }
)

router.post('/register', authenticateToken, async (req, res) => {
  console.log('➡️ /user-plan/register called')
  console.log('🧾 Request body:', JSON.stringify(req.body))

  const {
    user_id,
    plan_id,
    institute_id,
    purchase_date,
    validity_from = null,
    validity_to = null,
    cancellation_date,
    auto_renewal_enabled,
    discount_coupon_id,
    referral_code_id,
    current_status,
    transaction_order_id,
    is_trial,
    user_type,
  } = req.body

  // -------- Required fields check ----------
  if (
    !user_id ||
    !plan_id ||
    !purchase_date ||
    !transaction_order_id ||
    !user_type
  ) {
    console.warn('❌ Missing required fields', {
      user_id,
      plan_id,
      purchase_date,
      transaction_order_id,
      user_type,
    })

    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Missing required fields' })
  }

  // -------- Status / validity logic ----------
  console.log('📌 Status + validity check', {
    current_status,
    validity_from,
    validity_to,
  })

  if (
    current_status === USER_PLAN_ACTIVE &&
    (validity_from == null || validity_to == null)
  ) {
    console.warn('❌ ACTIVE plan missing validity dates')
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Missing required fields' })
  }

  if (
    current_status !== USER_PLAN_ACTIVE &&
    current_status !== USER_PLAN_STAGED
  ) {
    console.warn('❌ Invalid status:', current_status)
    return res.status(HTTP_BAD_REQUEST).json({ error: 'Invalid status' })
  }

  // -------- Check existing user plan ----------
  const user_plan = await UserPlan.findOne({
    where: { user_id, current_status },
    attributes: ['user_plan_id', 'user_id', 'validity_from', 'validity_to'],
  })

  console.log('📎 Existing plan lookup result:', user_plan?.dataValues || null)

  if (user_plan && current_status === USER_PLAN_ACTIVE) {
    console.warn('❌ User already has active plan')
    return res.status(HTTP_BAD_REQUEST).json({
      error: `User already has a plan that is ${current_status}; Any payment made will be refunded...`,
    })
  }

  const t = await sequelize.transaction()

  try {
    console.log('🔍 Fetching plan + user + role')

    let plan = null
    if (plan_id) {
      plan = await Plan.findOne({ where: { plan_id } }, { transaction: t })
      if (!plan) throw new Error("Plan doesn't exist")
    }

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

    console.log('📆 Computing validity_to')

    let computed_validity_to = validity_to
    if (validity_from) {
      const fromDate = new Date(validity_from)
      const toDate = new Date(fromDate)
      toDate.setDate(fromDate.getDate() + plan.plan_validity_days)
      computed_validity_to = toDate
    }

    console.log('🛠 Creating UserPlan with:', {
      purchase_date,
      validity_from,
      computed_validity_to,
      current_status,
      user_id,
      plan_id,
      transaction_order_id,
    })

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
        transaction_order_id,
        user_type,
      },
      { transaction: t }
    )

    console.log('📚 Creating attendance + quota')

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

    if (current_status === USER_PLAN_ACTIVE) {
      await WatchTimeQuota.create({
        user_plan_id: String(newUserPlan.user_plan_id),
        quota: plan.watch_time_limit,
      })
    }

    await t.commit()

    console.log('✅ User plan registered successfully')

    res.status(HTTP_OK).json({
      message: 'User plan registered successfully',
      newUserPlan,
    })
  } catch (error) {
    console.error('🔥 ERROR in /user-plan/register:', error)

    await t.rollback()

    switch (error.message) {
      case "Plan doesn't exist":
      case "User doesn't exist":
      case "Role doesn't exist":
        return res.status(HTTP_BAD_REQUEST).json({ error: 'Invalid request' })
    }

    // fallback just in case
    return res.status(500).json({ error: 'Server error' })
  }
})

// router.delete("/watch-time-quota-delete-all", async (req, res) => {
// 	//console.log("in delete quota");
// 	try {
// 		// await WatchTimeQuota.deleteMany({});
// 		await WatchTimeLog.deleteMany({});
// 		// await WatchHistory.deleteMany({});
// 		res.status(200).json({ message: "All rows deleted successfully." });
// 	} catch (error) {
// 		console.error(error);
// 		res.status(500).json({ error: "Internal Server Error" });
// 	}
// })

router.put('/update-user-plan', async (req, res) => {
  const {
    user_plan_id,
    purchase_date,
    validity_from,
    validity_to,
    cancellation_date,
    auto_renewal_enabled,
    discount_coupon_id,
    referral_code_id,
    user_id,
    plan_id,
    current_status,
  } = req.body
  if (
    !user_plan_id ||
    !user_id ||
    !plan_id ||
    !validity_from ||
    !validity_to ||
    !purchase_date ||
    !current_status
  )
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Missing required fields' })
  const existingUserPlan = await UserPlan.findByPk(user_plan_id)
  if (!existingUserPlan)
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'UserPlan does not exist.' })
  const t = await sequelize.transaction()
  try {
    let plan = null
    if (plan_id !== '') {
      plan = await Plan.findOne(
        {
          where: { plan_id: plan_id },
          attributes: ['plan_id'],
        },
        { transaction: t }
      )
      if (!plan) throw new Error("Plan doesn't exist")
    }
    const user = await User.findOne(
      {
        where: { user_id: user_id },
        attributes: ['user_id'],
      },
      { transaction: t }
    )
    if (!user) throw new Error("User doesn't exist")
    const updatedUserPlan = await existingUserPlan.update(
      {
        purchase_date: purchase_date,
        validity_from: validity_from,
        validity_to: validity_to,
        cancellation_date: cancellation_date,
        auto_renewal_enabled: auto_renewal_enabled,
        discount_coupon_id: discount_coupon_id,
        referral_code_id: referral_code_id,
        user_id: user_id,
        plan_id: plan_id,
        current_status: current_status,
      },
      {
        where: {
          user_plan_id: user_plan_id,
        },
      },

      { transaction: t }
    )
    const x = await UserInstitutePlanRole.update(
      {
        user_plan_id: user_plan_id,
      },
      {
        where: {
          user_id: user_id,
        },
      }
    )
    await timeout(t.commit(), 5000, new Error('timeout; try again'))
    return res.status(HTTP_OK).json({ userPlan: updatedUserPlan })
  } catch (error) {
    console.error(error)
    await t.rollback()
    switch (error.message) {
      case "Plan doesn't exist":
      case "User doesn't exist":
        return res
          .status(HTTP_BAD_REQUEST)
          .json({ error: 'Missing required fields' })
      default:
        return res
          .status(HTTP_INTERNAL_SERVER_ERROR)
          .json({ error: 'Failed to update user plan' })
    }
  }
})

router.post('/get-user-plan-by-details', async (req, res) => {
  const {
    transaction_order_id,
    current_status,
    user_type,
    user_id,
    plan_id,
    institute_id,
  } = req.body

  if (
    !transaction_order_id ||
    !current_status ||
    !user_type ||
    !user_id ||
    !plan_id ||
    !institute_id
  ) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Missing required fields' })
  }
  try {
    const userPlan = await UserPlan.findAll({
      where: {
        user_id: user_id,
        transaction_order_id: transaction_order_id,
        current_status: current_status,
        user_type: user_type,
        user_id: user_id,
        plan_id: plan_id,
        institute_id: institute_id,
      },
      include: [{ model: User, attributes: ['name'] }],
      order: [['validity_to', 'DESC']],
    })
    //console.log(userPlan, 'IS SENDING!')
    return res.status(HTTP_OK).json({ userPlan: userPlan ? userPlan : null })
  } catch (error) {
    console.error(error)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to fetch user' })
  }
})

router.get('/admin-stats/users-per-plan', async (req, res) => {
  try {
    const usersPerPlan = await UserPlan.findAll({
      attributes: [
        'plan_id',
        [sequelize.fn('COUNT', 'plan_id'), 'Users per Plan'],
      ],
      include: [
        {
          model: Plan,
          foreignKey: 'plan_id',
          attributes: ['name'],
        },
      ],
      group: ['user_plan.plan_id', 'plan.plan_id'],
    })
    res.status(HTTP_OK).json({ usersPerPlan })
  } catch (error) {
    console.error('Error fetching users per plan:', error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Internal Server Error',
    })
  }
})

module.exports = router

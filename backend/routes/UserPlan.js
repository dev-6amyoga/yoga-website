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

    user_type,
  } = req.body
  // console.log(req.body);
  // current_status: 'ACTIVE'
  // discount_coupon_id: 0
  // institute_id: 0
  // is_active: true
  // plan_id: 11
  // purchase_date: '2024-11-30'
  // referral_code_id: 0
  // transaction_order_id: 'MANUAL12/6/2024, 10:25:17 PM'
  // user_id: 18
  // user_type: 'STUDENT'
  // validity_to: '2024-12-30'

  console.log('registering!!')

  if (
    !user_id ||
    !plan_id ||
    !purchase_date ||
    !transaction_order_id ||
    !user_type ||
    institute_id === undefined
  )
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Missing required fields' })

  if (
    current_status === USER_PLAN_ACTIVE &&
    (validity_from === null ||
      validity_from === undefined ||
      validity_to === null ||
      validity_to === undefined)
  ) {
    // if status is active and either valid from or valid to are null;
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Missing required fields' })
  } else if (current_status === USER_PLAN_STAGED) {
  } else {
    if (
      current_status !== USER_PLAN_ACTIVE &&
      current_status !== USER_PLAN_STAGED
    ) {
      return res.status(HTTP_BAD_REQUEST).json({ error: 'Invalid status' })
    }
  }

  const user_plan = await UserPlan.findOne({
    where: {
      user_id: user_id,
      current_status: current_status,
    },
    attributes: ['user_plan_id', 'user_id', 'validity_from', 'validity_to'],
  })

  if (
    user_plan &&
    user_plan.current_status === current_status &&
    current_status === USER_PLAN_ACTIVE
  )
    return res.status(HTTP_BAD_REQUEST).json({
      error: `User already has a plan that is ${current_status}; Any payment made will be refunded to your account in 4 to 5 business days.`,
    })
  const t = await sequelize.transaction()
  try {
    // find plan by id
    let plan = null
    if (plan_id) {
      plan = await Plan.findOne(
        {
          where: { plan_id: plan_id },
        },
        { transaction: t }
      )
      if (!plan) throw new Error("Plan doesn't exist")
    } else {
      throw new Error("Plan doesn't exist")
    }

    // find user by id
    const user = await User.findOne(
      {
        where: { user_id: user_id },
        attributes: ['user_id'],
      },
      { transaction: t }
    )
    if (!user) throw new Error("User doesn't exist")

    const role = await Role.findOne({
      where: { name: user_type },
      attributes: ['role_id'],
    })

    if (!role) throw new Error("Role doesn't exist")

    // create userPlan
    const newUserPlan = await UserPlan.create(
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
        institute_id: institute_id,
        current_status: current_status,
        transaction_order_id: transaction_order_id,
        user_type: user_type,
      },
      { transaction: t }
    )

    // add quota
    if (current_status === USER_PLAN_ACTIVE) {
      await WatchTimeQuota.create({
        user_plan_id: String(newUserPlan.user_plan_id),
        quota: plan.watch_time_limit,
      })

      // const x = await UserInstitutePlanRole.update(
      //   {
      //     user_plan_id: newUserPlan.user_plan_id,
      //   },
      //   {
      //     transaction: t,
      //     where: {
      //       user_id: user_id,
      //       role_id: role.role_id,
      //       institute_id: institute_id,
      //     },
      //   }
      // )

      // if (x[0] === 0) {
      //   throw new Error('Failed to update user')
      // }
    }

    await t.commit()
    return res.status(HTTP_OK).json({ userPlan: newUserPlan })
  } catch (error) {
    console.error(error)
    await t.rollback()
    switch (error.message) {
      case "Plan doesn't exist":
      case "User doesn't exist":
        return res.status(HTTP_BAD_REQUEST).json({ error: 'Invalid request' })
    }
  }
})

// router.delete("/watch-time-quota-delete-all", async (req, res) => {
// 	console.log("in delete quota");
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
    console.log(userPlan, 'IS SENDING!')
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

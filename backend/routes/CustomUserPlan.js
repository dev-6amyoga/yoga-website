const express = require('express')
const router = express.Router()
const CustomUserPlan = require('../models/mongo/CustomUserPlan')
const {
  HTTP_OK,
  HTTP_NOT_FOUND,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_BAD_REQUEST,
} = require('../utils/http_status_codes')
const { authenticateToken } = require('../utils/jwt')
const CustomPlan = require('../models/mongo/CustomPlan')
const {
  USER_PLAN_ACTIVE,
  USER_PLAN_STAGED,
} = require('../enums/user_plan_status')
const WatchTimeQuota = require('../models/mongo/WatchTimeQuota')

router.post('/register', authenticateToken, async (req, res) => {
  const {
    plan_id,
    institute_id,

    purchase_date,
    validity_from = null,
    validity_to = null,

    // cancellation_date,
    auto_renewal_enabled = false,

    discount_coupon_id,
    referral_code_id,

    current_status,
    transaction_order_id,

    user_type,
  } = req.body

  const { user_id } = req.user

  console.log(req.body)

  // check request body

  if (
    user_id === null ||
    user_id === undefined ||
    !plan_id ||
    institute_id === undefined ||
    !purchase_date ||
    !current_status ||
    !transaction_order_id ||
    !user_type
  ) {
    console.log('Missing required fields1')

    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: 'Missing required fields' })
  }

  // mongodb object id is string
  if (typeof plan_id !== 'string') {
    console.log('Missing required fields2')

    return res.status(HTTP_BAD_REQUEST).json({
      message: 'Invalid plan_id',
    })
  }

  if (
    current_status === USER_PLAN_ACTIVE &&
    (validity_from === null ||
      validity_from === undefined ||
      validity_to === null ||
      validity_to === undefined)
  ) {
    console.log('Missing required fields3')
    // if status is active and either valid from or valid to are null;

    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Missing required fields' })
  } else if (current_status === USER_PLAN_STAGED) {
  } else {
    console.log('INVALID STATUS', current_status)
    if (
      current_status !== USER_PLAN_ACTIVE &&
      current_status !== USER_PLAN_STAGED
    ) {
      return res.status(HTTP_BAD_REQUEST).json({ error: 'Invalid status' })
    }
  }

  const customUserPlanSession = await CustomUserPlan.startSession()
  const watchTimeQuotaSession = await WatchTimeQuota.startSession()
  customUserPlanSession.startTransaction()
  watchTimeQuotaSession.startTransaction()

  try {
    // check if plan exists with same status
    if (current_status === USER_PLAN_ACTIVE) {
      const existingPlan = await CustomUserPlan.findOne({
        user_id,
        plan_id,
        current_status,
      })

      if (existingPlan) {
        await customUserPlanSession.abortTransaction()
        await watchTimeQuotaSession.abortTransaction()
        await customUserPlanSession.endSession()
        await watchTimeQuotaSession.endSession()

        return res
          .status(HTTP_BAD_REQUEST)
          .json({ error: 'Plan already exists with same status' })
      }
    }

    // check if plan exists
    const planExists = await CustomPlan.findOne({
      _id: plan_id,
    })

    if (!planExists) {
      await customUserPlanSession.abortTransaction()
      await watchTimeQuotaSession.abortTransaction()
      await customUserPlanSession.endSession()
      await watchTimeQuotaSession.endSession()

      return res.status(HTTP_BAD_REQUEST).json({
        error: 'Plan does not exist',
      })
    }

    // create new custom user plan
    const newCustomPlan = new CustomUserPlan({
      custom_plan_id: plan_id,
      user_id,
      purchase_date,
      validity_from,
      validity_to,
      transaction_order_id,
      current_status,
      auto_renewal_enabled,
      user_type,
    })

    const saveCustomPlan = await newCustomPlan.save({
      session: customUserPlanSession,
    })

    // add quota
    if (current_status === USER_PLAN_ACTIVE) {
      await WatchTimeQuota.create(
        {
          user_plan_id: String(newUserPlan.user_plan_id),
          quota: plan.watch_time_limit,
        },
        { session: watchTimeQuotaSession }
      )
    }

    await customUserPlanSession.commitTransaction()
    await watchTimeQuotaSession.commitTransaction()
    await customUserPlanSession.endSession()
    await watchTimeQuotaSession.endSession()

    res.status(HTTP_OK).json(saveCustomPlan)
  } catch (error) {
    await customUserPlanSession.abortTransaction()
    await watchTimeQuotaSession.abortTransaction()
    await customUserPlanSession.endSession()
    await watchTimeQuotaSession.endSession()

    console.error('Error saving new custom user plan:', error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to save new custom user plan',
    })
  }
})

router.get('/getCustomUserPlansByUser/:user_id', async (req, res) => {
  try {
    const userId = parseInt(req.params.user_id)
    const customUserPlans = await CustomUserPlan.find({ user_id: userId })
    if (customUserPlans.length > 0) {
      res.status(HTTP_OK).json({
        plans: customUserPlans,
        message: 'Custom plans for user exist',
      })
    } else {
      res.status(HTTP_OK).json({
        message: 'No custom plans found for the given user ID',
      })
    }
  } catch (error) {
    console.error('Error fetching custom plans for user:', error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch custom plans for user',
    })
  }
})

router.get('/getAllCustomUserPlans', async (req, res) => {
  try {
    const customUserPlans = await CustomUserPlan.find()
    if (customUserPlans.length > 0) {
      res.status(HTTP_OK).json({
        plans: customUserPlans,
        message: 'All Custom User Plans',
      })
    } else {
      res.status(HTTP_OK).json({
        message: 'No Custom User Plans',
      })
    }
  } catch (error) {
    console.error('Error fetching custom user plans:', error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch custom user plans',
    })
  }
})

// router.put("/editCustomPlan/:id", async (req, res) => {
//   try {
//     const planId = req.params.id;
//     const updateData = req.body;
//     const updatedCustomPlan = await CustomPlan.findByIdAndUpdate(
//       planId,
//       updateData,
//       { new: true }
//     );
//     if (updatedCustomPlan) {
//       res.status(HTTP_OK).json(updatedCustomPlan);
//     } else {
//       res.status(HTTP_NOT_FOUND).json({
//         error: "Custom plan not found",
//       });
//     }
//   } catch (error) {
//     console.error("Error updating custom plan:", error);
//     res.status(HTTP_INTERNAL_SERVER_ERROR).json({
//       error: "Failed to update custom plan",
//     });
//   }
// });

// router.get("/getAllCustomPlans", async (req, res) => {
//   try {
//     const customPlans = await CustomPlan.find({});
//     res.status(HTTP_OK).json(customPlans);
//   } catch (error) {
//     console.error("Error fetching custom plans:", error);
//     res.status(HTTP_INTERNAL_SERVER_ERROR).json({
//       error: "Failed to fetch custom plans",
//     });
//   }
// });

router.get('/admin-stats/users-per-plan', async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$custom_plan_id',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'custom_plan',
          localField: '_id',
          foreignField: '_id',
          as: 'plan',
        },
      },
      {
        $unwind: '$plan',
      },
      {
        $project: {
          _id: 0,
          plan_name: '$plan.plan_name',
          plan_id: '$plan._id',
          'Users per Plan': '$count',
          count: 1,
        },
      },
    ]

    const usersPerPlan = await CustomUserPlan.aggregate(pipeline)

    res.status(HTTP_OK).json({ usersPerPlan })
  } catch (error) {
    console.error('Error fetching user per plan:', error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch user per plan',
    })
  }
})

module.exports = router

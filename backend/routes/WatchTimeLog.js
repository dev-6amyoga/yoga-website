const express = require('express')

const eta = require('eta')

const router = express.Router()
const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require('../utils/http_status_codes')
const WatchTimeLog = require('../models/mongo/WatchTimeLog')
const WatchTimeQuota = require('../models/mongo/WatchTimeQuota')
const {
  GetCurrentUserPlan,
  GetPlanForWatchQuotaDeduction,
  UpdateUserPlanStatus,
  GetCurrentCustomUserPlans,
} = require('../services/UserPlan.service')
const { UserPlan } = require('../models/sql/UserPlan')
const { authenticateToken } = require('../utils/jwt')
const { USER_PLAN_EXPIRED_BY_USAGE } = require('../enums/user_plan_status')
const { sequelize } = require('../init.sequelize')
const { default: mongoose } = require('mongoose')
const { x } = require('pdfkit')
const {
  GetWatchTimePerYearMonthStats,
  GetCurrentMonthUsage,
} = require('../services/WatchTimeLog.service')

router.post('/update', authenticateToken, async (req, res) => {
  console.log('WatchTime /update')
  const { institute_id, watch_time_logs, updated_at, playlist_id } = req.body

  console.log(req.body)

  const { user_id } = req.user

  // validate request
  if (!user_id || !watch_time_logs || institute_id === undefined) {
    console.log('Missing required fields')
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: 'Missing required fields' })
  }

  // console.log(GetCurrentUserPlan(user_id);
  const session = await WatchTimeLog.startSession()
  session.startTransaction()

  try {
    // get user plan
    // console.log("GetCurrentUserPlan");
    let [user_plan, error] = await GetPlanForWatchQuotaDeduction(
      user_id,
      institute_id,
      playlist_id,
      null,
      session
    )
    // console.log({ user_plan, error });

    if (!user_plan || error) {
      console.log('User currenly has no active plan')
      await session.abortTransaction()
      await session.endSession()
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: error || 'User currenly has no active plan' })
    }

    console.log('User plan found', user_plan)

    // reduce it to unique asana_id, playlist_id
    let reduced_watch_time = []
    let total_watch_time = 0

    watch_time_logs.forEach((wtl) => {
      const idx = reduced_watch_time.findIndex(
        (x) => x.asana_id === wtl.asana_id && x.playlist_id === wtl.playlist_id
      )

      total_watch_time += wtl.timedelta

      if (idx === -1) {
        const { timedelta, ...w } = wtl
        w.duration = timedelta
        w.updated_at = updated_at ?? new Date()
        reduced_watch_time.push(w)
      } else {
        if (wtl.timedelta > 0) {
          if (reduced_watch_time[idx].duration) {
            reduced_watch_time[idx].duration += wtl.timedelta
          } else {
            reduced_watch_time[idx].duration = wtl.timedelta
          }
        }
      }
    })

    // console.log({ reduced_watch_time, total_watch_time });

    /*
		{
			user_id,
			asana_id,
			playlist_id,
			duration
		}
		*/

    const promises = []
    reduced_watch_time.forEach((wtl) => {
      // update watch time logs
      // TODO : make watch time log per day?
      promises.push(
        WatchTimeLog.updateOne(
          {
            user_id: wtl.user_id,
            asana_id: wtl.asana_id,
            playlist_id: wtl.playlist_id,
            user_plan_id: user_plan?.user_plan_id,
          },
          [
            {
              $project: {
                ...wtl,
                duration: {
                  $add: [{ $ifNull: ['$duration', 0] }, wtl.duration],
                },
                created_at: true,
              },
            },
          ],
          { upsert: true }
        )
      )
    })

    let quota = user_plan?.plan?.watch_time_limit || user_plan?.plan?.watchHours

    let user_plan_id = user_plan?.user_plan_id || user_plan?._id

    // console.log(user_plan_id, {
    // 	user_plan_id:
    // 		typeof user_plan_id === "number"
    // 			? String(user_plan_id)
    // 			: new mongoose.Types.ObjectId(user_plan_id).toString(),
    // });

    let updatedWatchTimeQuota = await WatchTimeQuota.findOneAndUpdate(
      {
        user_plan_id:
          typeof user_plan_id === 'number'
            ? String(user_plan_id)
            : typeof user_plan_id === 'string'
              ? user_plan_id
              : user_plan_id.toString(),
      },
      [
        {
          $project: {
            user_plan_id: true,
            quota: {
              $subtract: [{ $ifNull: ['$quota', quota] }, total_watch_time],
            },
            __v: true,
          },
        },
      ],
      { upsert: false, returnDocument: 'after', lean: true }
    )

    // console.log({ updatedWatchTimeQuota });

    if (!updatedWatchTimeQuota) {
      await session.abortTransaction()
      await session.endSession()

      return res.status(HTTP_BAD_REQUEST).json({
        message: 'Could not update watch time quota',
      })
    } else {
      // TODO : where to commit, do we show extra usage or show lesser usage
      await session.commitTransaction()
      if (updatedWatchTimeQuota.quota < 0) {
        // update expiry
        const t = await sequelize.transaction()
        // const up = await UserPlan.findOne({
        // 	where: { user_plan_id: user_plan.user_plan_id },
        // });
        try {
          user_plan.current_status = USER_PLAN_EXPIRED_BY_USAGE
          await user_plan.save()
          await t.commit()
          await session.endSession()

          return res.status(HTTP_BAD_REQUEST).json({
            message: 'Watch time quota exceeded',
            data: { committed: true },
          })
        } catch (err) {
          console.log(err)
          await t.rollback()
          await session.endSession()

          return res.status(HTTP_BAD_REQUEST).json({
            message: 'Watch time quota exceeded',
            data: { committed: false },
          })
        }
      }

      await Promise.all(promises)

      await session.commitTransaction()

      await session.endSession()

      return res.status(HTTP_OK).json({ reduced_watch_time })
    }
  } catch (error) {
    await session.abortTransaction()
    await session.endSession()
    console.log(error)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({ message: error })
  }
})

router.post('/update-teacher', authenticateToken, async (req, res) => {})

router.post('/update-institute', authenticateToken, async (req, res) => {})

router.post('/get-logs', async (req, res) => {
  const { user_id, from_date, to_date } = req.body

  if (!user_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: 'Missing required fields' })
  }

  try {
    let watchTimeLog
    if (!from_date || !to_date) {
      watchTimeLog = await WatchTimeLog.find({ user_id })
    } else {
      watchTimeLog = await WatchTimeLog.find({
        user_id,
        created_at: {
          $gte: from_date || new Date(),
          $lte: to_date || new Date(),
        },
      })
    }
    return res.status(HTTP_OK).json({ watchTimeLog })
  } catch (err) {
    console.log(err)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ message: 'Something went wrong' })
  }
})

router.post('/get-stats', async (req, res) => {
  const { user_id } = req.body

  if (!user_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: 'Missing required fields' })
  }

  try {
    let watchTimeLog = await WatchTimeLog.find({
      user_id,
    })

    if (!watchTimeLog) {
      return res.status(HTTP_OK).json({ watchTimeAll: 0, watchTimeToday: 0 })
    }

    // total of all time
    let watchTimeAll = watchTimeLog.reduce((acc, wtl) => {
      return acc + wtl.duration
    }, 0)

    // total for today
    let watchTimeToday = watchTimeLog.reduce((acc, wtl) => {
      if (wtl.created_at > new Date().setHours(0, 0, 0, 0)) {
        return acc + wtl.duration
      }
      return acc
    }, 0)

    let [watchTimePerMonth, error] =
      await GetWatchTimePerYearMonthStats(user_id)

    if (error) {
      return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
        message: 'something went wrong',
      })
    }

    return res.status(HTTP_OK).json({
      watchTimeToday: watchTimeToday,
      watchTimeAll: watchTimeAll,
      watchTimePerMonth,
    })
  } catch (err) {
    console.log(err)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ message: 'Something went wrong' })
  }
})

router.post('/get-quota', async (req, res) => {
  const { user_id } = req.body

  if (!user_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: 'Missing required fields' })
  }

  try {
    let [user_plan, error] = await GetCurrentUserPlan(user_id)

    user_plan = user_plan?.toJSON()

    if (error && error !== 'User does not have a plan') {
      return res.status(HTTP_BAD_REQUEST).json({ message: error })
    }

    let [custom_user_plans, error2] = await GetCurrentCustomUserPlans(user_id)

    // custom_user_plans = custom_user_plans.map((x) => x.toJson());

    if (error2) {
      return res.status(HTTP_BAD_REQUEST).json({ message: error2 })
    }

    let quota = await WatchTimeQuota.find(
      {
        user_plan_id: {
          $in: [
            String(user_plan?.user_plan_id),
            ...custom_user_plans.map((p) => p._id),
          ],
        },
      },
      {},
      { lean: true }
    )

    if (!quota) {
      return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
        message: 'Could not fetch watch time quota',
      })
    }

    quota = quota.map((x) => {
      return {
        ...x,
        quota: +x.quota.toString(),
      }
    })

    // map of user plan ids and their quotas

    quota.forEach((q) => {
      // console.log(q.user_plan_id);
      if (mongoose.isValidObjectId(q.user_plan_id)) {
        let idx = custom_user_plans.findIndex(
          (x) => x._id.toString() === q.user_plan_id
        )
        if (idx !== -1) {
          custom_user_plans[idx].quota = q.quota
        }
        // console.log(idx, custom_user_plans);
      } else {
        if (user_plan) {
          user_plan.quota = q.quota
        }
      }
    })

    return res.status(HTTP_OK).json({ user_plan, custom_user_plans })
  } catch (err) {
    console.log(err)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ message: 'Something went wrong' })
  }
})

router.post('/get-plan', async (req, res) => {
  const { user_id, institute_id = null, playlist_id } = req.body

  if (
    user_id === null ||
    user_id === undefined ||
    playlist_id === null ||
    playlist_id === undefined
  ) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: 'Missing required fields' })
  }

  try {
    const [plan, error] = await GetPlanForWatchQuotaDeduction(
      user_id,
      institute_id,
      playlist_id
    )

    if (error) {
      return res.status(HTTP_BAD_REQUEST).json({ message: error })
    }

    return res.status(HTTP_OK).json({ plan })
  } catch (err) {
    console.log(err)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ message: 'Something went wrong' })
  }
})

router.post('/update-userplan', async (req, res) => {
  const { user_id } = req.body

  if (!user_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: 'Missing required fields' })
  }

  try {
    const [user_plan, error] = await UpdateUserPlanStatus(user_id, null)

    if (error) {
      return res.status(HTTP_BAD_REQUEST).json({ message: error })
    }

    return res.status(HTTP_OK).json({ user_plan })
  } catch (err) {
    console.log(err)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ message: 'Something went wrong' })
  }
})

router.get('/all-watch-time-log', async (req, res) => {
  try {
    const allWatchHistory = await WatchTimeLog.find()
    res.json(allWatchHistory)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ADMIN stats

router.get('/time-statistics', async (req, res) => {
  try {
    const allWatchTime = await WatchTimeLog.find(
      { asana_id: { $ne: null } },
      { asana_id: 1, duration: 1, _id: 0 }
    )
    const aggregatedData = allWatchTime.reduce((acc, curr) => {
      const { asana_id, duration } = curr
      if (acc[asana_id]) {
        acc[asana_id].push({ duration })
      } else {
        acc[asana_id] = [{ duration }]
      }
      return acc
    }, {})

    // Convert aggregated data to the desired format
    const result = Object.keys(aggregatedData).map((asana_id) => ({
      label: `Asana ${asana_id}`,
      data: aggregatedData[asana_id],
    }))

    res.json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/admin-stats/current-month-usage', async (req, res) => {
  try {
    const [currentMonthUsage, error] = await GetCurrentMonthUsage()

    if (error) {
      return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
        message: error,
      })
    }

    return res.status(HTTP_OK).json({ currentMonthUsage })
  } catch (error) {
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ message: error.message })
  }
})

router.get('/admin-stats/per-month-usage', async (req, res) => {
  try {
    const [watchTimePerMonth, error] = await GetWatchTimePerYearMonthStats()

    if (error) {
      return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
        message: error,
      })
    }

    return res.status(HTTP_OK).json({ watchTimePerMonth })
  } catch (error) {
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ message: error.message })
  }
})

router.get('/admin-stats/unused-hours', async (req, res) => {
  try {
    return res.status(HTTP_OK).json({ data: [] })
  } catch (error) {
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ message: error.message })
  }
})

module.exports = router

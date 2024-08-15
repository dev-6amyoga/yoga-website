const os = require('node:os')
const process = require('node:process')
const { parentPort } = require('node:worker_threads')
const Class = require('../models/mongo/Class')

const { SchedulerJobRun } = require('../models/sql/SchedulerJobRun')
const { JOB_TYPE_SCHEDULE_CLASSES } = require('../enums/job_type')
const job_status = require('../enums/job_status')
const ClassHistory = require('../models/mongo/ClassHistory')
const {
  set,
  add,
  startOfDay,
  endOfDay,
  getDay,
  getDate,
  lastDayOfMonth,
} = require('date-fns')
const { default: mongoose } = require('mongoose')

let isCancelled = false

// const concurrency = os.cpus().length

async function scheduleClass(class_) {
  if (isCancelled) return

  try {
    // calculate start time and end time based on timezone

    const start_time_parts = class_.recurring_class_start_time
      .split(':')
      .map((x) => parseInt(x, 10))
    const end_time_parts = class_.recurring_class_end_time
      .split(':')
      .map((x) => parseInt(x, 10))

    const base_date = startOfDay(new Date())

    const start_time = add(base_date, {
      hours: start_time_parts[0],
      minutes: start_time_parts[1],
      seconds: start_time_parts[2],
    })
    const end_time = add(base_date, {
      hours: end_time_parts[0],
      minutes: end_time_parts[1],
      seconds: end_time_parts[2],
    })

    // create a class history record
    await ClassHistory.create({
      class_id: class_._id,
      class_name: class_.class_name,
      class_description: class_.class_description,
      teacher_id: class_.teacher_id,
      start_time,
      end_time,
    })

    console.log('[schedule-classes] Scheduled class:', class_)
  } catch (error) {
    console.error(error)
    throw error
  }
}

// handle cancellation (this is a very simple example)
if (parentPort) {
  parentPort.once('message', (message) => {
    //
    // TODO: once we can manipulate concurrency option to p-map
    // we could make it `Number.MAX_VALUE` here to speed cancellation up
    // <https://github.com/sindresorhus/p-map/issues/28>
    //
    if (message === 'cancel') isCancelled = true
  })
}

;(async () => {
  try {
    const mongoURI = process.env.MONGO_SRV_URL

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    const today = new Date()
    console.log("[schedule-classes] Today's date:", today)
    // let job_id = null

    // create a job record
    const job = await SchedulerJobRun.create({
      job_name: JOB_TYPE_SCHEDULE_CLASSES,
      job_run_start_time: new Date().toISOString(),
    })

    try {
      // find all classes which are recurring and have not been scheduled for the day
      // create class history records
      const classes_to_be_scheduled = await Class.aggregate(
        [
          {
            $match: {
              class_type: 'CLASS_TYPE_RECURRING',
              recurrance_type: {
                $in: [
                  'CLASS_RECURRANCE_TYPE_DAILY',
                  'CLASS_RECURRANCE_TYPE_WEEKLY',
                  'CLASS_RECURRANCE_TYPE_MONTHLY',
                ],
              },
              status: 'CLASS_METADATA_ACTIVE',
            },
          },
          {
            $lookup: {
              from: 'class_history',
              localField: '_id',
              foreignField: 'class_id',
              as: 'class_history',
              pipeline: [
                {
                  $match: {
                    created_at: {
                      $gte: startOfDay(today),
                      $lt: endOfDay(today),
                    },
                  },
                },
                {
                  $limit: 1,
                },
              ],
            },
          },
          {
            $match: {
              class_history: { $size: 0 },
            },
          },
        ],
        {}
      )

      // filter those classes based on recurrence type and schedule them

      const current_day_of_week = getDay(today)
      const current_day_of_month = today.getDate()
      console.log({
        current_day_of_week,
        current_day_of_month,
      })

      const final_classes_to_be_scheduled = classes_to_be_scheduled.filter(
        (c) => {
          // if daily, schedule all classes
          // if weekly, schedule classes based on day of the week
          // if monthly, schedule classes based on day of the month

          if (c.recurrance_type === 'CLASS_RECURRANCE_TYPE_DAILY') return true

          if (c.recurrance_type === 'CLASS_RECURRANCE_TYPE_WEEKLY') {
            return c.recurrance_days.includes(String(current_day_of_week))
          }

          if (c.recurrance_type === 'CLASS_RECURRANCE_TYPE_MONTHLY') {
            return (
              c.recurrance_date === current_day_of_month ||
              (c.recurrance_date === 'LAST_DAY' &&
                current_day_of_month === getDate(lastDayOfMonth(today)))
            )
          }

          return false
        }
      )

      console.log(final_classes_to_be_scheduled)

      const promises = final_classes_to_be_scheduled.map(
        async (class_to_be_scheduled) => {
          await scheduleClass(class_to_be_scheduled)
        }
      )

      await Promise.all(promises)

      // mark the job as done

      const update = await SchedulerJobRun.update(
        {
          job_status: job_status.JOB_STATUS_COMPLETED,
          job_run_end_time: new Date().toISOString(),
        },
        {
          where: {
            scheduler_job_id: job.get('scheduler_job_id'),
          },
        }
      )

      console.log('[schedule-classes] marking job as done', update)

      if (update === 0) {
        throw new Error('Failed to mark job as done')
      }

      // signal to parent that the job is done
      if (parentPort) parentPort.postMessage('done')
      else process.exit(0)
    } catch (error) {
      console.error(error)

      // mark the job as failed
      job.setAttributes('job_status', job_status.JOB_STATUS_FAILED)
      job.setAttributes('job_error', error)
      await job.save()

      process.exit(1)
    }
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
})()

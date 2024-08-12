const os = require('node:os')
const process = require('node:process')
const { parentPort } = require('node:worker_threads')
const Class = require('../models/mongo/Class')

const { SchedulerJobRun } = require('../models/sql/SchedulerJobRun')
const { JOB_TYPE_SCHEDULE_CLASSES } = require('../enums/job_type')
const job_status = require('../enums/job_status')
const ClassHistory = require('../models/mongo/ClassHistory')

let isCancelled = false

// const concurrency = os.cpus().length

async function scheduleClass(class_) {
  if (isCancelled) return

  // calculate start time and end time based on timezone

  // create a class history record
  const class_history = await ClassHistory.create({
    class_id: class_._id,
    class_name: class_.class_name,
    class_description: class_.class_description,
    teacher_id: class_.teacher_id,
  })
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
                      $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                      $lt: new Date(new Date().setHours(23, 59, 59, 999)),
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

      // console.log(classes_to_be_scheduled)

      const promises = classes_to_be_scheduled.map(
        async (class_to_be_scheduled) => {
          await scheduleClass(class_to_be_scheduled)
        }
      )

      await Promise.all(promises)

      // mark the job as done
      job.setAttributes('job_status', job_status.JOB_STATUS_COMPLETED)
      await job.save()

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

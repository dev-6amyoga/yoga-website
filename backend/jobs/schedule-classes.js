const os = require('node:os')
const process = require('node:process')
const { parentPort } = require('node:worker_threads')
const ClassHistory = require('../models/mongo/ClassHistory')
const Class = require('../models/mongo/Class')
const { CLASS_TYPE_RECURRING } = require('../enums/class_metadata_class_type')
const {
  CLASS_RECURRANCE_TYPE_DAILY,
  CLASS_RECURRANCE_TYPE_MONTHLY,
  CLASS_RECURRANCE_TYPE_WEEKLY,
} = require('../enums/class_metadata_recurrance_type')
const {
  CLASS_METADATA_INACTIVE,
  CLASS_METADATA_ACTIVE,
} = require('../enums/class_metadata_status')
const { SchedulerJobRun } = require('../models/sql/SchedulerJobRun')
const { JOB_TYPE_SCHEDULE_CLASSES } = require('../enums/job_type')
const job_status = require('../enums/job_status')

let isCancelled = false

const concurrency = os.cpus().length

async function scheduleClass() {
  if (isCancelled) return
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
      const classes_to_be_scheduled = await Class.find(
        {
          class_type: CLASS_TYPE_RECURRING,
          recurrance_type: {
            $in: [
              CLASS_RECURRANCE_TYPE_DAILY,
              CLASS_RECURRANCE_TYPE_WEEKLY,
              CLASS_RECURRANCE_TYPE_MONTHLY,
            ],
          },
          status: CLASS_METADATA_ACTIVE,
        },
        {}
      )

      console.log(classes_to_be_scheduled)

      // const promises = classes_to_be_scheduled.map(
      //   async (class_to_be_scheduled) => {
      //     await scheduleClass(class_to_be_scheduled)
      //   }
      // )

      // await Promise.all(promises)

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

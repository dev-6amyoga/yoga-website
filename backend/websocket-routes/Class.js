const { default: mongoose } = require('mongoose')
const {
  EVENT_QUEUE,
  EVENT_QUEUE_PUSH,
  EVENT_QUEUE_POP,
  EVENT_QUEUE_CLEAR,
} = require('../enums/event')
const ClassHistory = require('../models/mongo/ClassHistory')

const handleTeacherConnection = (ws) => {
  ws.on('message', async (msg) => {
    console.log('[WS] /teacher : ping', msg)
    // parse message

    const event = JSON.parse(msg)

    const { type, data, event_time, class_id: class_history_id } = event

    if (
      !type ||
      !data ||
      !event_time ||
      class_history_id === undefined ||
      class_history_id === null
    ) {
      return ws.send(
        JSON.stringify({
          type: 'error',
          data: 'Invalid message',
        })
      )
    }

    console.log('here1', type, data, event_time, class_history_id)

    const mt = await mongoose.startSession()

    mt.startTransaction()

    try {
      // find class history object
      console.log('here2')

      const { sub_type, data: sub_type_data } = data

      if (type === EVENT_QUEUE) {
        if (sub_type === EVENT_QUEUE_PUSH) {
          const classHistory = await ClassHistory.findOneAndUpdate(
            { _id: class_history_id },
            {
              $push: {
                actions_queue: {
                  event_time,
                  data: sub_type_data,
                  sub_type,
                },
              },
            },
            { session: mt }
          )

          if (!classHistory) {
            console.log('here4')
            await mt.abortTransaction()
            await mt.endSession()
            ws.send(
              JSON.stringify({
                type: 'error',
                data: 'Class history not found',
              })
            )

            console.log('here5')

            return null
          }
        } else if (sub_type === EVENT_QUEUE_POP) {
          console.log('--pop')
        } else if (type === EVENT_QUEUE_CLEAR) {
          console.log('--clear')
        } else {
          console.log('here6')
          await mt.abortTransaction()
          await mt.endSession()
          ws.send(
            JSON.stringify({
              type: 'error',
              data: 'Invalid event type',
            })
          )

          return null
        }
      }
      await mt.commitTransaction()
      await mt.endSession()

      return null
    } catch (error) {
      console.error(error)
      await mt.abortTransaction()
      await mt.endSession()
      ws.send(
        JSON.stringify({
          type: 'error',
          data: 'Internal server error',
        })
      )

      return null
    }
  })

  ws.on('open', () => {
    console.log('[WS] /teacher : open')
  })
}

const handleStudentConnection = (ws) => {
  ws.on('message', (msg) => {
    console.log('[WS] /student : ping', msg)
  })

  ws.on('open', () => {
    console.log('[WS] /student : open')
  })
}

module.exports = {
  handleTeacherConnection,
  handleStudentConnection,
}

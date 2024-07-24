const express = require('express')

const router = express.Router()

router.ws('/teacher', (ws) => {
  ws.on('message', (msg) => {
    // parse message

    // let event = JSON.parse(msg)

    console.log('[WS] /teacher : ping', msg)

    // find class history object
  })
})

router.ws('/student', (ws) => {
  ws.on('message', (msg) => {
    console.log('[WS] /student : ping', msg)
  })
})

module.exports = router

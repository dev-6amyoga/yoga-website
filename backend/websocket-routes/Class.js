const handleTeacherConnection = (ws) => {
  ws.on('message', (msg) => {
    // parse message

    // let event = JSON.parse(msg)

    console.log('[WS] /teacher : ping', msg)

    // find class history object
  })
}

const handleStudentConnection = (ws) => {
  ws.on('message', (msg) => {
    console.log('[WS] /student : ping', msg)
  })
}

module.exports = {
  handleTeacherConnection,
  handleStudentConnection,
}

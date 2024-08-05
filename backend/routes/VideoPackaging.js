const express = require('express')
const router = express.Router()
const { execSync } = require('child_process')
const ffprobePath = require('ffprobe-static').path
const { exec } = require('child_process')
const path = require('path')

router.post('/run-bat', (req, res) => {
  console.log('in run bat')
  const batFilePath = path.join(__dirname, 'script.bat')
  exec(batFilePath, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return res.status(500).send(`Error: ${error.message}`)
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`)
      return res.status(500).send(`Error: ${stderr}`)
    }
    console.log(`stdout: ${stdout}`)
    res.send(`Success: ${stdout}`)
  })
})

router.get('/get-dir', (req, res) => {
  let dir1 = __dirname
  return res.status(200).send(dir1)
})

module.exports = router

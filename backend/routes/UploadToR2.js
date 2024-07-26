const express = require('express')
const { cloudflareAddFileToBucket } = require('../utils/R2Client')

const router = express.Router()

const multer = require('multer')

const storage = multer.memoryStorage()

const upload = multer({ storage })

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { filename } = req.body

    // if (!filename || !body) {
    //   return res.status(400).json({
    //     message: 'Invalid request',
    //   })
    // }

    await cloudflareAddFileToBucket(
      'yoga-video-recordings',
      filename,
      req.file.buffer
    )

    return res.status(200).json({
      message: 'File uploaded successfully',
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: 'File upload failed',
    })
  }
})

module.exports = router

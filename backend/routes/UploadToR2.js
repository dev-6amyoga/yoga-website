const express = require('express')
const { cloudflareAddFileToBucket } = require('../utils/R2Client')
const { cloudflareGetFile } = require('../utils/R2Client')
const { cloudflareListDir } = require('../utils/R2Client')
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

router.get('/videos', async (req, res) => {
  try {
    const prefix = ''
    const { contents, nextContinuationToken } = await cloudflareListDir(prefix)
    console.log(contents)
    return res.status(200).json({
      message: 'Files fetched successfully',
      data: contents,
      nextContinuationToken,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: 'Failed to fetch files',
    })
  }
})

router.get('/videos/:filename', async (req, res) => {
  try {
    const { filename } = req.params
    const fileStream = await cloudflareGetFile(filename)
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
    res.setHeader('Content-Type', 'video/mp4')
    res.send(fileStream)
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: 'Failed to download file',
    })
  }
})

module.exports = router

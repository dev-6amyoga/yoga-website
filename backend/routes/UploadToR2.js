const express = require('express')
const { cloudflareAddFileToBucket } = require('../utils/R2Client')
const { cloudflareGetFile } = require('../utils/R2Client')
const { cloudflareListDir } = require('../utils/R2Client')
const router = express.Router()

const multer = require('multer')
const {
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require('../utils/http_status_codes')

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

    return res.status(HTTP_OK).json({
      message: 'File uploaded successfully',
    })
  } catch (err) {
    console.error(err)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      message: 'File upload failed',
    })
  }
})

router.get('/videos', async (req, res) => {
  try {
    const prefix = ''
    const resp = await cloudflareListDir('yoga-video-recordings', prefix)

    return res.status(HTTP_OK).json({
      message: 'Files fetched successfully',
      videos: resp.Contents,
    })
  } catch (err) {
    console.error(err)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      message: 'Failed to fetch files',
    })
  }
})

router.get('/videos/:filename', async (req, res) => {
  try {
    const { filename } = req.params
    const response = await cloudflareGetFile(
      'yoga-video-recordings',
      filename,
      'video/mp4'
    )
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
    res.setHeader('Content-Type', 'video/mp4')
    response.pipe(res)
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: 'Failed to download file',
    })
  }
})

module.exports = router

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

const zlib = require('zlib')

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { filename, compressed } = req.body

    // console.log('[/upload] : body', req.body)

    if (compressed) {
      console.log('[/upload] : compressed', req.file.buffer.byteLength)
      // decompress the file
      // const compressedBlob = new Blob([req.file.buffer])

      // const decompressedBlob = await new Response(
      //   compressedBlob.stream().pipeThrough(new DecompressionStream('gzip'))
      // ).blob()

      const decompressedBuffer = zlib.gunzipSync(req.file.buffer)

      // const decompressedBuffer = await decompressedBlob.arrayBuffer()
      console.log(decompressedBuffer.byteLength)

      await cloudflareAddFileToBucket(
        'yoga-video-recordings',
        filename,
        decompressedBuffer.buffer,
        'video/mp4'
      )

      return res.status(HTTP_OK).json({
        message: 'File uploaded successfully',
      })
    }

    // if (!filename || !body) {
    //   return res.status(400).json({
    //     message: 'Invalid request',
    //   })
    // }

    await cloudflareAddFileToBucket(
      'yoga-video-recordings',
      filename,
      req.file.buffer,
      'video/mp4'
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
    const fileStream = await cloudflareGetFile(
      'yoga-video-recordings',
      filename,
      'application/octet-stream'
    )

    // res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
    // res.setHeader('Content-Type', 'video/mp4')

    res.setHeader('Content-Type', 'application/octet-stream')

    return res.send(Buffer.from(fileStream))
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: 'Failed to download file',
    })
  }
})

module.exports = router

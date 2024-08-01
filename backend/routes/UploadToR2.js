const express = require('express')
const { cloudflareAddFileToBucket } = require('../utils/R2Client')
const { cloudflareGetFile } = require('../utils/R2Client')
const { cloudflareListDir } = require('../utils/R2Client')
const router = express.Router()
const { spawn } = require('child_process')

const multer = require('multer')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const path = require('path')

const {
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require('../utils/http_status_codes')

const storage = multer.memoryStorage()

const upload = multer({ storage })

const zlib = require('zlib')

// router.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//     const { filename, compressed } = req.body

//     // console.log('[/upload] : body', req.body)

//     if (compressed) {
//       console.log('[/upload] : compressed', req.file.buffer.byteLength)
//       // decompress the file
//       // const compressedBlob = new Blob([req.file.buffer])

//       // const decompressedBlob = await new Response(
//       //   compressedBlob.stream().pipeThrough(new DecompressionStream('gzip'))
//       // ).blob()

//       const decompressedBuffer = zlib.gunzipSync(req.file.buffer)

//       // const decompressedBuffer = await decompressedBlob.arrayBuffer()
//       console.log(decompressedBuffer.byteLength)

//       await cloudflareAddFileToBucket(
//         'yoga-video-recordings',
//         filename,
//         decompressedBuffer.buffer,
//         'video/mp4'
//       )

//       return res.status(HTTP_OK).json({
//         message: 'File uploaded successfully',
//       })
//     }

//     // if (!filename || !body) {
//     //   return res.status(400).json({
//     //     message: 'Invalid request',
//     //   })
//     // }

//     await cloudflareAddFileToBucket(
//       'yoga-video-recordings',
//       filename,
//       req.file.buffer,
//       'video/mp4'
//     )

//     return res.status(HTTP_OK).json({
//       message: 'File uploaded successfully',
//     })
//   } catch (err) {
//     console.error(err)
//     return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
//       message: 'File upload failed',
//     })
//   }
// })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { filename, foldername, content_type = 'video/mp4' } = req.body

    let { compressed = 'false', python = 'false' } = req.body

    python = python === 'true'
    compressed = compressed === 'true'

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    if (!filename || !foldername) {
      return res.status(400).json({ message: 'Invalid request' })
    }

    let buffer = req.file

    // console.log('[/upload] : python', python, typeof python)
    console.log('[/upload] : filename', filename)
    console.log('[/upload] : original size:', req.file.buffer.byteLength)

    if (compressed) {
      buffer = zlib.gunzipSync(req.file.buffer)
      // buffer = await decompressedBlob.arrayBuffer()

      console.log('[/upload] : decompressed size:  ', buffer.byteLength)
    }

    // let python = false

    if (python) {
      const uploadProcess = spawn('python', ['demo.py', filename, compressed])

      uploadProcess.stdin.write(Buffer.from(buffer.buffer))
      uploadProcess.stdin.end()

      let timeoutCount = 0

      while (uploadProcess.exitCode === null && timeoutCount < 300) {
        console.log(
          'Waiting for upload to complete',
          timeoutCount,
          uploadProcess.stdout.readable,
          uploadProcess.stderr.readable,
          uploadProcess.pid
        )

        if (uploadProcess.stdout.readable) {
          const data = uploadProcess.stdout.read()
          if (data) {
            console.log(`[/upload] : stdout: ${data}`)
          }
        }

        if (uploadProcess.stderr.readable) {
          const data = uploadProcess.stderr.read()
          if (data) {
            console.error(`[/upload] : stderr: ${data}`)
            return res.status(500).json({ message: 'Failed to upload video' })
          }
        }

        await sleep(100)
        timeoutCount += 1
      }

      if (uploadProcess.stdout.readable) {
        const data = uploadProcess.stdout.read()
        if (data) {
          console.log(`[/upload] : stdout: ${data}`)
        }
      }

      if (uploadProcess.stderr.readable) {
        const data = uploadProcess.stderr.read()
        if (data) {
          console.error(`[/upload] : stderr: ${data}`)
          return res.status(500).json({ message: 'Failed to upload video' })
        }
      }

      if (timeoutCount >= 300) {
        console.log('[/upload] : Timeout')
        return res.status(500).json({ message: 'Failed to upload video' })
      }

      if (uploadProcess.exitCode === 0) {
        console.log('[/upload] : Success, exit code:', uploadProcess.exitCode)
        return res.status(200).json({ message: 'File uploaded successfully' })
      }

      console.error('[/upload] : Failed, exit code:', uploadProcess.exitCode)
      return res.status(500).json({ message: 'Failed to upload video' })
    }

    const startTs = performance.now()
    await cloudflareAddFileToBucket(
      'yoga-video-recordings',
      `${foldername}/${filename}`,
      buffer.buffer,
      content_type
    )

    const endTs = performance.now()

    console.log('[/upload] : Time taken (js) :', endTs - startTs)

    return res.status(HTTP_OK).json({
      message: 'File uploaded successfully',
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'File upload failed' })
  }
})

const s3Client = new S3Client({
  region: 'apac',
  endpoint: process.env.R2_RECORDINGS_UPLOAD_URL,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
})

router.post('/api/upload', upload.single('file'), async (req, res) => {
  console.log('in api upload')
  // if (!req.file) {
  //   console.log('no file ')
  //   return res.status(400).send('No file uploaded')
  // }
  console.log(req.body)
  // const { buffer, originalname } = req.file
  // console.log(req.file)

  try {
    //   const uploadParams = {
    //     Bucket: process.env.CLOUDFLARE_R2_RECORDING_BUCKET,
    //     Key: path.basename(originalname), // or use a unique key
    //     Body: buffer,
    //     ContentType: req.file.mimetype,
    //   }

    //   await s3Client.send(new PutObjectCommand(uploadParams))

    res.status(200).send('File uploaded successfully')
  } catch (error) {
    console.error(error)
    res.status(500).send('Failed to upload file')
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

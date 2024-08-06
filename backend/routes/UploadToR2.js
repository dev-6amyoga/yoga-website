const express = require('express')
const router = express.Router()
const { spawn } = require('child_process')
const multer = require('multer')
const { S3Client } = require('@aws-sdk/client-s3')
const storage = multer.memoryStorage()
const upload = multer({ storage })
const zlib = require('zlib')
const {
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require('../utils/http_status_codes')

const { cloudflareAddFileToBucket } = require('../utils/R2Client')
const { cloudflareGetFile } = require('../utils/R2Client')
const { cloudflareListDir } = require('../utils/R2Client')

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

router.post('/videos/get', async (req, res) => {
  try {
    const { filename, content_type } = req.body

    const fileStream = await cloudflareGetFile(
      'yoga-video-recordings',
      filename,
      content_type
    )

    // res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
    // res.setHeader('Content-Type', 'video/mp4')

    res.setHeader('Content-Type', content_type)

    return res.send(Buffer.from(fileStream))
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: 'Failed to download file',
    })
  }
})

router.post('/videos/process/:foldername', async (req, res) => {
  try {
    const { foldername } = req.params
    const { videos } = req.body

    // console.log('foldername:', foldername)
    // console.log('videos:', videos)

    // get all videos from r2
    const videoData = await Promise.all(
      videos.map(async (video) => {
        try {
          const buf = await cloudflareGetFile(
            'yoga-video-recordings',
            `${foldername}/${video.Key}`,
            'application/octet-stream'
          )
          console.log('got video:', video.Key)
          return { Key: video.Key, buffer: buf }
        } catch (err) {
          console.error(err)
          throw err
        }
      })
    )

    const foldernameLength = foldername.length + 1
    videoData.sort((v1, v2) =>
      Number(String(v1.Key).substring(foldernameLength)) >
      Number(String(v2.Key).substring(foldernameLength))
        ? 1
        : -1
    )

    const buffers = videoData.map((v) => v.buffer)

    console.log('buffers processed:', buffers.length)

    // for (let v = 0; v < videoData.length; v += 1) {
    //   console.log('video:', videoData[v].Key, videoData[v].buffer.byteLength)
    // }

    // merge all videos into one buffer in order
    const combinedBuffer = Buffer.concat(buffers)

    console.log('combined buffer size:', combinedBuffer.byteLength)

    // const readableBuffer = Readable.from(combinedBuffer)

    // create a file
    // fs.closeSync(fs.openSync(`${foldername}.mp4`, 'a'))
    // const fd = fs.openSync(`video.mp4`, 'a')

    // fs.closeSync(fd)

    // // process with ffmpeg
    // const command = ffmpeg(readableBuffer)
    //   .inputOption('-sn')
    //   .videoCodec('libx264')
    //   .audioCodec('aac')
    //   .inputOption('-strict', 'experimental')
    //   .output(writableStream)

    // command.run()

    // let status = 0
    // command.on('end', () => {
    //   status = 1
    // })

    // command.on('error', (err) => {
    //   console.error(err)
    //   status = -1
    // })

    // while (status === 0) {
    //   console.log('waiting for ffmpeg to complete')
    //   await sleep(1000)
    // }

    // if (status === -1) {
    //   return res.status(500).json({
    //     message: 'Failed to process video',
    //   })
    // }

    // get buffer from file
    // const processedBuffer = fs.readFileSync(`video.mp4`)

    // console.log('processed buffer size:', processedBuffer.byteLength)

    // delete the file
    // fs.unlinkSync(`video.mp4`)

    // upload the processed video
    await cloudflareAddFileToBucket(
      'yoga-video-recordings',
      `${foldername}/${foldername}_final.mp4`,
      combinedBuffer,
      'video/mp4'
    )

    // send the processed video
    return res.status(200).json({
      message: 'Video processed successfully',
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: 'Failed to download file',
    })
  }
})

module.exports = router

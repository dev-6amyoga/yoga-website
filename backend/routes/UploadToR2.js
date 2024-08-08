const express = require('express')
const multer = require('multer')
const { spawn } = require('child_process')
const zlib = require('zlib')

// const fs = require('fs')
// const ffmpeg = require('fluent-ffmpeg')

const {
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_BAD_REQUEST,
} = require('../utils/http_status_codes')

const {
  cloudflareAddFileToBucket,
  cloudflareListDirV2,
  cloudflareStartMultipartUpload,
  cloudflareUploadPart,
  cloudflareCompleteMultipartUpload,
  cloudflareCancelMultipartUpload,
} = require('../utils/R2Client')
const { cloudflareGetFile } = require('../utils/R2Client')
const { cloudflareListDir } = require('../utils/R2Client')
const VideoRecordings = require('../models/mongo/VideoRecordings')
const { GetUser } = require('../services/User.service')
// const { Readable } = require('stream')

const router = express.Router()
const storage = multer.memoryStorage()
const upload = multer({ storage })

const sleep = (ms) =>
  new Promise((r) => {
    setTimeout(r, ms)
  })

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const {
      user_id,
      file_name,
      folder_name,
      content_type = 'video/mp4',
    } = req.body

    let { compressed = 'false', python = 'false' } = req.body

    python = python === 'true'
    compressed = compressed === 'true'

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    if (!file_name || !folder_name) {
      return res.status(400).json({ message: 'Invalid request' })
    }

    let buffer = req.file

    // console.log('[/upload] : python', python, typeof python)
    console.log('[/upload] : file_name', file_name)
    console.log('[/upload] : original size:', req.file.buffer.byteLength)

    if (compressed) {
      buffer = zlib.gunzipSync(req.file.buffer)
      // buffer = await decompressedBlob.arrayBuffer()

      console.log('[/upload] : decompressed size:  ', buffer.byteLength)
    }

    // let python = false

    if (python) {
      const uploadProcess = spawn('python', ['demo.py', file_name, compressed])

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

    // check if video recording exists
    if (user_id !== 'XXX') {
      const videoRecording = await VideoRecordings.findOne({
        user_id,
        folder_name,
      })

      if (!videoRecording) {
        const [user, error] = await GetUser({ user_id }, ['username'])

        if (error || !user) {
          console.error(error)
          return res.status(400).json({ message: error || 'user not found' })
        }

        const newVideoRecording = new VideoRecordings({
          user_id,
          folder_name,
          user_username: user.username,
        })

        await newVideoRecording.save()
      }
    }

    const startTs = performance.now()
    await cloudflareAddFileToBucket(
      'yoga-video-recordings',
      `${folder_name}/${file_name}`,
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

router.post('/videos/process/', async (req, res) => {
  const { video_recording_id } = req.body

  let videoRecording = null
  let uploadId = null
  let folder_name = null

  try {
    // console.log('foldername:', foldername)
    // console.log('videos:', videos)
    videoRecording = await VideoRecordings.findById(video_recording_id)

    if (!videoRecording) {
      return res.status(HTTP_BAD_REQUEST).json({
        message: 'Video recording not found',
      })
    }

    folder_name = videoRecording.get('folder_name')

    const foldernameLength = folder_name.length + 1

    const videosRes = await cloudflareListDirV2(
      'yoga-video-recordings',
      folder_name
    )

    if (!videosRes.Contents || videosRes.Contents.length === 0) {
      return res.status(HTTP_BAD_REQUEST).json({
        message: 'No videos found',
      })
    }

    const videos = videosRes.Contents.filter(
      (v) => !String(v.Key).includes('final')
    )

    videos.sort((v1, v2) =>
      Number(String(v1.Key).substring(2 * foldernameLength)) >
      Number(String(v2.Key).substring(2 * foldernameLength))
        ? 1
        : -1
    )

    console.log(
      'videos:',
      videos.map((v) => v.Key)
    )

    console.log(
      'TOTAL BUFFER LENGTH : ',
      videos.reduce((acc, v) => acc + v.Size, 0)
    )

    // if (videos) {
    //   return res.status(HTTP_BAD_REQUEST).json({
    //     message: 'No videos found',
    //   })
    // }

    // start multipart upload

    const multipartUpload = await cloudflareStartMultipartUpload(
      'yoga-video-recordings',
      `${folder_name}/${folder_name}_final.mp4`,
      'video/mp4'
    )

    uploadId = multipartUpload.UploadId

    console.log('uploadId:', uploadId)

    const chunkSize = 10 * 1024 * 1024

    // // get all videos from r2
    let leftoverBuffer = Buffer.alloc(0)
    let leftoverBufferLen = 0
    let partNumber = 1
    let subpartNumber = 0
    let currentBufferPointer = 0

    // get one video from r2
    // send parts to r2
    // add leftover buffer to next video

    const parts = []
    let totalLen = 0
    let buf = Buffer.alloc(0)

    for (let v = 0; v < videos.length; v += 1) {
      subpartNumber = 0

      buf = await cloudflareGetFile(
        'yoga-video-recordings',
        `${videos[v].Key}`,
        'application/octet-stream'
      )

      // upload parts to r2
      totalLen = buf.byteLength + leftoverBufferLen
      currentBufferPointer = 0

      console.log('video:', videos[v].Key, buf.byteLength, totalLen)

      while (totalLen >= chunkSize) {
        console.log({
          leftoverBufferLen,
          sizeOfleftoverBuffer: leftoverBuffer.byteLength,
          totalLen,
          partNumber,
          subpartNumber,
        })

        if (leftoverBufferLen > 0) {
          const partBuf = Buffer.concat([
            leftoverBuffer,
            buf.subarray(0, chunkSize - leftoverBufferLen),
          ])

          console.log('partBuf size : ', partBuf.byteLength)

          const uploadRes = await cloudflareUploadPart(
            'yoga-video-recordings',
            `${folder_name}/${folder_name}_final.mp4`,
            uploadId,
            partNumber,
            partBuf
          )

          parts.push({
            ETag: uploadRes.ETag,
            PartNumber: partNumber,
          })

          currentBufferPointer = chunkSize - leftoverBufferLen
          leftoverBufferLen = 0
        } else {
          const partBuf = buf.subarray(
            currentBufferPointer,
            currentBufferPointer + chunkSize
          )

          console.log('partBuf : ', {
            start: currentBufferPointer,
            end: currentBufferPointer + chunkSize,
            buf_size: buf.byteLength,
            partBuf_size: partBuf.byteLength,
          })

          const uploadRes = await cloudflareUploadPart(
            'yoga-video-recordings',
            `${folder_name}/${folder_name}_final.mp4`,
            uploadId,
            partNumber,
            partBuf
          )

          parts.push({
            ETag: uploadRes.ETag,
            PartNumber: partNumber,
          })

          currentBufferPointer += chunkSize
        }

        partNumber += 1
        totalLen -= chunkSize
        subpartNumber += 1
      }

      if (totalLen > 0) {
        console.log('totalLen > 0; calc leftoverBuffer', { totalLen })
        if (subpartNumber === 0) {
          console.log('totalLen > 0, subpartNumber === 0', subpartNumber)
          if (leftoverBuffer.byteLength > 0) {
            leftoverBuffer = Buffer.concat([
              leftoverBuffer,
              buf.subarray(0, buf.byteLength),
            ])
          } else {
            leftoverBuffer = buf.subarray(0, totalLen)
          }
        } else {
          console.log(
            'totalLen > 0, subpartNumber !== 0',
            subpartNumber,
            buf.byteLength,
            subpartNumber * chunkSize,
            buf.byteLength - subpartNumber * chunkSize
          )
          leftoverBuffer = buf.subarray(
            buf.byteLength - totalLen,
            buf.byteLength
          )
        }
        leftoverBufferLen = leftoverBuffer.byteLength
      }
    }

    console.log('out of loop')
    console.log({ leftoverBufferLen, totalLen, partNumber, subpartNumber })

    // if (totalLen > 0 && totalLen < chunkSize && buf.byteLength > 0) {
    //   leftoverBuffer = buf
    //   leftoverBufferLen = buf.byteLength
    // }

    // upload the last part
    if (leftoverBufferLen > 0) {
      console.log('uploading leftover buffer:', leftoverBufferLen)
      const uploadRes = await cloudflareUploadPart(
        'yoga-video-recordings',
        `${folder_name}/${folder_name}_final.mp4`,
        uploadId,
        partNumber,
        leftoverBuffer
      )

      parts.push({
        ETag: uploadRes.ETag,
        PartNumber: partNumber,
      })
    }

    // complete multipart upload
    await cloudflareCompleteMultipartUpload(
      'yoga-video-recordings',
      `${folder_name}/${folder_name}_final.mp4`,
      uploadId,
      parts
    )

    videoRecording.processing_status = 'PROCESSED'
    await videoRecording.save()

    // videoData = videoData.filter((v) => !String(v.Key).includes('final'))

    // const foldernameLength = folder_name.length + 1

    // videoData.sort((v1, v2) =>
    //   Number(String(v1.Key).substring(foldernameLength)) >
    //   Number(String(v2.Key).substring(foldernameLength))
    //     ? 1
    //     : -1
    // )

    // const buffers = videoData.map((v) => v.buffer)

    // console.log('buffers processed:', buffers.length)

    // for (let v = 0; v < videoData.length; v += 1) {
    //   console.log('video:', videoData[v].Key, videoData[v].buffer.byteLength)
    // }

    // // merge all videos into one buffer in order
    // const combinedBuffer = Buffer.concat(buffers)

    // console.log('combined buffer size:', combinedBuffer.byteLength)

    /*
    const readableBuffer = Readable.from(combinedBuffer)

    // create a file
    // fs.closeSync(fs.openSync(`${foldername}.mp4`, 'a'))
    const fd = fs.openSync(`video.mp4`, 'a')

    fs.closeSync(fd)

    // // process with ffmpeg
    const command = ffmpeg(readableBuffer)
      .inputOption('-sn')
      .inputOption('-strict', 'experimental')
      .output(`video.mp4`)

    command.run()

    let status = 0

    command.on('end', () => {
      status = 1
    })

    command.on('error', (err) => {
      console.error(err)
      status = -1
    })

    while (status === 0) {
      console.log('waiting for ffmpeg to complete')
      await sleep(1000)
    }

    if (status === -1) {
      fs.unlinkSync(`video.mp4`)
      return res.status(500).json({
        message: 'Failed to process video',
      })
    }

    // get buffer from file
    const processedBuffer = fs.readFileSync(`video.mp4`)

    console.log('processed buffer size:', processedBuffer.byteLength)

    await cloudflareAddFileToBucket(
      'yoga-video-recordings',
      `${foldername}/${foldername}_final.mp4`,
      processedBuffer,
      'video/mp4'
    )

    // delete the file
    fs.unlinkSync(`video.mp4`)
    */

    // upload the processed video
    // await cloudflareAddFileToBucket(
    //   'yoga-video-recordings',
    //   `${folder_name}/${folder_name}_final.mp4`,
    //   combinedBuffer,
    //   'video/mp4'
    // )

    // videoRecording.processing_status = 'PROCESSED'
    // await videoRecording.save()

    // // send the processed video
    return res.status(200).json({
      message: 'Video processed successfully',
    })
  } catch (err) {
    if (videoRecording) {
      videoRecording.processing_status = 'FAILED'
      await videoRecording.save()
    }

    if (uploadId) {
      await cloudflareCancelMultipartUpload(
        'yoga-video-recordings',
        `${folder_name}/${folder_name}_final.mp4`,
        uploadId,
        []
      )
    }

    console.error(err)
    // fs.unlinkSync(`video.mp4`)
    return res.status(500).json({
      message: err || 'Failed to process video',
    })
  }
})

router.post('/mpu/abort', async (req, res) => {
  const { uploadId, filename } = req.body

  try {
    await cloudflareCancelMultipartUpload(
      'yoga-video-recordings',
      filename,
      uploadId,
      []
    )

    return res.status(200).json({
      message: 'Multipart upload aborted successfully',
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: 'Failed to abort multipart upload',
    })
  }
})

module.exports = router

const express = require('express')

const router = express.Router()
const mongoose = require('mongoose')

const {
  HTTP_OK,
  HTTP_NOT_FOUND,
  HTTP_INTERNAL_SERVER_ERROR,
} = require('../utils/http_status_codes')
// const R2 = require('../utils/R2Client')
const VideoRecordings = require('../models/mongo/VideoRecordings')
const { cloudflareDeleteFolder } = require('../utils/R2Client')
// const { spawn } = require('child_process')

router.post('/addVideoRecording', async (req, res) => {
  try {
    const requestData = req.body

    const newVideoRecording = new VideoRecordings(requestData)
    const savedVideoRecording = await newVideoRecording.save()

    return res.status(200).json(savedVideoRecording)
  } catch (error) {
    console.error('Error saving new Video Recording:', error)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to save new Video Recording',
    })
  }
})

router.get('/getAllVideoRecordings', async (req, res) => {
  try {
    const videoRecordings = await VideoRecordings.find()
    return res.json(videoRecordings)
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      error: 'Failed to fetch Video Recording',
    })
  }
})

router.get('/getVideoRecordingById/:videoRecordingId', async (req, res) => {
  const { videoRecordingId } = req.params
  try {
    const existingVideoRecording = await VideoRecordings.findOne({
      _id: new mongoose.Schema.ObjectId(videoRecordingId),
    })

    if (!existingVideoRecording) {
      return res
        .status(HTTP_NOT_FOUND)
        .json({ error: 'Video Recording not found' })
    }

    return res.status(HTTP_OK).json(existingVideoRecording)
  } catch (error) {
    console.error(error)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to update Video Recording',
    })
  }
})

router.delete('/deleteVideoRecording/:videoRecordingId', async (req, res) => {
  const { videoRecordingId } = req.params
  try {
    // delete from mongo
    const deletedVideoRecording =
      await VideoRecordings.findByIdAndRemove(videoRecordingId)

    if (deletedVideoRecording) {
      // delete all recordings chunks from R2

      await cloudflareDeleteFolder(
        'yoga-video-recordings',
        deletedVideoRecording.folder_name
      )

      return res.status(HTTP_OK).json({
        message: 'Video Recording deleted successfully',
      })
    }

    return res
      .status(HTTP_NOT_FOUND)
      .json({ message: 'Video Recording not found' })
  } catch (error) {
    console.error(error)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to delete Video Recording',
    })
  }
})

module.exports = router

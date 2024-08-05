const express = require('express')
const router = express.Router()
const {
  HTTP_OK,
  HTTP_NOT_FOUND,
  HTTP_INTERNAL_SERVER_ERROR,
} = require('../utils/http_status_codes')
const R2 = require('../utils/R2Client')
const VideoRecordings = require('../models/mongo/VideoRecordings')
const { spawn } = require('child_process')

router.post('/addVideoRecording', async (req, res) => {
  try {
    const requestData = req.body
    const maxVideoRecordingId = await VideoRecordings.findOne(
      {},
      {},
      { sort: { video_recordings_id: -1 } }
    )
    const newVideoRecordingId = maxVideoRecordingId
      ? maxVideoRecordingId.video_recordings_id + 1
      : 1
    requestData.video_recordings_id = newVideoRecordingId
    const newVideoRecording = new VideoRecordings(requestData)
    const savedVideoRecording = await newVideoRecording.save()
    res.status(200).json(savedVideoRecording)
  } catch (error) {
    console.error('Error saving new Video Recording:', error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to save new Video Recording',
    })
  }
})

router.get('/getAllVideoRecordings', async (req, res) => {
  try {
    const videoRecordings = await VideoRecordings.find()
    res.json(videoRecordings)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: 'Failed to fetch Video Recording',
    })
  }
})

router.put('/updateVideoRecording/:videoRecordingId', async (req, res) => {
  const videoRecordingId = req.params.videoRecordingId
  const updatedData = req.body
  try {
    const existingVideoRecording = await VideoRecordings.findOne({
      video_recordings_id: videoRecordingId,
    })
    if (!existingVideoRecording) {
      return res
        .status(HTTP_NOT_FOUND)
        .json({ error: 'Video Recording not found' })
    }
    const mergedData = {
      ...existingVideoRecording.toObject(),
      ...updatedData,
    }
    const updatedVideoRecording = await VideoRecordings.findOneAndUpdate(
      { video_recordings_id: videoRecordingId },
      mergedData,
      {
        new: true,
      }
    )
    res.json(updatedVideoRecording)
  } catch (error) {
    console.error(error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to update Video Recording',
    })
  }
})

router.get('/getVideoRecordingById/:videoRecordingId', async (req, res) => {
  const videoRecordingId = req.params.videoRecordingId
  try {
    const existingVideoRecording = await VideoRecordings.findOne({
      video_recordings_id: videoRecordingId,
    })
    if (!existingVideoRecording) {
      return res
        .status(HTTP_NOT_FOUND)
        .json({ error: 'Video Recording not found' })
    }
    res.status(HTTP_OK).json(existingVideoRecording)
  } catch (error) {
    console.error(error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to update Video Recording',
    })
  }
})

router.delete('/deleteVideoRecording/:videoRecordingId', async (req, res) => {
  const videoRecordingId = req.params.videoRecordingId
  try {
    const deletedVideoRecording = await VideoRecordings.findOneAndDelete({
      video_recordings_id: videoRecordingId,
    })
    if (deletedVideoRecording) {
      res.status(HTTP_OK).json({
        message: 'Video Recording deleted successfully',
      })
    } else {
      res.status(HTTP_NOT_FOUND).json({ message: 'Video Recording not found' })
    }
  } catch (error) {
    console.error(error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to delete Video Recording',
    })
  }
})

module.exports = router

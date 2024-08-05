const mongoose = require('mongoose')

const videoRecordingsSchema = new mongoose.Schema({
  video_recordings_id: Number,
  user_id: Number,
  user_name: String,
  creation_date: Date,
  recording_video_name: String,
})

const VideoRecordings = mongoose.model(
  'VideoRecordings',
  videoRecordingsSchema,
  'video_recordings'
)

module.exports = VideoRecordings

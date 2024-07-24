const mongoose = require('mongoose')
const { CLASS_UPCOMING } = require('../../enums/class_status')

const classHistorySchema = new mongoose.Schema({
  class_metadata_id: mongoose.Schema.Types.ObjectId,
  class_name: String,
  class_desc: String,
  teacher_id: Number,
  start_time: mongoose.Schema.Types.Date,
  end_time: mongoose.Schema.Types.Date,
  status: {
    type: String,
    default: CLASS_UPCOMING,
  },
  has_teacher_joined: {
    type: Boolean,
    default: false,
  },
  attendees: {
    type: [String],
    default: [],
  },
  actions_queue: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  controls_queue: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  watch_history: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
})

const ClassHistory = mongoose.model(
  'ClassHistory',
  classHistorySchema,
  'class_history'
)

// module.exports = Class;

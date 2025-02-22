const mongoose = require('mongoose')

const MarkerSchema = new mongoose.Schema({
  title: String,
  timestamp: {
    type: Number,
    default: 0,
  },
  loop: {
    type: Boolean,
    default: true,
  },
})

const asanaSchema = new mongoose.Schema({
  id: Number,
  asana_name: String,
  asana_category: String,
  drm_video: Boolean,
  asana_dash_url: String,
  ai_asana: Boolean,
  non_ai_asana: Boolean,
  teacher_mode: Boolean,
  asana_withAudio: String,
  asana_type: String,
  asana_difficulty: [String],
  language: String,
  nobreak_asana: Boolean,
  person_starting_position: String,
  person_ending_position: String,
  mat_starting_position: String,
  mat_ending_position: String,
  asana_stithi_start: String,
  asana_stithi_end: String,
  vibhagiya: Boolean,
  omkara: Boolean,
  catch_waist_start: Boolean,
  catch_waist_end: Boolean,
  nose_lock_start: Boolean,
  nose_lock_end: Boolean,
  chin_lock_start: Boolean,
  chin_lock_end: Boolean,
  eye_close_start: Boolean,
  eye_close_end: Boolean,
  shanmuga_start: Boolean,
  shanmuga_end: Boolean,
  vibhagiya: Boolean,
  vajra_side: Boolean,
  vajra_start: Boolean,
  vajra_end: Boolean,
  namaskara_start: Boolean,
  namaskara_end: Boolean,
})

const Asana = mongoose.model('Asana', asanaSchema, 'asanas')

module.exports = Asana

const mongoose = require('mongoose')
const { CLASS_METADATA_DRAFT } = require('../../enums/class_metadata_status')

const { CLASS_TYPE_ONETIME } = require('../../enums/class_metadata_class_type')

const classSchema = new mongoose.Schema({
  class_name: {
    type: mongoose.Schema.Types.String,
    required: true,
  },
  class_desc: {
    type: mongoose.Schema.Types.String,
  },
  teacher_id: {
    type: mongoose.Schema.Types.Number,
    required: true,
  },
  class_type: {
    type: mongoose.Schema.Types.String,
    default: CLASS_TYPE_ONETIME,
  },
  recurrance_type: {
    type: mongoose.Schema.Types.String,
    default: null,
  },
  recurrance_days: {
    type: [String],
    default: [],
  },
  onetime_class_start_time: {
    type: mongoose.Schema.Types.Date,
    default: null,
  },
  onetime_class_end_time: {
    type: mongoose.Schema.Types.Date,
    default: null,
  },
  recurring_class_start_time: {
    type: mongoose.Schema.Types.String,
    default: null,
  },
  recurring_class_end_time: {
    type: mongoose.Schema.Types.String,
    default: null,
  },
  recurring_class_timezone: {
    type: mongoose.Schema.Types.String,
    default: null,
  },
  status: {
    type: String,
    default: CLASS_METADATA_DRAFT,
  },
  allowed_students: {
    type: [String],
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

const Class = mongoose.model('Class', classSchema, 'class')

module.exports = Class

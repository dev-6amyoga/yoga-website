const mongoose = require("mongoose");

const TransitionMarkerSchema = new mongoose.Schema({
  title: String,
  timestamp: {
    type: Number,
    default: 0,
  },
  loop: {
    type: Boolean,
    default: true,
  },
});

const transitionVideoSchema = new mongoose.Schema({
  transition_id: String,
  transition_video_ID: String,
  transition_video_name: String,
  transition_hls_url: String,
  transition_dash_url: String,
  duration: Number,
  ai_transition: Boolean,
  non_ai_transition: Boolean,
  asana_category_start: String,
  asana_category_end: String,
  language: String,
  markers: {
    type: [TransitionMarkerSchema],
    default: [],
  },
  person_starting_position: String,
  person_ending_position: String,
  mat_starting_position: String,
  mat_ending_position: String,
  going_to_relax: Boolean,
  coming_from_relax: Boolean,
  teacher_mode: Boolean,
});

const TransitionVideo = mongoose.model(
  "TransitionVideo",
  transitionVideoSchema,
  "transition_videos"
);

module.exports = TransitionVideo;

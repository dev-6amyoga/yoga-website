const mongoose = require("mongoose");

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
});

const asanaSchema = new mongoose.Schema({
  id: Number,
  asana_name: String,

  asana_desc: String,
  asana_category: String,
  asana_thumbnailTs: {
    type: Number,
    default: 1,
  },
  asana_imageID: String,
  asana_videoID: String,
  asana_hls_url: String,
  asana_dash_url: String,
  ai_asana: Boolean,
  asana_withAudio: String,
  asana_audioLag: Number,
  asana_type: String,
  duration: Number,
  asana_difficulty: [String],
  markers: {
    type: [MarkerSchema],
    default: [],
  },
  muted: String,
  language: String,
  nobreak_asana: Boolean,
  person_starting_position: String,
  person_ending_position: String,
  mat_starting_position: String,
  mat_ending_position: String,
  asana_stithi_start: String,
  asana_stithi_end: String,
  asana_namaskarastithi_start: String,
  asana_namaskarastithi_end: String,
  asana_eyestithi_start: String,
  asana_eyestithi_end: String,
  counter: String,
});

const Asana = mongoose.model("Asana", asanaSchema, "asanas");

module.exports = Asana;

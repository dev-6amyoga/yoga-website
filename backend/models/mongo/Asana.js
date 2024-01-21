const mongoose = require("mongoose");

const asanaSchema = new mongoose.Schema({
  id: Number,
  asana_name: String,
  asana_desc: String,
  asana_category: String,
  asana_imageID: String,
  asana_videoID: String,
  asana_withAudio: String,
  asana_audioLag: Number,
  asana_type: String,
  asana_difficulty: [String],
  language: String,
  muted: String,
  counter: String,
  person_starting_position: String,
  person_ending_position: String,
  mat_starting_position: String,
  mat_ending_position: String,
});

const Asana = mongoose.model("Asana", asanaSchema, "asanas");

module.exports = Asana;

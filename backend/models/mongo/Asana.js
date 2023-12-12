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
  language: String,
});

const Asana = mongoose.model("Asana", asanaSchema, "asanas");

module.exports = Asana;

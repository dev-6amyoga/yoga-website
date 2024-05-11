const mongoose = require("mongoose");

const classModeSchema = new mongoose.Schema({
  id: Number,
  class_name: String,
  class_desc: String,
  start_time: String,
  end_time: String,
  days: [String],
});

const ClassMode = mongoose.model("ClassMode", classModeSchema, "class_mode");

module.exports = ClassMode;

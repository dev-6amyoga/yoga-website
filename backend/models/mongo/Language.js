const mongoose = require("mongoose");

const languageSchema = new mongoose.Schema({
  language_id: Number,
  language: String,
});

const Language = mongoose.model("Language", languageSchema, "languages");

module.exports = Language;

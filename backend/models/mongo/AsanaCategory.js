const mongoose = require("mongoose");

const asanaCategorySchema = new mongoose.Schema({
  asana_category_id: Number,
  asana_category: String,
});

const AsanaCategory = mongoose.model(
  "AsanaCategory",
  asanaCategorySchema,
  "asana_category"
);

module.exports = AsanaCategory;

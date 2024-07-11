const mongoose = require("mongoose");

const customPlanSchema = new mongoose.Schema({
  custom_plan_id: Number,
  plan_name: String,
  selectedNeeds: [String],
  prices: [mongoose.Schema.Types.Mixed],
  playlists: [mongoose.Schema.Types.Mixed],
  planValidity: Number,
  students: [Number],
  institutes: [Number],
  watchHours: Number,
});

const CustomPlan = mongoose.model(
  "CustomPlan",
  customPlanSchema,
  "custom_plan"
);

module.exports = CustomPlan;

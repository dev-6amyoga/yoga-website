const mongoose = require("mongoose");

const SchedulesSchema = new mongoose.Schema({
  schedule_id: { type: Number, required: true },
  schedule_name: String,
  validity_from: String,
  validity_to: String,
  asana_ids: [mongoose.Schema.Types.Mixed],
  applicable_ids: [mongoose.Schema.Types.Mixed],
});

const Schedule = mongoose.model("Schedules", SchedulesSchema, "schedules");

module.exports = Schedule;

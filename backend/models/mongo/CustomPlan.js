const mongoose = require("mongoose");

const customPlanSchema = new mongoose.Schema({
  user_id: Number,
  user_name: String,
  creation_date: Date,
  phone_number: String,
  email_id: String,
  username: String,
  password: String,
  user_type: String,
  institute_id: Number,
  institute_name: String,
});

const CustomPlan = mongoose.model(
  "CustomPlan",
  customPlanSchema,
  "custom_plan"
);

module.exports = CustomPlan;

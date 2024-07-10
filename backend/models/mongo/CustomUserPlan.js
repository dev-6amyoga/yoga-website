const mongoose = require("mongoose");

const customUserPlanSchema = new mongoose.Schema({
  custom_user_plan_id: Number,
  purchase_date: Date,
  validity_from: Date,
  validity_to: Date,
  transaction_order_id: String,
  current_status: String,
  auto_renewal_enabled: Boolean,
  user_id: Number,
  plan_id: Number,
});

const CustomUserPlan = mongoose.model(
  "CustomUserPlan",
  customUserPlanSchema,
  "custom_user_plan"
);

module.exports = CustomUserPlan;

const mongoose = require("mongoose");

const monthlyLimitUsersSchema = new mongoose.Schema({
  monthly_limit_users_id: Number,
  user_id: Number,
  monthly_limit_users_count: Number,
});

const MonthlyLimitUsers = mongoose.model(
  "MonthlyLimitUsers",
  monthlyLimitUsersSchema,
  "monthly_limit_users"
);

module.exports = MonthlyLimitUsers;

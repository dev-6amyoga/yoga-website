const mongoose = require("mongoose");

const customUserPlanSchema = new mongoose.Schema({
	purchase_date: Date,
	validity_from: Date,
	validity_to: Date,
	transaction_order_id: String,
	current_status: String,
	auto_renewal_enabled: Boolean,
	user_id: Number,
	custom_plan_id: String,
	user_type: String,
	created: {
		type: mongoose.Schema.Types.Date,
		default: Date.now,
	},
	updated: {
		type: mongoose.Schema.Types.Date,
		default: Date.now,
	},
});

const CustomUserPlan = mongoose.model(
	"CustomUserPlan",
	customUserPlanSchema,
	"custom_user_plan"
);

module.exports = CustomUserPlan;

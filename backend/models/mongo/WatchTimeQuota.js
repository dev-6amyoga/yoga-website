const mongoose = require("mongoose");

const watchTimeQuotaSchema = new mongoose.Schema({
	user_plan_id: {
		type: mongoose.Schema.Types.Number,
		required: true,
	},
	// in seconds
	quota: {
		type: mongoose.Schema.Types.Decimal128,
		required: true,
	},
	created_at: {
		type: mongoose.Schema.Types.Date,
		default: Date.now,
	},
});

const WatchTimeQuota = mongoose.model(
	"WatchTimeQuota",
	watchTimeQuotaSchema,
	"watch_time_quota"
);

module.exports = WatchTimeQuota;

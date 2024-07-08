const mongoose = require("mongoose");

const watchTimeLogSchema = new mongoose.Schema({
	user_id: {
		type: mongoose.Schema.Types.Number,
		required: true,
	},
	asana_id: {
		type: mongoose.Schema.Types.Number,
		default: null,
	},
	playlist_id: {
		type: mongoose.Schema.Types.Number,
		default: null,
	},
	duration: {
		type: mongoose.Schema.Types.Number,
		required: true,
	},
	created_at: {
		type: mongoose.Schema.Types.Date,
		default: Date.now,
	},
	updated_at: {
		type: mongoose.Schema.Types.Date,
		default: Date.now,
	},
});

const WatchTimeLog = mongoose.model(
	"WatchTimeLog",
	watchTimeLogSchema,
	"watch_time_log"
);

module.exports = WatchTimeLog;

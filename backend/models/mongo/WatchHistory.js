const mongoose = require("mongoose");

const watchHistorySchema = new mongoose.Schema({
	user_id: {
		type: mongoose.Schema.Types.Number,
	},
	asana_id: {
		type: mongoose.Schema.Types.Number,
	},
	playlist_id: {
		type: mongoose.Schema.Types.Number,
	},
	created_at: {
		type: mongoose.Schema.Types.Date,
		default: Date.now,
	},
});

const WatchHistory = mongoose.model(
	"WatchHistory",
	watchHistorySchema,
	"watch_history"
);

module.exports = WatchHistory;

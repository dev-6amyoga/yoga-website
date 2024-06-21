const mongoose = require("mongoose");

const classModeSchema = new mongoose.Schema({
	class_name: String,
	class_desc: String,
	start_time: mongoose.Schema.Types.Date,
	end_time: mongoose.Schema.Types.Date,
	status: {
		type: String,
		default: "",
	},
	has_teacher_joined: {
		type: Boolean,
		default: false,
	},
	allowed_students: {
		type: [String],
		default: [],
	},
	attendees: {
		type: [String],
		default: [],
	},
	created_at: {
		type: Date,
		default: Date.now,
	},
	updated_at: {
		type: Date,
		default: Date.now,
	},
});

const ClassMode = mongoose.model("ClassMode", classModeSchema, "class_mode");

module.exports = ClassMode;

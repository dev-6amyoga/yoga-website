const express = require("express");
const router = express.Router();
const ClassMode = require("../models/mongo/ClassMode");

router.post("/create", async (req, res) => {
	try {
		const {
			class_name,
			class_desc,
			start_time,
			end_time,
			has_started = false,
			allowed_students = [],
		} = req.body;
		// const maxIdClass = await ClassMode.findOne().sort({ id: -1 }).limit(1);

		if (!class_name || !class_desc || !start_time || !end_time) {
			return res.status(400).json({
				error: "Missing required fields",
			});
		}

		// let newId;
		// if (maxIdClass) {
		// 	newId = maxIdClass.id + 1;
		// } else {
		// 	newId = 1;
		// }
		// requestData.id = newId;

		let newClass = ClassMode.create(requestData);

		const updatedClass = await newClass.save();

		res.status(200).json({ updatedClass });
	} catch (error) {
		console.error("Error saving new Class:", error);
		res.status(500).json({
			error: "Failed to save new Class",
		});
	}
});

router.get("/get-all", async (req, res) => {
	try {
		const classes = await ClassMode.find(
			{},
			{ allowed_students: 0, attendees: 0, __v: 0, has_teacher_joined: 0 }
		);
		res.json(classes);
	} catch (error) {
		console.error(error);
		res.status(HTTP_INTERNAL_SERVER_ERROR).json({
			error: "Failed to fetch classes",
		});
	}
});

router.post("/get-by-id", async (req, res) => {
	try {
		const { class_id } = req.body;

		if (!class_id) {
			return res.status(400).json({
				error: "Missing required fields",
			});
		}

		const classObj = await ClassMode.findById(class_id);
		res.status(200).json({ classObj });
	} catch (err) {
		res.status(500).json({
			error: "Failed to fetch class",
		});
	}
});

router.post("/start", async (req, res) => {
	try {
		const { class_id } = req.body;

		if (!class_id) {
			return res.status(400).json({
				error: "Missing required fields",
			});
		}

		const classObj = await ClassMode.findByIdAndUpdate(
			class_id,
			{ has_started: true },
			{ new: true }
		);
		res.status(200).json({ classObj });
	} catch (err) {
		res.status(500).json({
			error: "Failed to start class",
		});
	}
});

router.post("/join", async (req, res) => {
	try {
		const { class_id, student_id } = req.body;

		if (!class_id || !student_id) {
			return res.status(400).json({
				error: "Missing required fields",
			});
		}

		const classObj = await ClassMode.findByIdAndUpdate(
			class_id,
			{ $push: { attendees: student_id } },
			{ new: true }
		);
		res.status(200).json({ classObj });
	} catch (err) {
		res.status(500).json({
			error: "Failed to join class",
		});
	}
});

router.post("/leave", async (req, res) => {
	try {
		const { class_id, student_id } = req.body;

		if (!class_id || !student_id) {
			return res.status(400).json({
				error: "Missing required fields",
			});
		}

		const classObj = await ClassMode.findByIdAndUpdate(
			class_id,
			{ $pull: { attendees: student_id } },
			{ new: true }
		);
		res.status(200).json({ classObj });
	} catch (err) {
		res.status(500).json({
			error: "Failed to leave class",
		});
	}
});

router.post("/add-student", async (req, res) => {
	try {
		const { class_id, email } = req.body;

		if (!class_id || !email) {
			return res.status(400).json({
				error: "Missing required fields",
			});
		}

		const classObj = await ClassMode.findByIdAndUpdate(
			class_id,
			{ $push: { allowed_students: email } },
			{ new: true }
		);
		res.status(200).json({ classObj });
	} catch (err) {
		res.status(500).json({
			error: "Failed to add student",
		});
	}
});

router.post("/remove-student", async (req, res) => {
	try {
		const { class_id, email } = req.body;

		if (!class_id || !email) {
			return res.status(400).json({
				error: "Missing required fields",
			});
		}

		const classObj = await ClassMode.findByIdAndUpdate(
			class_id,
			{ $pull: { allowed_students: email } },
			{ new: true }
		);
		res.status(200).json({ classObj });
	} catch (err) {
		res.status(500).json({
			error: "Failed to remove student",
		});
	}
});

router.post("/end", async (req, res) => {
	try {
		const { class_id } = req.body;

		if (!class_id) {
			return res.status(400).json({
				error: "Missing required fields",
			});
		}

		const classObj = await ClassMode.findByIdAndUpdate(
			class_id,
			{ has_started: false },
			{ new: true }
		);
		res.status(200).json({ classObj });
	} catch (err) {
		res.status(500).json({
			error: "Failed to end class",
		});
	}
});

module.exports = router;

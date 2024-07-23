const express = require("express");
const router = express.Router();
const Class = require("../models/mongo/ClassHistory");
const {
	HTTP_BAD_REQUEST,
	HTTP_OK,
	HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");
const { CLASS_UPCOMING, CLASS_ONGOING } = require("../enums/class_status");
const { User } = require("../models/sql/User");

router.post("/create", async (req, res) => {
	try {
		const {
			default_class_name,
			class_desc,
			teacher_id,
			start_time,
			end_time,
			allowed_students = [],
		} = req.body;
		// const maxIdClass = await ClassMode.findOne().sort({ id: -1 }).limit(1);

		if (
			!class_name ||
			!class_desc ||
			!start_time ||
			!end_time ||
			!teacher_id
		) {
			return res.status(HTTP_BAD_REQUEST).json({
				error: "Missing required fields",
			});
		}

		let newClass = await ClassMode.create({
			class_name,
			class_desc,
			teacher_id,
			start_time,
			end_time,
			status: CLASS_UPCOMING,
			allowed_students,
		});

		res.status(HTTP_OK).json({ message: "Class Saved" });
	} catch (error) {
		console.error("Error saving new Class:", error);

		res.status(HTTP_INTERNAL_SERVER_ERROR).json({
			error: "Failed to save new Class",
		});
	}
});

router.post("/update", async (req, res) => {
	try {
		const {
			class_id,
			class_name,
			class_desc,
			status,
			teacher_id,
			start_time,
			end_time,
			allowed_students = [],
		} = req.body;
		// const maxIdClass = await ClassMode.findOne().sort({ id: -1 }).limit(1);

		if (
			!class_id ||
			!class_name ||
			!class_desc ||
			!status ||
			!start_time ||
			!end_time ||
			!teacher_id
		) {
			return res.status(HTTP_BAD_REQUEST).json({
				error: "Missing required fields",
			});
		}

		// update class
		await ClassMode.findByIdAndUpdate(
			class_id,
			{
				class_name,
				class_desc,
				teacher_id,
				status,
				start_time,
				end_time,
				allowed_students,
			},
			{ new: true }
		);

		res.status(HTTP_OK).json({ message: "Class Saved" });
	} catch (error) {
		console.error("Error saving new Class:", error);

		res.status(HTTP_INTERNAL_SERVER_ERROR).json({
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

		for (let i = 0; i < classes.length; i++) {
			const classObj = classes[i].toJSON();
			const teacher = await User.findByPk(classObj.teacher_id, {
				attributes: ["name", "email"],
			});
			classObj.teacher = teacher;

			classes[i] = classObj;
		}

		res.status(HTTP_OK).json(classes);
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
			return res.status(HTTP_BAD_REQUEST).json({
				error: "Missing required fields",
			});
		}

		const classObj = await ClassMode.findById(class_id);

		if (!classObj) {
			return res.status(HTTP_BAD_REQUEST).json({
				error: "Class not found",
			});
		}

		const teacher = await User.findByPk(classObj.teacher_id, {
			attributes: ["name", "email"],
		});

		res.status(HTTP_OK).json({ class: { ...classObj.toJSON(), teacher } });
	} catch (err) {
		res.status(HTTP_INTERNAL_SERVER_ERROR).json({
			error: "Failed to fetch class",
		});
	}
});

router.post("/start", async (req, res) => {
	try {
		const { class_id } = req.body;

		if (!class_id) {
			return res.status(HTTP_BAD_REQUEST).json({
				error: "Missing required fields",
			});
		}

		const classObj = await ClassMode.findByIdAndUpdate(
			class_id,
			{ status: CLASS_ONGOING },
			{ new: true }
		);
		res.status(HTTP_OK).json({ classObj });
	} catch (err) {
		res.status(HTTP_INTERNAL_SERVER_ERROR).json({
			error: "Failed to start class",
		});
	}
});

router.post("/end", async (req, res) => {
	try {
		const { class_id, status } = req.body;

		if (!class_id || !status) {
			return res.status(HTTP_BAD_REQUEST).json({
				error: "Missing required fields",
			});
		}

		const classObj = await ClassMode.findByIdAndUpdate(
			class_id,
			{ status: status },
			{ new: true }
		);

		res.status(HTTP_OK).json({ classObj });
	} catch (err) {
		res.status(HTTP_INTERNAL_SERVER_ERROR).json({
			error: "Failed to start class",
		});
	}
});

router.post("/join", async (req, res) => {
	try {
		const { class_id, student_id } = req.body;

		if (!class_id || !student_id) {
			return res.status(HTTP_BAD_REQUEST).json({
				error: "Missing required fields",
			});
		}

		const classObj = await ClassMode.findByIdAndUpdate(
			class_id,
			{ $push: { attendees: student_id } },
			{ new: true }
		);
		res.status(HTTP_OK).json({ classObj });
	} catch (err) {
		res.status(HTTP_INTERNAL_SERVER_ERROR).json({
			error: "Failed to join class",
		});
	}
});

router.post("/leave", async (req, res) => {
	try {
		const { class_id, student_id } = req.body;

		if (!class_id || !student_id) {
			return res.status(HTTP_BAD_REQUEST).json({
				error: "Missing required fields",
			});
		}

		const classObj = await ClassMode.findByIdAndUpdate(
			class_id,
			{ $pull: { attendees: student_id } },
			{ new: true }
		);
		res.status(HTTP_OK).json({ classObj });
	} catch (err) {
		res.status(HTTP_INTERNAL_SERVER_ERROR).json({
			error: "Failed to leave class",
		});
	}
});

router.post("/add-student", async (req, res) => {
	try {
		const { class_id, email } = req.body;

		if (!class_id || !email) {
			return res.status(HTTP_BAD_REQUEST).json({
				error: "Missing required fields",
			});
		}

		const classObj = await ClassMode.findByIdAndUpdate(
			class_id,
			{ $push: { allowed_students: email } },
			{ new: true }
		);
		res.status(HTTP_OK).json({ classObj });
	} catch (err) {
		res.status(HTTP_INTERNAL_SERVER_ERROR).json({
			error: "Failed to add student",
		});
	}
});

router.post("/remove-student", async (req, res) => {
	try {
		const { class_id, email } = req.body;

		if (!class_id || !email) {
			return res.status(HTTP_BAD_REQUEST).json({
				error: "Missing required fields",
			});
		}

		const classObj = await ClassMode.findByIdAndUpdate(
			class_id,
			{ $pull: { allowed_students: email } },
			{ new: true }
		);
		res.status(HTTP_OK).json({ classObj });
	} catch (err) {
		res.status(HTTP_INTERNAL_SERVER_ERROR).json({
			error: "Failed to remove student",
		});
	}
});

router.post("/end", async (req, res) => {
	try {
		const { class_id } = req.body;

		if (!class_id) {
			return res.status(HTTP_BAD_REQUEST).json({
				error: "Missing required fields",
			});
		}

		const classObj = await ClassMode.findByIdAndUpdate(
			class_id,
			{ has_started: false },
			{ new: true }
		);
		res.status(HTTP_OK).json({ classObj });
	} catch (err) {
		res.status(HTTP_INTERNAL_SERVER_ERROR).json({
			error: "Failed to end class",
		});
	}
});

module.exports = router;

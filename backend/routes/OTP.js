const express = require("express");
const {
	HTTP_BAD_REQUEST,
	HTTP_OK,
	HTTP_INTERNAL_SERVER_ERROR,
	HTTP_SERVICE_UNAVAILABLE,
} = require("../utils/http_status_codes");
const { OTP } = require("../models/sql/OTP");
const {
	OTP_TARGET_EMAIL,
	OTP_TARGET_PHONE,
} = require("../enums/otp_target_type");
const { OTP_FOR_EMAIL, OTP_FOR_PHONE } = require("../enums/otp_for_type");
const { mailTransporter } = require("../init.nodemailer");
const otp_target_type = require("../enums/otp_target_type");
const { sequelize } = require("../init.sequelize");

const router = express.Router();

router.post("/create", async (req, res) => {
	const { otp_for_type, otp_for, otp_target_type, otp_target } = req.body;
	// TODO : if otp for, otp target match, check if previously sent otp is expired, if not send same
	if (!otp_target_type || !otp_target || !otp_for_type || !otp_for) {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ message: "Missing required fields" });
	}

	try {
		if (otp_for_type === OTP_FOR_EMAIL) {
			// validate email
		} else if (otp_for_type === OTP_FOR_PHONE) {
			// validate phone
		} else {
			return res
				.status(HTTP_BAD_REQUEST)
				.json({ message: "Invalid otp for type" });
		}

		if (otp_target_type === OTP_TARGET_EMAIL) {
			// validate email
		} else if (otp_target_type === OTP_TARGET_PHONE) {
			// validate phone
		} else {
			return res
				.status(HTTP_BAD_REQUEST)
				.json({ message: "Invalid otp target type" });
		}

		// generate otp
		const value = Math.floor(100000 + Math.random() * 900000);

		// create time
		const otp_created_at = new Date();

		// expiry time
		const otp_expiry_at = new Date();
		otp_expiry_at.setMinutes(otp_created_at.getMinutes() + 2);

		const otp = await OTP.create({
			value,
			otp_for_type,
			otp_for,
			otp_target_type,
			otp_target,
			otp_created_at,
			otp_expiry_at,
		});

		if (!otp) {
			return res.status(HTTP_INTERNAL_SERVER_ERROR).send();
		}

		// send otp to user
		if (otp_target_type === OTP_TARGET_EMAIL) {
			// send otp to email
			mailTransporter.sendMail(
				{
					from: "dev.6amyoga@gmail.com",
					to: otp_target,
					subject: "6AM Yoga | OTP Verification",
					text: "OTP for verification: " + value,
				},
				async (err, info) => {
					if (err) {
						await t.rollback();
						console.error(err);
						res.status(HTTP_INTERNAL_SERVER_ERROR).json({
							message: "Internal server error; try again",
						});
					} else {
						res.status(HTTP_OK).json({
							message: "OTP sent successfully to email",
						});
					}
				}
			);
		} else if (otp_target_type === OTP_TARGET_PHONE) {
			// send otp to phone
		} else {
			return res
				.status(HTTP_BAD_REQUEST)
				.json({ message: "Invalid otp target type" });
		}

		// return res.status(HTTP_OK).json({ message: "OTP sent successfully" });
	} catch (error) {
		return res.status(HTTP_INTERNAL_SERVER_ERROR).json({ message: error });
	}
});

router.post("/send/:otp_id", async (req, res) => {
	const { otp_id } = req.params;

	const otp = await OTP.findByPk(otp_id);

	if (!otp) {
		return res.status(HTTP_BAD_REQUEST).json({ message: "Invalid OTP ID" });
	}

	// send otp to user

	return res.status(HTTP_OK).json({ message: "OTP sent successfully" });
});

router.post("/resend", async (req, res) => {
	res.status(HTTP_SERVICE_UNAVAILABLE).json({ message: "Not implemented" });
});

router.post("/verify", async (req, res) => {
	const { otp_for_type, otp_for, value, otp_target_type, otp_target } =
		req.body;

	if (
		!otp_for_type ||
		!otp_for ||
		!value ||
		!otp_target_type ||
		!otp_target
	) {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ message: "Missing required fields" });
	}

	const t = await sequelize.transaction();

	try {
		const otp = await OTP.findOne({
			where: {
				value,
				otp_for_type,
				otp_for,
				otp_target_type,
				otp_target,
			},
			transaction: t,
		});

		if (!otp) {
			return res
				.status(HTTP_BAD_REQUEST)
				.json({ message: "Invalid OTP" });
		}

		if (otp.is_verified) {
			return res
				.status(HTTP_BAD_REQUEST)
				.json({ message: "OTP already verified" });
		}

		// expiry time

		const otp_expiry_at = new Date(otp.otp_expiry_at);
		const current_time = new Date();

		if (current_time > otp_expiry_at) {
			return res
				.status(HTTP_BAD_REQUEST)
				.json({ message: "OTP expired" });
		}

		otp.is_verified = true;
		await otp.save({
			transaction: t,
		});
		await t.commit();
		return res
			.status(HTTP_OK)
			.json({ message: "OTP verified successfully" });
	} catch (error) {
		await t.rollback();
		return res.status(HTTP_INTERNAL_SERVER_ERROR).send();
	}
});

module.exports = router;

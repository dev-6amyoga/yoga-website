const express = require("express");
const {
	RAZORPAY_KEY_ID,
	RAZORPAY_KEY_SECRET,
	RAZORPAY_LIVE_KEY_ID,
	RAZORPAY_LIVE_KEY_SECRET,
	SECRET_KEY,
} = process.env;
// const { sequelize } = require("../init.sequelize");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { sequelize } = require("../init.sequelize");
const { Transaction } = require("../models/sql/Transaction");
const {
	HTTP_BAD_REQUEST,
	HTTP_INTERNAL_SERVER_ERROR,
	HTTP_OK,
} = require("../utils/http_status_codes");
const {
	TRANSACTION_FAILED,
	TRANSACTION_CANCELLED,
	TRANSACTION_TIMEOUT,
	TRANSACTION_SUCCESS,
} = require("../enums/transaction_status");
const { Refund } = require("../models/sql/Refund");
const {
	REFUND_PENDING,
	REFUND_PROCESSED,
	REFUND_ERROR,
} = require("../enums/refund_status");
const { Op } = require("sequelize");
const { authenticateToken } = require("../utils/jwt");

router.post("/order", authenticateToken, async (req, res) => {
	const razorpay = new Razorpay({
		key_id: RAZORPAY_KEY_ID,
		key_secret: RAZORPAY_KEY_SECRET,
		// key_id: RAZORPAY_LIVE_KEY_ID,
		// key_secret: RAZORPAY_LIVE_KEY_SECRET,
	});

	console.log(req.body.amount);
	const options = {
		amount: req.body.amount,
		currency: req.body.currency,
		receipt: "any unique id for every order",
		payment_capture: 1,
	};
	try {
		const response = await razorpay.orders.create(options);
		res.status(HTTP_OK).json({ order: response });
	} catch (err) {
		console.error("Razorpay Error:", err.error);
		res.status(HTTP_BAD_REQUEST).json({ error: err.error });
	}
});

router.post("/commit", authenticateToken, async (req, res) => {
	/*
    user_id: user making the payment
    status: success || failed || cancelled || timedout
  */
	console.log({ body: req.body });

	const {
		user_id,
		status,
		payment_for,
		payment_method,
		amount,
		signature,
		order_id,
		payment_id,
		currency_id,
	} = req.body;

	if (!user_id || !status) {
		return res.status(HTTP_BAD_REQUEST).json({
			message: "Missing required fields",
		});
	}

	switch (status) {
		case TRANSACTION_FAILED:
			if (!order_id || !payment_id) {
				return res.status(HTTP_BAD_REQUEST).json({
					message: "Missing required fields",
				});
			}
			break;
		case TRANSACTION_CANCELLED:
			if (!order_id) {
				return res.status(HTTP_BAD_REQUEST).json({
					message: "Missing required fields",
				});
			}
			break;
		case TRANSACTION_TIMEOUT:
			if (!order_id) {
				return res.status(HTTP_BAD_REQUEST).json({
					message: "Missing required fields",
				});
			}
			break;
		case TRANSACTION_SUCCESS:
			if (
				!payment_for ||
				!amount ||
				!payment_method ||
				!status ||
				!signature ||
				!order_id ||
				!payment_id ||
				!currency_id
			) {
				return res.status(HTTP_BAD_REQUEST).json({
					message: "Missing required fields",
				});
			}
			break;
		default:
			return res.status(HTTP_BAD_REQUEST).json({
				message: "Invalid status",
			});
	}

	// TODO: fix this; not same as frontend hash for some reason
	const data = crypto.createHmac("sha256", SECRET_KEY, {});
	data.update(`${order_id}|${payment_id}`);
	const digest = data.digest("hex");
	// console.log(digest, signature);

	const t = await sequelize.transaction();

	try {
		// create a transaction in the database
		const transaction = await Transaction.create(
			{
				payment_for: payment_for,
				payment_method: payment_method,
				amount: amount,
				payment_status: status,
				payment_date: new Date(),
				transaction_order_id: order_id,
				transaction_payment_id: payment_id,
				transaction_signature: signature,
				user_id: user_id,
				currency_id: currency_id,
			},
			{ transaction: t }
		);

		await t.commit();
		return res
			.status(HTTP_OK)
			.json({ status: "successfully saved transaction" });
	} catch (err) {
		console.log(err);
		await t.rollback();
		return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
			message: "Something went wrong, try again!",
		});
	}
});

router.post("/refund/history", async (req, res) => {
	const { transaction_id } = req.body;

	if (!transaction_id) {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ message: "Missing required fields" });
	}

	// const razorpay = new Razorpay({
	// 	key_id: RAZORPAY_KEY_ID,
	// 	key_secret: RAZORPAY_KEY_SECRET,
	// });

	try {
		const transaction = await Transaction.findOne({
			where: {
				transaction_id: transaction_id,
			},
		});

		if (!transaction) {
			return res
				.status(HTTP_BAD_REQUEST)
				.json({ message: "Transaction not found" });
		}

		const refunds = await transaction.getRefunds();
		// console.log(refunds);

		return res.status(HTTP_OK).json({ refunds });
	} catch (err) {
		console.log(err);
		return res
			.status(HTTP_INTERNAL_SERVER_ERROR)
			.json({ message: "Failed to fetch refund history" });
	}
});

router.post("/refund/create", async (req, res) => {
	console.log(req.body);
	const { transaction_payment_id, amount, currency } = req.body;

	if (!transaction_payment_id || !amount || !currency) {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ message: "Missing required fields" });
	}

	if (amount <= 100) {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ message: "Minimum refundable amount is 1" });
	}

	const t = await sequelize.transaction();
	let refund = null;
	let razorpayResponse = null;

	try {
		const razorpay = new Razorpay({
			key_id: RAZORPAY_KEY_ID,
			key_secret: RAZORPAY_KEY_SECRET,
		});

		const transaction = await Transaction.findOne({
			where: {
				transaction_payment_id: transaction_payment_id,
			},
			transaction: t,
		});

		if (!transaction) {
			return res
				.status(HTTP_BAD_REQUEST)
				.json({ message: "Transaction not found" });
		}

		if (transaction.payment_status !== TRANSACTION_SUCCESS) {
			return res
				.status(HTTP_BAD_REQUEST)
				.json({ message: "Transaction is not successful" });
		}

		if (transaction.amount !== amount) {
			return res
				.status(HTTP_BAD_REQUEST)
				.json({ message: "Amount does not match" });
		}

		// check if refund already exists
		const refunds = await Refund.findAll({
			where: {
				transaction_id: transaction.transaction_id,
				refund_status: { [Op.or]: [REFUND_PENDING, REFUND_PROCESSED] },
			},
		});

		if (refunds.length > 0) {
			return res
				.status(HTTP_BAD_REQUEST)
				.json({ message: "Refund already exists/is in progress." });
		}

		// create a refund transaction
		refund = await Refund.create(
			{
				transaction_id: transaction.transaction_id,
				refund_reason: "Refund for transaction",
				payment_method: "razorpay",
				amount: amount,
				refund_status: REFUND_PENDING,
				payment_date: new Date(),
			},
			{ transaction: t }
		);

		/*
		REQ: 
		path param : payment_id
		body : {
			"amount": "100",
			"speed": "normal",
			"notes": {
				"notes_key_1": "Beam me up Scotty.",
				"notes_key_2": "Engage"
			},
			"receipt": "Receipt No. 31"
		}
		RES : {
				"id": "rfnd_FP8QHiV938haTz",
				"entity": "refund",
				"amount": 500100,
				"receipt": "Receipt No. 31",
				"currency": "INR",
				"payment_id": "pay_29QQoUBi66xm2f",
				"notes": []
				"receipt": null,
				"acquirer_data": {
						"arn": null
				},
				"created_at": 1597078866,
				"batch_id": null,
				"status": "processed",
				"speed_processed": "normal",
				"speed_requested": "normal"
		}
		ERR: 
		{
				"error": {
						"code": "BAD_REQUEST_ERROR",
						"description": "The amount must be atleast INR 1.00",
						"source": "business",
						"step": "payment_initiation",
						"reason": "input_validation_failed",
						"metadata": {},
						"field": "amount"
				}
		}
		*/

		console.log(transaction_payment_id, {
			amount: amount,
			speed: "normal",
			receipt: refund.refund_id,
		});

		razorpayResponse = await razorpay.payments.refund(
			transaction_payment_id,
			{
				amount: amount,
				speed: "normal",
				notes: {},
				receipt: String(refund.refund_id),
			}
		);

		if (!razorpayResponse) {
			return res
				.status(HTTP_INTERNAL_SERVER_ERROR)
				.json({ message: "Failed to issue a refund" });
		}

		if (razorpayResponse?.error) {
			refund.refund_error_code = razorpayResponse.error.code || null;
			refund.refund_error_desc =
				razorpayResponse.error.description || null;
			refund.refund_error_reason = razorpayResponse.error.reason || null;
			return res
				.status(HTTP_BAD_REQUEST)
				.json({ message: "Failed to issue a refund" });
		}

		refund.refund_payment_id = razorpayResponse.id;

		console.log(razorpayResponse);

		await refund.save({ transaction: t });

		await t.commit();
		res.status(HTTP_OK).json("Successfully refunded");
	} catch (err) {
		console.log(err);

		if (refund) {
			refund.refund_status = REFUND_ERROR;
			refund.refund_error_code = err?.error?.code || null;
			refund.refund_error_desc = err?.error?.description || null;
			refund.refund_error_reason = err?.error?.reason || null;
			await refund.save({ transaction: t });
			await t.commit();

			return res.status(HTTP_BAD_REQUEST).json({
				message: "Unable to issue a refund",
			});
		} else {
			await t.rollback();
			return res.status(HTTP_BAD_REQUEST).json({
				message: "Unable to issue a refund",
			});
		}
	}
});

router.post("/refund/webhook", async (req, res) => {
	/*
		EVENT: razorpay payment refund
		EVENT NAME :
	*/
});

module.exports = router;

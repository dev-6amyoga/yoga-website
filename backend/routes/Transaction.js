const express = require("express");
const router = express.Router();
const { Transaction } = require("../models/sql/Transaction");
const {
	HTTP_BAD_REQUEST,
	HTTP_OK,
	HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");
const { authenticateToken } = require("../utils/jwt");
const { hasPermission } = require("../utils/hasPermission");
const { DiscountCoupon } = require("../models/sql/DiscountCoupon");
const { User } = require("../models/sql/User");
const { ReferralCode } = require("../models/sql/ReferralCode");
const { Currency } = require("../models/sql/Currency");
const { UserPlan } = require("../models/sql/UserPlan");
const { Plan } = require("../models/sql/Plan");
const { Refund } = require("../models/sql/Refund");
const { sequelize } = require("../init.sequelize");
const { TRANSACTION_SUCCESS } = require("../enums/transaction_status");
const { Op } = require("sequelize");

module.exports = router;

router.post("/get-transaction-by-user-id", async (req, res) => {
	const { user_id } = req.body;
	console.log(user_id);
	if (!user_id) {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ error: "Missing required fields" });
	}
	try {
		const all_transaction_for_user = await Transaction.findAll({
			where: {
				user_id: user_id,
			},
		});

		return res.status(HTTP_OK).json({ all_transaction_for_user });
	} catch (err) {
		return res
			.status(HTTP_INTERNAL_SERVER_ERROR)
			.json({ error: "Failed to fetch transactions!" });
	}
});

router.post("/add-transaction", async (req, res) => {
	const {
		payment_for,
		payment_method,
		amount,
		payment_status,
		payment_date,
		transaction_order_id,
		transaction_payment_id,
		transaction_signature,
		user_id,
	} = req.body;
	if (
		!payment_for ||
		!payment_method ||
		!amount ||
		!payment_status ||
		!payment_date ||
		!transaction_order_id ||
		!transaction_payment_id ||
		!transaction_signature ||
		!user_id
	) {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ error: "Missing required fields" });
	}

	try {
		const newTransaction = await Transaction.create({
			payment_for,
			payment_method,
			amount,
			payment_status,
			payment_date,
			transaction_order_id,
			transaction_payment_id,
			transaction_signature,
			user_id,
		});

		return res.status(HTTP_OK).json({ newTransaction });
	} catch (err) {
		console.error(err);
		return res
			.status(HTTP_INTERNAL_SERVER_ERROR)
			.json({ error: "Failed to add a new transaction" });
	}
});

router.get("/get-all", async (req, res) => {
	try {
		const transactions = await Transaction.findAll({
			include: [
				{ model: User },
				{ model: UserPlan, include: [{ model: Plan }] },
				{ model: Refund },
				{ model: DiscountCoupon },
				{ model: ReferralCode },
				{ model: Currency },
			],
		});
		return res.status(HTTP_OK).json({ transactions });
	} catch (err) {
		console.log(err);
		return res
			.status(HTTP_INTERNAL_SERVER_ERROR)
			.json({ error: "Failed to fetch transactions!" });
	}
});

router.get("/admin-stats/revenue-per-month", async (req, res) => {
	try {
		const revenuePerMonth = await Transaction.findAll({
			where: {
				payment_status: {
					[Op.or]: [TRANSACTION_SUCCESS, "succeeded"],
				},
			},
			attributes: [
				[
					sequelize.fn(
						"to_char",
						sequelize.col("payment_date"),
						"YYYYMM"
					),
					"month",
				],
				[sequelize.fn("sum", sequelize.col("amount")), "Revenue"],
			],
			include: [
				{ model: Currency, attributes: ["short_tag"], as: "currency" },
			],
			group: [
				sequelize.fn(
					"to_char",
					sequelize.col("payment_date"),
					"YYYYMM"
				),
				"currency.short_tag",
				"currency.currency_id",
			],
		});

		// reduce per month key
		const reduced = revenuePerMonth.reduce((acc, { dataValues }) => {
			const { month, Revenue, currency } = dataValues;

			if (currency === null) {
				return acc;
			}

			const idx = acc.findIndex((el) => el.month === month);

			if (idx === -1) {
				acc.push({
					month,
					[currency.short_tag]: Revenue,
				});
				return acc;
			}

			acc[idx][currency.short_tag] = Revenue;
			return acc;
		}, []);

		return res.status(HTTP_OK).json({ revenuePerMonth: reduced });
	} catch (err) {
		console.log(err);
		return res
			.status(HTTP_INTERNAL_SERVER_ERROR)
			.json({ error: "Failed to fetch transactions!" });
	}
});

router.get("/admin-stats/current-month-revenue", async (req, res) => {
	try {
		const currentMonthRevenue = await Transaction.findAll({
			where: {
				payment_status: {
					[Op.or]: [TRANSACTION_SUCCESS, "succeeded"],
				},
				payment_date: {
					[Op.gte]: new Date(
						new Date().getFullYear(),
						new Date().getMonth(),
						1
					),
					[Op.lte]: new Date(
						new Date().getFullYear(),
						new Date().getMonth() + 1,
						0
					),
				},
			},
			attributes: [
				[sequelize.fn("sum", sequelize.col("amount")), "revenue"],
			],
			include: [
				{ model: Currency, attributes: ["short_tag"], as: "currency" },
			],
			group: ["currency.short_tag", "currency.currency_id"],
		});

		return res
			.status(HTTP_OK)
			.json({ currentMonthRevenue: currentMonthRevenue });
	} catch (err) {
		console.log(err);
		return res
			.status(HTTP_INTERNAL_SERVER_ERROR)
			.json({ error: "Failed to fetch transactions!" });
	}
});

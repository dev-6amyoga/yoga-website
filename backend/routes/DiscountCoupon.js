const express = require("express");

// const { sequelize } = require("../init.sequelize");
const router = express.Router();

const { sequelize } = require("../init.sequelize");
const { DiscountCoupon } = require("../models/sql/DiscountCoupon");
const {
	DiscountCouponApplicablePlan,
} = require("../models/sql/DiscountCouponApplicablePlan");
const { Plan } = require("../models/sql/Plan");
const { Op } = require("sequelize");
const {
	HTTP_BAD_REQUEST,
	HTTP_INTERNAL_SERVER_ERROR,
	HTTP_OK,
} = require("../utils/http_status_codes");
const { authenticateToken } = require("../utils/jwt");
const { Transaction } = require("../models/sql/Transaction");
const { TRANSACTION_SUCCESS } = require("../enums/transaction_status");
const DiscountCouponApplicableCustomPlan = require("../models/mongo/DiscountCouponApplicableCustomPlan");
const { default: mongoose } = require("mongoose");

router.post("/check-plan-mapping", authenticateToken, async (req, res) => {
	const { plan_id, is_custom_plan = false, coupon_name } = req.body;
	const { user_id } = req.user;

	console.log(plan_id, is_custom_plan, coupon_name);

	if (
		!plan_id ||
		!coupon_name ||
		user_id === null ||
		user_id === undefined ||
		is_custom_plan === null ||
		is_custom_plan === undefined
	) {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ message: "Missing required fields" });
	}

	// if custom plan, plan_id should be a string, else number
	if (is_custom_plan && typeof plan_id !== "string") {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ message: "Invalid plan_id" });
	} else if (!is_custom_plan && typeof plan_id !== "number") {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ message: "Invalid plan_id" });
	}

	try {
		const date_now = new Date();

		let discount_coupon = null;

		// NORMAL PLAN
		if (!is_custom_plan) {
			const discount_coupon_applicable_plan =
				await DiscountCouponApplicablePlan.findOne({
					include: [
						{
							model: DiscountCoupon,
							where: {
								coupon_name: coupon_name,
								validity_from: {
									[Op.lte]: date_now,
								},
								validity_to: {
									[Op.gte]: date_now,
								},
							},
						},
						{
							model: Plan,
							where: {
								plan_id: plan_id,
							},
						},
					],
				});

			if (!discount_coupon_applicable_plan) {
				return res
					.status(HTTP_BAD_REQUEST)
					.json({ error: "Coupon is not applicable" });
			}

			discount_coupon = discount_coupon_applicable_plan.discount_coupon;
		} else {
			// CUSTOM PLAN MAPPING
			discount_coupon = await DiscountCoupon.findOne({
				where: {
					coupon_name: coupon_name,
					validity_from: {
						[Op.lte]: date_now,
					},
					validity_to: {
						[Op.gte]: date_now,
					},
				},
				attributes: [
					"discount_coupon_id",
					"coupon_name",
					"coupon_description",
					"discount_percentage",
					"validity_from",
					"validity_to",
				],
			});

			if (!discount_coupon) {
				return res
					.status(HTTP_BAD_REQUEST)
					.json({ error: "Coupon is not applicable" });
			}

			const discount_coupon_applicable_custom_plan =
				await DiscountCouponApplicableCustomPlan.findOne({
					discount_coupon_id:
						discount_coupon.get("discount_coupon_id"),
					custom_plan_id: new mongoose.Schema.Types.ObjectId(plan_id),
				});

			if (!discount_coupon_applicable_custom_plan) {
				return res
					.status(HTTP_BAD_REQUEST)
					.json({ error: "Coupon is not applicable" });
			}
		}

		if (!discount_coupon) {
			return res
				.status(HTTP_BAD_REQUEST)
				.json({ error: "Coupon is not applicable" });
		}

		// check if the coupon has been used
		const transactions = await Transaction.findAll({
			where: {
				user_id: user_id,
				discount_coupon_id: discount_coupon.discount_coupon_id,
				payment_status: TRANSACTION_SUCCESS,
			},
		});

		if (transactions.length > 0) {
			return res
				.status(HTTP_BAD_REQUEST)
				.json({ error: "Coupon already used" });
		}

		return res.status(HTTP_OK).json({
			message: "Coupon applicable",
			discount_coupon: discount_coupon_applicable_plan.discount_coupon,
		});
	} catch (error) {
		return res
			.status(HTTP_INTERNAL_SERVER_ERROR)
			.json({ message: "Internal Server Error" });
	}
});

router.post("/create", async (req, res) => {
	const {
		coupon_name,
		coupon_description,
		discount_percentage,
		validity_from,
		validity_to,
		plan_ids,
	} = req.body;

	if (!coupon_name || !validity_from || !validity_to) {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ message: "Missing required fields" });
	}

	const t = await sequelize.transaction();
	const mt = await mongoose.startSession();

	if (!mt.inTransaction()) {
		mt.startTransaction();
	}

	try {
		const [discount_coupon, created] = await DiscountCoupon.findOrCreate({
			where: { coupon_name: coupon_name },
			defaults: {
				coupon_name: coupon_name,
				coupon_description: coupon_description,
				discount_percentage: discount_percentage,
				validity_from: new Date(validity_from),
				validity_to: new Date(validity_to),
			},
			transaction: t,
		});

		if (!created) {
			await t.rollback();
			return res
				.status(HTTP_BAD_REQUEST)
				.json({ message: "Coupon name already exists" });
		}

		if (plan_ids && plan_ids.length > 0) {
			// NORMAL PLAN
			const discount_coupon_applicable_plans = plan_ids
				.filter((pid) => typeof pid === "number")
				.map((plan_id) => {
					return {
						discount_coupon_id: discount_coupon.discount_coupon_id,
						plan_id: plan_id,
					};
				});

			await DiscountCouponApplicablePlan.bulkCreate(
				discount_coupon_applicable_plans,
				{ transaction: t }
			);

			// CUSTOM PLAN
			const discount_coupon_applicable_custom_plans = plan_ids
				.filter((pid) => typeof pid === "string")
				.filter((pid) => mongoose.isValidObjectId(pid))
				.map((plan_id) => {
					return {
						discount_coupon_id: discount_coupon.discount_coupon_id,
						custom_plan_id: new mongoose.Types.ObjectId(plan_id),
					};
				});

			await DiscountCouponApplicableCustomPlan.create(
				discount_coupon_applicable_custom_plans,
				{ session: mt }
			);
		}

		await t.commit();
		await mt.commitTransaction();
		await mt.endSession();
		return res.status(HTTP_OK).json({ message: "Coupon created" });
	} catch (err) {
		console.log(err);
		await t.rollback();
		await mt.abortTransaction();
		await mt.endSession();
		return res
			.status(HTTP_INTERNAL_SERVER_ERROR)
			.json({ message: "Internal Server Error" });
	}
});

router.post("/add-plan-mapping", async (req, res) => {
	const { discount_coupon_id, plan_id, is_custom_plan = false } = req.body;

	if (!discount_coupon_id || !plan_id) {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ message: "Missing required fields" });
	}

	// if custom plan, plan_id should be a string, else number
	if (is_custom_plan && typeof plan_id !== "string") {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ message: "Invalid plan_id" });
	} else if (!is_custom_plan && typeof plan_id !== "number") {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ message: "Invalid plan_id" });
	}

	let t = null;

	if (!is_custom_plan) {
		t = await sequelize.transaction();
	} else {
		t = await mongoose.startSession();
		t.startTransaction();
	}

	try {
		if (!is_custom_plan) {
			const [discount_coupon_applicable_plan, created] =
				await DiscountCouponApplicablePlan.findOrCreate({
					where: {
						discount_coupon_id: discount_coupon_id,
						plan_id: plan_id,
					},
					defaults: {
						discount_coupon_id: discount_coupon_id,
						plan_id: plan_id,
					},
					transaction: t,
				});

			// DiscountCouponApplicablePlan.bulkCreate([], {});

			if (!created) {
				if (t) await t.rollback();
				return res
					.status(HTTP_BAD_REQUEST)
					.json({ message: "Mapping already exists" });
			}

			if (t) await t.commit();
			return res.status(HTTP_OK).json({ message: "Sucessfully mapped" });
		} else {
			let options = t !== null ? { session: t } : {};

			const discount_coupon_applicable_custom_plan =
				await DiscountCouponApplicableCustomPlan.findOne(
					{
						discount_coupon_id: discount_coupon_id,
						custom_plan_id: new mongoose.Schema.Types.ObjectId(
							plan_id
						),
					},
					options
				);

			if (discount_coupon_applicable_custom_plan) {
				if (t) {
					await t.abortTransaction();
					await t.endSession();
				}
				return res
					.status(HTTP_BAD_REQUEST)
					.json({ message: "Mapping already exists" });
			}

			await DiscountCouponApplicableCustomPlan.create(
				{
					discount_coupon_id: discount_coupon_id,
					custom_plan_id: new mongoose.Schema.Types.ObjectId(plan_id),
				},
				options
			);

			if (t) {
				await t.commitTransaction();
				await t.endSession();
			}
			return res.status(HTTP_OK).json({ message: "Successfully mapped" });
		}
	} catch (err) {
		console.log(err);

		if (t && is_custom_plan) {
			await t.abortTransaction();
			await t.endSession();
		}
		if (t && !is_custom_plan) await t.rollback();

		return res
			.status(HTTP_INTERNAL_SERVER_ERROR)
			.json({ message: "Internal Server Error" });
	}
});

router.post("/remove-plan-mapping", async (req, res) => {
	const { discount_coupon_id, plan_id, is_custom_plan } = req.body;

	if (!discount_coupon_id || !plan_id) {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ message: "Missing required fields" });
	}

	// if custom plan, plan_id should be a string, else number
	if (is_custom_plan && typeof plan_id !== "string") {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ message: "Invalid plan_id" });
	} else if (!is_custom_plan && typeof plan_id !== "number") {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ message: "Invalid plan_id" });
	}

	const t = await sequelize.transaction();
	try {
		const discount_coupon_applicable_plan =
			await DiscountCouponApplicablePlan.findOne(
				{
					where: {
						discount_coupon_id: discount_coupon_id,
						plan_id: plan_id,
					},
				},
				{ transaction: t }
			);

		if (!discount_coupon_applicable_plan) {
			await t.rollback();
			return res
				.status(HTTP_BAD_REQUEST)
				.json({ message: "Mapping does not exist" });
		}

		await discount_coupon_applicable_plan.destroy({ transaction: t });

		await t.commit();
		return res.status(HTTP_OK).json({ message: "Successfully removed" });
	} catch (error) {
		await t.rollback();
		return res
			.status(HTTP_INTERNAL_SERVER_ERROR)
			.json({ message: "Internal Server Error" });
	}
});

router.post("/get-all", async (req, res) => {
	try {
		let dcs = await DiscountCoupon.findAll();

		let applicable_plans = await DiscountCouponApplicablePlan.findAll({
			include: [
				{
					model: Plan,
					attributes: ["plan_id", "name", "plan_user_type"],
				},
			],
		});

		let discount_coupons = dcs.map((dc) => {
			return {
				...dc.toJSON(),
				discount_coupon_applicable_plans: applicable_plans.filter(
					(ap) => ap.discount_coupon_id === dc.discount_coupon_id
				),
			};
		});

		return res.status(HTTP_OK).json({ discount_coupons });
	} catch (error) {
		console.log(error);
		return res
			.status(HTTP_INTERNAL_SERVER_ERROR)
			.json({ message: "Internal Server Error" });
	}
});

router.post("/get-by-id", async (req, res) => {
	const { discount_coupon_id } = req.body;

	if (!discount_coupon_id) {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ message: "Missing required fields" });
	}

	try {
		let discount_coupon = await DiscountCoupon.findOne({
			where: {
				discount_coupon_id: discount_coupon_id,
			},
		});

		if (!discount_coupon) {
			return res
				.status(HTTP_BAD_REQUEST)
				.json({ message: "Coupon does not exist" });
		}

		const discount_coupon_applicable_plans =
			await DiscountCouponApplicablePlan.findAll({
				where: {
					discount_coupon_id: discount_coupon_id,
				},
				include: [
					{
						model: Plan,
						attributes: ["plan_id", "name", "plan_user_type"],
					},
				],
			});

		let dc = {
			...discount_coupon?.toJSON(),
			discount_coupon_applicable_plans:
				discount_coupon_applicable_plans?.map((p) => p.toJSON()) ?? [],
		};

		// console.log(discount_coupon.discount_coupon_applicable_plans);

		return res.status(HTTP_OK).json({ discount_coupon: dc });
	} catch (error) {
		return res
			.status(HTTP_INTERNAL_SERVER_ERROR)
			.json({ message: "Internal Server Error" });
	}
});

router.post("/update", async (req, res) => {
	const {
		discount_coupon_id,
		coupon_name,
		coupon_description,
		discount_percentage,
		validity_from,
		validity_to,
	} = req.body;

	if (
		!discount_coupon_id ||
		!coupon_name ||
		!validity_from ||
		!validity_to ||
		!discount_percentage
	) {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ message: "Missing required fields" });
	}

	try {
		const discount_coupon = await DiscountCoupon.findOne({
			where: {
				discount_coupon_id: discount_coupon_id,
			},
		});

		if (!discount_coupon) {
			return res
				.status(HTTP_BAD_REQUEST)
				.json({ message: "Coupon does not exist" });
		}

		discount_coupon.coupon_name = coupon_name;
		discount_coupon.coupon_description = coupon_description;
		discount_coupon.validity_from = validity_from;
		discount_coupon.validity_to = validity_to;
		discount_coupon.discount_percentage = discount_percentage;

		await discount_coupon.save();

		return res.status(HTTP_OK).json({ message: "Coupon updated" });
	} catch (error) {
		return res
			.status(HTTP_INTERNAL_SERVER_ERROR)
			.json({ message: "Internal Server Error" });
	}
});

router.delete("/delete", async (req, res) => {
	const { discount_coupon_id } = req.body;

	if (!discount_coupon_id) {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ message: "Missing required fields" });
	}

	const t = await sequelize.transaction();
	try {
		const discount_coupon = await DiscountCoupon.findOne({
			where: {
				discount_coupon_id: discount_coupon_id,
			},
			transaction: t,
		});

		if (!discount_coupon) {
			await t.rollback();
			return res
				.status(HTTP_BAD_REQUEST)
				.json({ message: "Coupon does not exist" });
		}

		await discount_coupon.destroy({ transaction: t });

		await t.commit();
		return res.status(HTTP_OK).json({ message: "Coupon deleted" });
	} catch (error) {
		await t.rollback();
		return res
			.status(HTTP_INTERNAL_SERVER_ERROR)
			.json({ message: "Internal Server Error" });
	}
});

module.exports = router;

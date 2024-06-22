const { Sequelize, Op } = require("sequelize");
const {
	USER_PLAN_ACTIVE,
	USER_PLAN_EXPIRED_BY_DATE,
	USER_PLAN_EXPIRED_BY_USAGE,
	USER_PLAN_STAGED,
} = require("../enums/user_plan_status");
const { sequelize } = require("../init.sequelize");
const { Plan } = require("../models/sql/Plan");
const { UserPlan } = require("../models/sql/UserPlan");
const WatchTimeQuota = require("../models/mongo/WatchTimeQuota");

const GetCurrentUserPlan = async (user_id, insitute_id) => {
	let user_plan = null,
		error = null;

	const t = await sequelize.transaction();

	try {
		if (insitute_id) {
			user_plan = await UserPlan.findOne({
				where: {
					user_id,
					current_status: USER_PLAN_ACTIVE,
					insitute_id: insitute_id,
				},
				include: [{ model: Plan }],
				transaction: t,
			});
		} else {
			user_plan = await UserPlan.findOne({
				where: {
					user_id,
					current_status: USER_PLAN_ACTIVE,
				},
				include: [{ model: Plan }],
				transaction: t,
			});
		}

		if (!user_plan) {
			await t.rollback();
			error = "User does not have a plan";
			return [null, error];
		}

		await t.commit();
		return [user_plan, error];
	} catch (err) {
		await t.rollback();
		return [null, err];
	}
};

const UpdateUserPlanStatus = async (
	user_id,
	institute_id,
	transaction = null
) => {
	if (!user_id) {
		return [null, "User ID is required"];
	}

	let ins_id = institute_id ?? null;

	let t = transaction ?? (await sequelize.transaction());

	try {
		// get active plan
		const activePlan = await UserPlan.findOne({
			where: {
				user_id,
				institute_id: ins_id,
				current_status: USER_PLAN_ACTIVE,
			},
			transaction: t,
			include: [
				{
					model: Plan,
					foreignKey: "plan_id",
				},
			],
		});

		const now = new Date();
		let expired = false || activePlan === null || activePlan === undefined;

		if (activePlan) {
			// check if plan is to be expired by date;
			if (activePlan.get("validity_to") < now) {
				activePlan.set("current_status", USER_PLAN_EXPIRED_BY_DATE);
				await activePlan.save({ transaction: t });
				expired = true;
			}

			// check if plan is to be expired by usage;
			const watchTimeQuota = await WatchTimeQuota.find({
				user_plan_id: activePlan.get("user_plan_id"),
			});

			if (watchTimeQuota.quota < 0) {
				activePlan.set("current_status", USER_PLAN_EXPIRED_BY_USAGE);
				await activePlan.save({ transaction: t });
				expired = true;
			}
		}

		if (expired) {
			const filter = {
				user_id,
				institute_id: ins_id,
				current_status: USER_PLAN_STAGED,
			};

			if (activePlan) {
				filter["purchase_date"] = {
					[Op.gte]: activePlan.get("purchase_date"),
				};
			}

			// promote staged to active if any
			const stagedPlan = await UserPlan.findOne({
				where: filter,
			});

			if (stagedPlan) {
				stagedPlan.set("current_status", USER_PLAN_ACTIVE);
				stagedPlan.set("validity_from", now);

				const validity_to = new Date();

				validity_to.setDate(
					validity_to.getDate() +
						stagedPlan.get("plan").get("plan_validity_days")
				);

				stagedPlan.set("validity_to");

				await stagedPlan.save({ transaction: t });
			}
		}

		if (transaction === null) {
			await t.commit();
		}

		return [null, null];
	} catch (err) {
		console.log(err);
		if (transaction === null) {
			await t.rollback();
		}
		return [null, err];
	}
};

module.exports = {
	GetCurrentUserPlan,
	UpdateUserPlanStatus,
};

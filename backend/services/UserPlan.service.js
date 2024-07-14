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
const CustomUserPlan = require("../models/mongo/CustomUserPlan");
const { default: mongoose } = require("mongoose");

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
	transaction = null,
	mongo_session = null
) => {
	if (!user_id) {
		return [null, "User ID is required"];
	}

	let ins_id = institute_id ?? null;

	let t = transaction ?? (await sequelize.transaction());

	let mt = mongo_session ?? (await mongoose.startSession());

	if (!mt.inTransaction()) {
		mt.startTransaction();
	}

	try {
		// USER PLAN ------------------>
		// get active plan
		console.log("Updating user plan status");
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
				user_plan_id: String(activePlan.get("user_plan_id")),
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
				include: [
					{
						model: Plan,
						foreignKey: "plan_id",
						as: "plan",
					},
				],
			});

			if (stagedPlan) {
				console.log("Promoting staged plan to active plan", stagedPlan);
				stagedPlan.set("current_status", USER_PLAN_ACTIVE);
				stagedPlan.set("validity_from", now);

				const validity_to = new Date();

				validity_to.setDate(
					validity_to.getDate() +
						stagedPlan.get("plan").get("plan_validity_days")
				);

				stagedPlan.set("validity_to", validity_to);

				await stagedPlan.save({ transaction: t });

				// TODO : update watch time quota for newly active plan
				await WatchTimeQuota.create({
					user_plan_id: String(
						stagedPlan.get("plan").get("user_plan_id")
					),
					quota: stagedPlan.get("plan").get("watch_time_limit"),
				});

				// TODO : update UIPR for newly active plan
				const x = await UserInstitutePlanRole.update(
					{
						user_plan_id: stagedPlan.get("user_plan_id"),
					},
					{
						transaction: t,
						where: {
							user_id: user_id,
							role_id: role.role_id,
							institute_id: institute_id,
						},
					}
				);

				if (x[0] === 0) {
					if (transaction === null) {
						await t.rollback();
					}
					return [null, "Failed to update UIPR"];
				}
			}
		}

		// TODO : CUSTOM PLAN ------------------>
		// might be multiple custom plans that are active with different custom plan ids

		// TODO : might need to take into consideration the different custom plan ids

		console.log("Updating custom user plan status");
		let activeCustomUserPlans = await CustomUserPlan.aggregate([
			{
				$match: {
					user_id,
					current_status: USER_PLAN_ACTIVE,
				},
			},
			{
				$lookup: {
					from: "custom_plan",
					localField: "custom_plan_id",
					foreignField: "_id",
					as: "custom_plan",
				},
			},
			{
				$unwind: "$custom_plan",
			},
		]);

		if (activeCustomUserPlans.length > 0) {
			// for each custom plan id, check if it is expired, if yes, promote staged to active

			let processedCustomPlanIds = [];

			for (let i = 0; i < activeCustomUserPlans.length; i++) {
				const customUserPlan = activeCustomUserPlans[i];

				if (
					processedCustomPlanIds.includes(
						customUserPlancustom_plan_id
					)
				) {
					continue;
				}

				processedCustomPlanIds.push(customUserPlancustom_plan_id);

				// check if plan is to be expired by date;
				if (customUserPlanvalidity_to < now) {
					// set status to expired
					const x = await CustomUserPlan.update(
						{
							current_status: USER_PLAN_EXPIRED_BY_DATE,
						},
						{
							transaction: t,
							where: {
								user_id,
								custom_plan_id: customUserPlancustom_plan_id,
								current_status: USER_PLAN_ACTIVE,
							},
						}
					);
				}

				// check if plan is to be expired by usage;

				const watchTimeQuota = await WatchTimeQuota.find({
					user_plan_id: String(customUserPlan._id),
				});

				if (watchTimeQuota.quota <= 0) {
					// set status to expired
					const x = await CustomUserPlan.update(
						{
							current_status: USER_PLAN_EXPIRED_BY_USAGE,
						},
						{
							transaction: t,
							where: {
								user_id,
								custom_plan_id: mongoose.Schema.Types.ObjectId(
									customUserPlan.custom_plan_id
								),
								current_status: USER_PLAN_ACTIVE,
							},
						}
					);
				}

				// if plan is expired, promote staged to active

				const filter = {
					user_id,
					custom_plan_id: mongoose.Schema.Types.ObjectId(
						customUserPlan.custom_plan_id
					),
					current_status: USER_PLAN_STAGED,
				};

				if (customPlan) {
					filter["purchase_date"] = {
						$gt: mongoose.Schema.Types.Date(
							customUserPlan.purchase_date
						),
					};
				}

				// promote staged to active if any
				const stagedCustomUserPlan = await CustomUserPlan.findOne(
					filter
				);

				stagedCustomUserPlan.set("current_status", USER_PLAN_ACTIVE);
				stagedCustomUserPlan.set("validity_from", now.toISOString());

				let validity_to = new Date();

				validity_to.setDate(
					validity_to.getDate() +
						customUserPlan.custom_plan.planValidity
				);

				stagedCustomUserPlan.set(
					"validity_to",
					validity_to.toISOString()
				);

				await stagedCustomUserPlan.save({ session: mt });

				// update watch time quota for newly active plan
				await WatchTimeQuota.create({
					user_plan_id: String(
						stagedPlan.get("plan").get("user_plan_id")
					),
					quota: stagedPlan.get("plan").get("watch_time_limit"),
				});

				// update UIPR for newly active plan
				const x = await UserInstitutePlanRole.update(
					{
						user_plan_id: stagedPlan.get("user_plan_id"),
					},
					{
						transaction: t,
						where: {
							user_id: user_id,
							role_id: role.role_id,
							institute_id: institute_id,
						},
					}
				);

				if (x[0] === 0) {
					if (transaction === null) {
						await t.rollback();
					}
					return [null, "Failed to update UIPR"];
				}
			}
		}

		if (transaction === null) {
			await t.commit();
		}

		if (mongo_session === null) {
			await mt.commitTransaction();
			await mt.endSession();
		}

		return [null, null];
	} catch (err) {
		console.log(err);
		if (transaction === null) {
			await t.rollback();
		}

		if (mongo_session === null) {
			await mt.abortTransaction();
			await mt.endSession();
		}

		return [null, err];
	}
};

const GetPlanForWatchQuotaDeduction = async (
	user_id,
	institute_id,
	playlist_id,
	sequelize_transaction = null,
	mongo_transaction = null
) => {
	// TODO : get an active plan for user where playlist is allowed

	const t = await sequelize.transaction();
	const mt = mongo_transaction ?? (await mongoose.startSession());

	mt.startTransaction();

	// const now = new Date();
	try {
		// get active user plan sorted by time
		const activePlans = await UserPlan.findAll({
			where: {
				user_id,
				current_status: USER_PLAN_ACTIVE,
			},
			order: [["validity_to", "ASC"]],
			transaction: t,
		});

		// console.log(activePlans);

		// get active custom plans sorted by time where playlist id is allowed
		const activeCustomPlans = await CustomUserPlan.aggregate([
			{
				$match: {
					user_id: user_id,
					current_status: USER_PLAN_ACTIVE,
				},
			},
			{
				$lookup: {
					from: "custom_plan",
					localField: "custom_plan_id",
					foreignField: "_id",
					as: "custom_plan",
				},
			},
			{
				$unwind: {
					path: "$custom_plan",
					includeArrayIndex: "string",
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$match: {
					"custom_plan.playlists": {
						$elemMatch: {
							[playlist_id]: { $exists: true },
						},
					},
				},
			},
		]);

		// if no plans, return error
		if (activePlans.length === 0 && activeCustomPlans.length === 0) {
			if (sequelize_transaction === null) {
				await t.rollback();
			}

			if (mongo_transaction === null) {
				await mt.abortTransaction();
			}

			return [null, "No active plans found"];
		}

		// console.log(activePlans.length, activeCustomPlans.length);

		// if active plans found, return the first one
		if (activePlans.length > 0) {
			if (sequelize_transaction === null) {
				await t.commit();
			}

			if (mongo_transaction === null) {
				await mt.commitTransaction();
			}

			return [activePlans[0].toJSON(), null];
		}

		// if active custom plans found, return the first one
		// if (activeCustomPlans.length > 0) {
		// 	if (sequelize_transaction === null) {
		// 		await t.commit();
		// 	}

		// 	if (mongo_transaction === null) {
		// 		await mt.commitTransaction();
		// 	}

		// 	return [activeCustomPlans[0], null];
		// }

		if (sequelize_transaction === null) {
			await t.rollback();
		}
		if (mongo_transaction === null) {
			await mt.abortTransaction();
		}
		return [null, "No active plans found"];
	} catch (err) {
		return [null, err];
	}
};

module.exports = {
	GetCurrentUserPlan,
	UpdateUserPlanStatus,
	GetPlanForWatchQuotaDeduction,
};

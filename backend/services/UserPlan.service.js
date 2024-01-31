const { USER_PLAN_ACTIVE } = require("../enums/user_plan_status");
const { sequelize } = require("../init.sequelize");
const { Plan } = require("../models/sql/Plan");
const { UserPlan } = require("../models/sql/UserPlan");

const GetCurrentUserPlan = async (user_id) => {
	let user_plan = null,
		error = null;

	const t = await sequelize.transaction();

	try {
		user_plan = await UserPlan.findOne({
			where: {
				user_id,
				current_status: USER_PLAN_ACTIVE,
			},
			include: [{ model: Plan }],
			transaction: t,
		});

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

module.exports = {
	GetCurrentUserPlan,
};

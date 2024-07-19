const { default: mongoose } = require("mongoose");
const WatchTimeLog = require("../models/mongo/WatchTimeLog");

const GetMongoSession = async (mongo_session = null) => {
	if (mongo_session) {
		return mongo_session;
	} else {
		return await mongoose.startSession();
	}
};

const GetWatchTimePerYearMonthStats = async (user_id, mongo_session = null) => {
	// if (user_id === null || user_id === undefined) {
	// 	return [null, new Error("user_id required")];
	// }

	const session = await GetMongoSession(mongo_session);

	if (!session.inTransaction()) {
		session.startTransaction();
	}

	try {
		const pipeline = [];

		if (user_id !== null && user_id !== undefined) {
			pipeline.push({
				$match: {
					user_id: user_id,
				},
			});
		}

		pipeline.push({
			$addFields: {
				year_month_number: {
					$concat: [
						{
							$toString: {
								$year: "$updated_at",
							},
						},
						{
							$toString: {
								$cond: {
									if: {
										$lt: [
											{
												$month: "$updated_at",
											},
											10,
										],
									},
									then: {
										$substrCP: [
											{
												$add: [
													100,
													{
														$month: "$updated_at",
													},
												],
											},
											1,
											3,
										],
									},
									else: {
										$month: "$updated_at",
									},
								},
							},
						},
					],
				},
			},
		});

		pipeline.push({
			$group: {
				_id: "$year_month_number",
				"Watch Time per Month": {
					$sum: "$duration",
				},
			},
		});

		const watchTimePerMonth = await WatchTimeLog.aggregate(pipeline);

		await session.commitTransaction();

		if (mongo_session === null) {
			await session.endSession();
		}

		return [watchTimePerMonth, null];
	} catch (error) {
		console.log(error);
		return [null, error];
	}
};

const GetCurrentMonthUsage = async (mongo_session = null) => {
	const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
	const currentYear = new Date().getFullYear();

	const session = await GetMongoSession(mongo_session);

	if (!session.inTransaction()) {
		session.startTransaction();
	}

	try {
		const watchTimePerMonth = await WatchTimeLog.aggregate([
			{
				$addFields: {
					year_month_number: {
						$concat: [
							{
								$toString: {
									$year: "$updated_at",
								},
							},
							{
								$toString: {
									$cond: {
										if: {
											$lt: [
												{
													$month: "$updated_at",
												},
												10,
											],
										},
										then: {
											$substrCP: [
												{
													$add: [
														100,
														{
															$month: "$updated_at",
														},
													],
												},
												1,
												3,
											],
										},
										else: {
											$month: "$updated_at",
										},
									},
								},
							},
						],
					},
				},
			},
			{
				$group: {
					_id: "$year_month_number",
					watch_time: {
						$sum: "$duration",
					},
				},
			},
			{
				$match: {
					_id: `${currentYear}${currentMonth}`,
				},
			},
		]);

		if (watchTimePerMonth.length === 0) {
			watchTimePerMonth.push({
				_id: `${currentYear}${currentMonth}`,
				watch_time: 0,
			});
		}

		await session.commitTransaction();

		if (mongo_session === null) {
			await session.endSession();
		}

		return [watchTimePerMonth[0], null];
	} catch (error) {
		console.log(error);
		return [null, error];
	}
};

module.exports = { GetWatchTimePerYearMonthStats, GetCurrentMonthUsage };

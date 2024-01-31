const express = require("express");

const eta = require("eta");

const router = express.Router();
const {
	HTTP_BAD_REQUEST,
	HTTP_OK,
	HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");
const WatchTimeLog = require("../models/mongo/WatchTimeLog");
const WatchTimeQuota = require("../models/mongo/WatchTimeQuota");
const { GetCurrentUserPlan } = require("../services/UserPlan.service");

router.post("/update", async (req, res) => {
	const { user_id, watch_time_logs } = req.body;

	if (!user_id || !watch_time_logs) {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ message: "Missing required fields" });
	}

	// console.log(GetCurrentUserPlan(user_id);

	// get user plan
	const [user_plan, error] = await GetCurrentUserPlan(user_id);

	if (!user_plan || error) {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ message: error || "User currenly has no active plan" });
	}

	// reduce it to unique asana_id, playlist_id
	let reduced_watch_time = [];
	let total_watch_time = 0;

	watch_time_logs.forEach((wtl) => {
		const idx = reduced_watch_time.findIndex(
			(x) =>
				x.asana_id === wtl.asana_id && x.playlist_id === wtl.playlist_id
		);

		total_watch_time += wtl.timedelta;
		if (idx === -1) {
			const { timedelta, ...w } = wtl;
			w.duration = timedelta;
			w.created_at = new Date();
			reduced_watch_time.push(w);
		} else {
			if (wtl.timedelta > 0) {
				if (reduced_watch_time[idx].duration) {
					reduced_watch_time[idx].duration += wtl.timedelta;
				} else {
					reduced_watch_time[idx].duration = wtl.timedelta;
				}
			}
		}
	});

	console.log({ reduced_watch_time, total_watch_time });

	/*
 {
  user_id,
  asana_id,
  playlist_id,
  duration
 }
 */
	// start a db session
	const session = await WatchTimeLog.startSession();

	await session.withTransaction(async () => {
		const promises = [];
		reduced_watch_time.forEach((wtl) => {
			// update watch time logs
			promises.push(
				WatchTimeLog.updateOne(
					{
						user_id: wtl.user_id,
						asana_id: wtl.asana_id,
						playlist_id: wtl.playlist_id,
					},
					[
						{
							$project: {
								...wtl,
								duration: {
									$add: [
										{ $ifNull: ["$duration", 0] },
										wtl.duration,
									],
								},
							},
						},
					],
					{ upsert: true }
				)
			);
		});

		let updatedWatchTimeQuota = await WatchTimeQuota.findOneAndUpdate(
			{
				user_plan_id: user_plan?.user_plan_id,
			},
			[
				{
					$project: {
						user_plan_id: user_plan?.user_plan_id,
						quota: {
							$subtract: ["$quota", total_watch_time],
						},
					},
				},
			],
			{ upsert: false, returnDocument: "after", lean: true }
		);

		console.log(updatedWatchTimeQuota);

		if (!updatedWatchTimeQuota) {
			await session.abortTransaction();
			return res.status(HTTP_BAD_REQUEST).json({
				message: "Could not update watch time quota",
			});
		} else {
			await session.commitTransaction();
			if (updatedWatchTimeQuota.quota < 0) {
				return res.status(HTTP_BAD_REQUEST).json({
					message: "Watch time quota exceeded",
				});
			}
		}

		await Promise.all(promises)
			.then((values) => {
				console.log(values);
				return session.commitTransaction();
			})
			.then(() => {
				return res.status(HTTP_OK).json({ reduced_watch_time });
			})
			.catch(async (err) => {
				console.log(err);
				await session.abortTransaction();
				return res
					.status(HTTP_INTERNAL_SERVER_ERROR)
					.json({ message: err });
			});
	});

	session.endSession();
});

router.post("/get", async (req, res) => {
	const { user_id, from_date, to_date } = req.body;

	if (!user_id) {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ message: "Missing required fields" });
	}

	try {
		let watchTimeLog;
		if (!from_date || !to_date) {
			watchTimeLog = await WatchTimeLog.find({ user_id });
		} else {
			watchTimeLog = await WatchTimeLog.find({
				user_id,
				created_at: {
					$gte: from_date || new Date(),
					$lte: to_date || new Date(),
				},
			});
		}
		return res.status(HTTP_OK).json({ watchTimeLog });
	} catch (err) {
		console.log(err);
		return res
			.status(HTTP_INTERNAL_SERVER_ERROR)
			.json({ message: "Something went wrong" });
	}
});

router.post("/get-quota", async (req, res) => {
	const { user_id } = req.body;

	if (!user_id) {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ message: "Missing required fields" });
	}

	try {
		const [user_plan, error] = await GetCurrentUserPlan(user_id);

		if (error) {
			return res.status(HTTP_BAD_REQUEST).json({ message: error });
		}

		let quota = await WatchTimeQuota.findOne({
			user_plan_id: user_plan?.user_plan_id,
		});

		if (!quota) {
			return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
				message: "Could not fetch watch time quota",
			});
		}

		return res.status(HTTP_OK).json({ quota, user_plan });
	} catch (err) {
		console.log(err);
		return res
			.status(HTTP_INTERNAL_SERVER_ERROR)
			.json({ message: "Something went wrong" });
	}
});

module.exports = router;

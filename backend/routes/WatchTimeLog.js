const express = require("express");

const eta = require("eta");

const router = express.Router();
const {
	HTTP_BAD_REQUEST,
	HTTP_OK,
	HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");
const WatchTimeLog = require("../models/mongo/WatchTimeLog");

router.post("/update", async (req, res) => {
	const { user_id, watch_time_logs } = req.body;

	if (!user_id || !watch_time_logs) {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ message: "Missing required fields" });
	}

	// reduce it to unique asana_id, playlist_id
	let reduced_watch_time = [];

	watch_time_logs.forEach((wtl) => {
		const idx = reduced_watch_time.findIndex(
			(x) =>
				x.asana_id === wtl.asana_id && x.playlist_id === wtl.playlist_id
		);

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

	/*
 {
  user_id,
  asana_id,
  playlist_id,
  duration
 }
 */
	const session = await WatchTimeLog.startSession();

	await session.withTransaction(async () => {
		const promises = [];
		reduced_watch_time.forEach((wtl) => {
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

		await Promise.all(promises)
			.then((values) => {
				console.log(values);
				return session.commitTransaction();
			})
			.then(() => {
				return res.status(HTTP_OK).json({ reduced_watch_time });
			})
			.catch((err) => {
				console.log(err);
				session.abortTransaction();
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

module.exports = router;

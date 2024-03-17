const express = require("express");

const eta = require("eta");

const router = express.Router();
const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");
const WatchHistory = require("../models/mongo/WatchHistory");
const WatchTimeLog = require("../models/mongo/WatchTimeLog");

router.post("/create", async (req, res) => {
  const { user_id, asana_id, playlist_id } = req.body;

  if (!user_id && (!asana_id || !playlist_id)) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: "Missing required fields" });
  }

  const session = await WatchHistory.startSession();

  try {
    await session.withTransaction(async () => {
      // find if watch history exists for today

      const watchHistoryToday = await WatchHistory.findOne({
        user_id,
        created_at: {
          $gte: new Date().setHours(0, 0, 0, 0),
          $lt: new Date().setHours(23, 59, 59, 999),
        },
      });

      if (watchHistoryToday) {
        watchHistoryToday.history.push({
          asana_id,
          playlist_id,
        });
        await watchHistoryToday.save();
      } else {
        const watchHistory = new WatchHistory({
          user_id,
          history: [
            {
              asana_id,
              playlist_id,
              watched_at: Date.now(),
            },
          ],
          created_at: Date.now(),
        });

        await watchHistory.save();
      }
    });
    await session.commitTransaction();
    return res.status(HTTP_OK).json({ message: "Watch history created" });
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ message: "Something went wrong" });
  }
});

router.post("/get", async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: "Missing required fields" });
  }

  const watchHistory = await WatchHistory.aggregate([
    {
      $match: {
        user_id: user_id,
      },
    },
    {
      $sort: {
        created_at: -1,
      },
    },
    {
      $unwind: "$history",
    },
    {
      $lookup: {
        from: "asanas",
        localField: "history.asana_id",
        foreignField: "id",
        as: "asana",
        pipeline: [
          {
            $project: {
              id: 1,
              asana_name: 1,
              asana_desc: 1,
              asana_category: 1,
              asana_videoID: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$asana",
    },
  ]);

  return res.status(HTTP_OK).json({ watchHistory });
});

router.post("/get/:page", async (req, res) => {
  const { user_id, return_page_count } = req.body;
  const { page } = req.params;

  if (!user_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: "Missing required fields" });
  }

  const watchHistory = await WatchHistory.aggregate([
    {
      $match: {
        user_id: user_id,
      },
    },
    {
      $sort: {
        created_at: -1,
      },
    },
    {
      $lookup: {
        from: "asanas",
        localField: "asana_id",
        foreignField: "id",
        as: "asana",
        pipeline: [
          {
            $project: {
              id: 1,
              asana_name: 1,
              asana_desc: 1,
              asana_category: 1,
              asana_videoID: 1,
            },
          },
        ],
      },
    },
    {
      $skip: (page - 1) * 3,
    },
    {
      $limit: 3,
    },
  ]);

  // return number of pages
  if (return_page_count) {
    const count = await WatchHistory.countDocuments({ user_id });
    return res.status(HTTP_OK).json({ watchHistory, count });
  }

  return res.status(HTTP_OK).json({ watchHistory });
});

router.get("/video-view-counts", async (req, res) => {
  try {
    const allWatchHistory = await WatchHistory.find();
    const historyCount = allWatchHistory.reduce((acc, entry) => {
      entry.history.forEach((item) => {
        const { asana_id } = item;
        if (asana_id) {
          acc[asana_id] = (acc[asana_id] || 0) + 1;
        }
      });
      return acc;
    }, {});
    const result = Object.entries(historyCount).map(
      ([asana_id, viewcount]) => ({
        label: `Asana ${asana_id}`,
        viewcount,
      })
    );
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/all-watch-history", async (req, res) => {
  try {
    const allWatchHistory = await WatchHistory.find();
    res.json(allWatchHistory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/combined-data", async (req, res) => {
  try {
    const watchTimeLogs = await WatchTimeLog.find();
    const watchHistory = await WatchHistory.find();

    // Aggregate watch time logs data by user_id and asana_id
    const aggregatedLogs = watchTimeLogs.reduce((acc, log) => {
      const { user_id, asana_id, duration } = log;
      if (!acc[user_id]) acc[user_id] = {};
      if (!acc[user_id][asana_id])
        acc[user_id][asana_id] = { totalDuration: 0, totalCount: 0 };
      acc[user_id][asana_id].totalDuration += duration;
      acc[user_id][asana_id].totalCount++;
      return acc;
    }, {});

    // Aggregate watch history data by user_id and asana_id
    const aggregatedHistory = watchHistory.reduce((acc, history) => {
      const { user_id, history: entries } = history;
      entries.forEach((entry) => {
        const { asana_id } = entry;
        if (!acc[user_id]) acc[user_id] = {};
        if (!acc[user_id][asana_id])
          acc[user_id][asana_id] = { totalDuration: 0, totalCount: 0 };
        acc[user_id][asana_id].totalDuration += entry.duration;
        acc[user_id][asana_id].totalCount++;
      });
      return acc;
    }, {});

    // Merge the aggregated data
    const combinedData = {};
    [watchTimeLogs, watchHistory].forEach((data) => {
      data.forEach((item) => {
        const { user_id, asana_id } = item;
        if (!combinedData[user_id]) combinedData[user_id] = {};
        if (!combinedData[user_id][asana_id])
          combinedData[user_id][asana_id] = { totalDuration: 0, totalCount: 0 };
        combinedData[user_id][asana_id].totalDuration += item.duration;
        combinedData[user_id][asana_id].totalCount++;
      });
    });

    // Format the result
    const result = Object.entries(combinedData)
      .map(([user_id, userData]) => {
        const userResults = Object.entries(userData).map(
          ([asana_id, { totalDuration, totalCount }]) => ({
            user_id,
            asana_id,
            totalDuration,
            totalCount,
          })
        );
        return userResults;
      })
      .flat();

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

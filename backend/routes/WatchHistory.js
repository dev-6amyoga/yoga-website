const express = require("express");

const eta = require("eta");

const router = express.Router();
const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");
const WatchHistory = require("../models/mongo/WatchHistory");

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
      const watchHistory = new WatchHistory({
        user_id,
        asana_id,
        playlist_id,
      });
      await watchHistory.save();
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
  ]);

  return res.status(HTTP_OK).json({ watchHistory });
});

module.exports = router;

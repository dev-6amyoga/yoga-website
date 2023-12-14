const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { sequelize } = require("../init.sequelize");
const { timeout } = require("../utils/promise_timeout");
const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");
const { Plan } = require("../models/sql/Plan");

router.get("/get-all-plans", async (req, res) => {
  try {
    const plans = await Plan.findAll();
    res.status(HTTP_OK).json({ plans });
  } catch (error) {
    console.error("Error fetching plans:", error);
    res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
  }
});

router.post("/get-plan-by-id", async (req, res) => {
  const { plan_id } = req.body;
  if (!plan_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }
  try {
    const plan = await Plan.findOne({
      where: {
        plan_id: plan_id,
      },
    });
    if (!plan) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "Plan does not exist" });
    }
    return res.status(HTTP_OK).json({ plan });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch plan" });
  }
});

router.get("/get-all-student-plans", async (req, res) => {
  try {
    const plans = await Plan.findAll({
      where: {
        plan_user_type: "student",
      },
    });
    return res.status(HTTP_OK).json({ plans });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
  }
});

router.post("/register", async (req, res) => {
  const {
    name,
    has_basic_playlist,
    playlist_creation_limit,
    number_of_teachers,
    has_self_audio_upload,
    has_playlist_creation,
    plan_user_type,
    plan_validity,
  } = req.body;
  // validate inputs
  if (!name || !plan_user_type)
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });

  const plan = await Plan.findOne({
    where: {
      [Op.and]: [
        { name: name },
        { has_basic_playlist: has_basic_playlist ? true : false },
        { has_playlist_creation: has_playlist_creation ? true : false },
        // { has_playlist_creation: has_playlist_creation },
        { playlist_creation_limit: playlist_creation_limit },
        { number_of_teachers: number_of_teachers },
        { has_self_audio_upload: has_self_audio_upload ? true : false },
        { plan_user_type: plan_user_type },
        { plan_validity: plan_validity },
      ],
    },
    attributes: ["name", "has_basic_playlist"],
  });
  if (plan)
    return res.status(HTTP_BAD_REQUEST).json({ error: "Plan already exists" });

  // db transaction
  const t = await sequelize.transaction();
  try {
    const newPlan = await Plan.create(
      {
        name: name,
        has_basic_playlist: has_basic_playlist,
        has_playlist_creation: has_playlist_creation,
        playlist_creation_limit: playlist_creation_limit,
        number_of_teachers: number_of_teachers,
        has_self_audio_upload: has_self_audio_upload,
        plan_user_type: plan_user_type,
        plan_validity: plan_validity,
      },
      { transaction: t }
    );

    // console.log('committing');
    await timeout(t.commit(), 5000, new Error("timeout; try again"));

    res.status(HTTP_OK).json({ plan: newPlan });
  } catch (error) {
    console.error(error);
    await t.rollback();
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: error.message,
    });
  }
});

module.exports = router;

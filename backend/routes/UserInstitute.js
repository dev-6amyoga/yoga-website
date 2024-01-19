const express = require("express");

const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_SERVICE_UNAVAILABLE,
} = require("../utils/http_status_codes");

const {
  UserInstitutePlanRole,
} = require("../models/sql/UserInstitutePlanRole");
const { Institute } = require("../models/sql/Institute");
const { Role } = require("../models/sql/Role");
const router = express.Router();

router.post("/get-institute-by-user-id", async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }
  try {
    const user_institute = await UserInstitutePlanRole.findAll({
      where: {
        user_id: user_id,
      },
      attributes: ["institute_id"],
      include: [
        {
          model: Institute,
        },
      ],
    });

    if (!user_institute) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User Institute does not exist" });
    }
    return res.status(HTTP_OK).json({ user_institute });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch user" });
  }
});

router.post("/get-role-by-user-institute-id", async (req, res) => {
  const { user_id, institute_id } = req.body;
  if (!user_id || !institute_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }
  try {
    const user_institute = await UserInstitutePlanRole.findAll({
      where: {
        user_id: user_id,
        institute_id: institute_id,
      },
      attributes: ["user_id", "institute_id"],
      include: [
        {
          model: Role,
        },
      ],
    });

    if (!user_institute) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User does not exist in this institute" });
    }
    return res.status(HTTP_OK).json({ user_institute });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch user" });
  }
});

module.exports = router;

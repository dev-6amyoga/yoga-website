const express = require("express");
const router = express.Router();
const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");
const {
  UserInstitutePlanRole,
} = require("../models/sql/UserInstitutePlanRole");

const { User } = require("../models/sql/User");
router.post("/get-teachers-in-institute", async (req, res) => {
  console.log(req.body);
  const { institute_id } = req.body;
  if (!institute_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }
  try {
    const users = await UserInstitutePlanRole.findAll({
      where: {
        institute_id: institute_id,
        role_id: 4,
      },
      attributes: ["institute_id"],
      include: [
        {
          model: User,
        },
      ],
    });

    if (!users) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "No teachers does not exist" });
    }
    return res.status(HTTP_OK).json({ users });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch user" });
  }
});

module.exports = router;

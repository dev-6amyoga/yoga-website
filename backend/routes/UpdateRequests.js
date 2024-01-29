const express = require("express");
const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");
const { UpdateRequests } = require("../models/sql/UpdateRequests");
const { sequelize } = require("../init.sequelize");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { user_id, username, name, old_email, new_email, phone, request_date } =
    req.body;
  if (
    !user_id ||
    !username ||
    !name ||
    !old_email ||
    !new_email ||
    !phone ||
    !request_date
  )
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });

  const t = await sequelize.transaction();
  try {
    const [newC, created] = await UpdateRequests.findOrCreate({
      where: {
        user_id,
        username,
        name,
        old_email,
        new_email,
        phone,
        request_date,
      },
      transaction: t,
    });
    if (!created) {
      await t.rollback();
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "Update Request already exists" });
    }
    await t.commit();
    return res.status(HTTP_OK).json({ currency: newC });
  } catch (error) {
    console.error("Error creating new update request:", error);
    await t.rollback();
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Error creating new update request",
    });
  }
});

module.exports = router;

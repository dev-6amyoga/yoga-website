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

router.get("/get-all", async (req, res) => {
  try {
    const updateRequests = await UpdateRequests.findAll();
    res.status(HTTP_OK).json({ updateRequests });
  } catch (error) {
    console.error("Error fetching update requests:", error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Error fetching update requests",
    });
  }
});

router.post("/approve", async (req, res) => {
  const { update_request_id } = req.body;

  if (!update_request_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }

  const t = await sequelize.transaction();

  try {
    const updateRequest = await UpdateRequests.findByPk(update_request_id, {
      transaction: t,
    });

    if (!updateRequest) {
      await t.rollback();
      return res
        .status(HTTP_NOT_FOUND)
        .json({ error: "Update request not found" });
    }

    updateRequest.is_approved = true;
    await updateRequest.save({ transaction: t });
    await t.commit();

    return res
      .status(HTTP_OK)
      .json({ message: "Update request approved successfully" });
  } catch (error) {
    console.error("Error approving update request:", error);
    await t.rollback();
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Error approving update request" });
  }
});

router.post("/reject", async (req, res) => {
  const { update_request_id } = req.body;

  if (!update_request_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }

  const t = await sequelize.transaction();

  try {
    const updateRequest = await UpdateRequests.findByPk(update_request_id, {
      transaction: t,
    });

    if (!updateRequest) {
      await t.rollback();
      return res
        .status(HTTP_NOT_FOUND)
        .json({ error: "Update request not found" });
    }

    updateRequest.is_approved = false;
    await updateRequest.save({ transaction: t });
    await t.commit();

    return res
      .status(HTTP_OK)
      .json({ message: "Update request rejected successfully" });
  } catch (error) {
    console.error("Error rejecting update request:", error);
    await t.rollback();
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Error rejecting update request" });
  }
});
module.exports = router;

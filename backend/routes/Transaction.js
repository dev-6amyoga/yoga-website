const express = require("express");
const router = express.Router();
const { Transaction } = require("../models/sql/Transaction");
const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");

module.exports = router;

router.post("/get-transaction-by-user-id", async (req, res) => {
  const { user_id } = req.body;
  console.log(user_id);
  if (!user_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }
  try {
    const all_transaction_for_user = await Transaction.findAll({
      where: {
        user_id: user_id,
      },
    });

    return res.status(HTTP_OK).json({ all_transaction_for_user });
  } catch (err) {
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch transactions!" });
  }
});

const express = require("express");
const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");
const { Queries } = require("../models/sql/Queries");
const { sequelize } = require("../init.sequelize");

const router = express.Router();

router.get("/get-all", async (req, res) => {
  try {
    const queries = await Queries.findAll();
    res.status(HTTP_OK).json({ queries });
  } catch (error) {
    console.error("Error fetching queries:", error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Error fetching currencies",
    });
  }
});

router.post("/register", async (req, res) => {
  const { query_name, query_email, query_phone, query_text } = req.body;
  if (!query_name || !query_email || !query_phone || !query_text)
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });

  const t = await sequelize.transaction();
  try {
    const [newQuery, created] = await Queries.findOrCreate({
      where: {
        query_name: query_name,
        query_email: query_email,
        query_phone: query_phone,
        query_text: query_text,
      },
      transaction: t,
    });
    if (!created) {
      await t.rollback();
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "Query already exists" });
    }

    await t.commit();
    return res.status(HTTP_OK).json({ newQuery });
  } catch (error) {
    console.error("Error creating new query:", error);
    await t.rollback();
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Error creating new query",
    });
  }
});

module.exports = router;

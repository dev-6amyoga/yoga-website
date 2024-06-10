const express = require("express");
const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");
const { Queries } = require("../models/sql/Queries");
const { sequelize } = require("../init.sequelize");
const { mailTransporter } = require("../init.nodemailer");

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
  console.log(query_email);
  if (!query_name || !query_email || !query_phone || !query_text) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }
  const t = await sequelize.transaction();

  try {
    const [newQuery, created] = await Queries.findOrCreate({
      where: { query_name, query_email, query_phone, query_text },
      transaction: t,
    });
    const emailText = `
      New Query from ${query_name}

      Email: ${query_email}
      Phone: ${query_phone}

      Query:
      ${query_text}
    `;

    mailTransporter.sendMail(
      {
        from: "dev.6amyoga@gmail.com",
        to: "992351@gmail.com",
        subject: "6AM Yoga | You have a query!",
        text: emailText,
      },
      async (err, info) => {
        if (err) {
          await t.rollback();
          console.error("Error sending email:", err);
          return res
            .status(HTTP_BAD_REQUEST)
            .json({ message: "Failed to send email notification" });
        }
        await t.commit();
        res.status(HTTP_OK).json({ message: "Query sent" });
      }
    );
  } catch (error) {
    console.error("Error handling query:", error);
    await t.rollback();
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
});
module.exports = router;

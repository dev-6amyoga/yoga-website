const express = require("express");

const eta = require("eta");
const path = require("path");
const router = express.Router();

const renderer = new eta.Eta({
  views: path.join(__dirname, "../invoice-templates"),
});

router.get("/", async (req, res) => {
  return res.send("Hello World");
});

router.get("/student/plan", async (req, res) => {
  return res.status(200).send(
    await renderer.renderAsync("/student/plan-purchase", {
      transaction: { transaction_id: 1 },
      user: { name: "John Doe", email: "okay@gmail.com" },
    })
  );
});

module.exports = router;

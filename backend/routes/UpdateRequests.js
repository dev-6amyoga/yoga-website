const express = require("express");
const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");
const { UpdateRequests } = require("../models/sql/UpdateRequests");
const { sequelize } = require("../init.sequelize");
const { GetUser } = require("../services/User.service");
const router = express.Router();
const tokenUtils = require("../utils/invite_token");
const { mailTransporter } = require("../init.nodemailer");
const getFrontendDomain = require("../utils/getFrontendDomain");

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
  const email = new_email;
  const [user, errorUser] = await GetUser({ email });
  console.log(user);
  if (user) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Email ID already exists!" });
  }
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
    //send email here
    mailTransporter.sendMail(
      {
        from: "dev.6amyoga@gmail.com",
        to: "992351@gmail.com",
        subject: "6AM Yoga | Email ID Update",
        html: `
    <p>Hi Sivakumar!</p>
    <p>We received a request from a user to update their Email ID. The details are as follows</p>
    <p>Name : ${name}</p>
    <p>Old Email ID : ${old_email}</p>
    <p>New Email ID : ${new_email}.</p>
    <p>To approve this request, head over to "Pending Email Update Requests" under student option in Member Management in your login</p>
    <p>Regards, </p>
    <p>My Yoga Teacher, 6AM Yoga </p>
  `,
      },
      async (err, info) => {
        if (err) {
          await t.rollback();
          console.error(err);
          res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            message: "Internal server error; try again",
          });
        } else {
          console.log("Email sent to admin");
        }
      }
    );

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
    if (
      !updateRequest.old_email ||
      !updateRequest.name ||
      !updateRequest.new_email
    ) {
      return res.status(HTTP_BAD_REQUEST).json({
        message: "Missing required fields",
      });
    }
    const token = tokenUtils.enc_token(
      updateRequest.name,
      updateRequest.old_email,
      updateRequest.new_email
    );
    mailTransporter.sendMail(
      {
        from: "dev.6amyoga@gmail.com",
        to: updateRequest.new_email,
        subject: "6AM Yoga | Email ID Update",
        html: `
    <p>Welcome to 6AM Yoga!</p>
    <p>We received a request to update your Email ID from : ${
      updateRequest.old_email
    } to : ${updateRequest.new_email}.</p>
    <p>To verify the authenticity of this request and update your Email ID, kindly click on the following link:</p>
    <p><a href=\`${getFrontendDomain()}/auth/update-email?token=${token}\`>Verify Email</a></p>
    <p>If this was not you, kindly ignore the mail and contact 6AM Yoga at +91-9980802351</p>
  `,
      },
      async (err, info) => {
        if (err) {
          await t.rollback();
          console.error(err);
          res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            message: "Internal server error; try again",
          });
        } else {
          updateRequest.admin_approved = true;
          updateRequest.approval_token = token;
          await updateRequest.save({ transaction: t });
          await t.commit();
          res.status(HTTP_OK).json({
            message: "Email sent",
            token: token,
          });
        }
      }
    );
    return res;
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
    console.log(update_request_id);

    const ur = await UpdateRequests.findOne({
      where: { update_request_id: update_request_id },
    });
    if (!ur) {
      return res.status(HTTP_BAD_REQUEST).json({
        message: "Invalid email request",
      });
    }

    const updateRequest = await UpdateRequests.destroy({
      where: {
        update_request_id: update_request_id, // Assuming 'update_request_id' is the ID of the record you want to delete
      },
      transaction: t, // Assuming 't' is your transaction object
    });

    if (!updateRequest) {
      await t.rollback();
      return res
        .status(HTTP_NOT_FOUND)
        .json({ error: "Update request not found" });
    }
    await t.commit();
    console.log(ur);

    mailTransporter.sendMail(
      {
        from: "dev.6amyoga@gmail.com",
        to: ur.old_email,
        subject: "6AM Yoga | Email ID Update",
        html: `
      <p>Hi ${ur.name}!</p>
      <p>We received a request from you to update you Email ID. The details are as follows</p>
      <p>Old Email ID : ${ur.old_email}</p>
      <p>New Email ID : ${ur.new_email}.</p>
      <p>This request has been rejected by the admin. For any clarifications, please mail us back, or reach out to us at +919980802351</p>
      <p>Regards, </p>
      <p>My Yoga Teacher, 6AM Yoga </p>
    `,
      },
      async (err, info) => {
        if (err) {
          console.error(err);
          res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            message: "Internal server error; try again",
          });
        } else {
          console.log("Email sent to admin");
        }
      }
    );
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

router.post("/get-update-request-by-token", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(HTTP_BAD_REQUEST).json({
      message: "Missing required fields",
    });
  }

  try {
    const invite = await UpdateRequests.findOne({
      where: { approval_token: token },
    });
    if (!invite) {
      return res.status(HTTP_BAD_REQUEST).json({
        message: "Invalid token",
      });
    }
    console.log(invite);
    return res.status(HTTP_OK).json({
      request: {
        ...invite.toJSON(),
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
});

module.exports = router;

const express = require("express");

const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_SERVICE_UNAVAILABLE,
} = require("../utils/http_status_codes");

const { Invite } = require("../models/sql/Invite");
const { EmailVerification } = require("../models/sql/EmailVerification");
const { sequelize } = require("../init.sequelize");
const { User } = require("../models/sql/User");
const { Role } = require("../models/sql/Role");
const tokenUtils = require("../utils/invite_token");
const emailVerificationToken = require("../utils/email_verification_token");
const { mailTransporter } = require("../init.nodemailer");
const { Institute } = require("../models/sql/Institute");

const {
  UserInstitutePlanRole,
} = require("../models/sql/UserInstitutePlanRole");
// const { Op } = require('sequelize');
const bcrypyt = require("bcrypt");
const getFrontendDomain = require("../utils/getFrontendDomain");

const router = express.Router();

router.post("/get-by-id", async (req, res) => {
  const { invite_id } = req.body;

  if (!invite_id) {
    return res.status(HTTP_BAD_REQUEST).json({
      message: "Missing required fields",
    });
  }
  try {
    const invite = await Invite.findOne({
      where: { invite_id },
    });

    if (!invite) {
      return res.status(HTTP_BAD_REQUEST).json({
        message: "Invalid id",
      });
    }

    const user_institute = await UserInstitutePlanRole.findOne({
      where: { user_id: invite.inviter_user_id },
      attributes: ["institute_id"],
      include: [
        {
          model: Institute,
          as: "institute",
          attributes: ["name"],
        },
      ],
    });

    return res.status(HTTP_OK).json({
      invite: {
        ...invite.toJSON(),
        institute_name: user_institute?.institute?.name,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
});

router.post("/get-by-token", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(HTTP_BAD_REQUEST).json({
      message: "Missing required fields",
    });
  }

  try {
    const invite = await Invite.findOne({
      where: { token },
    });

    if (!invite) {
      return res.status(HTTP_BAD_REQUEST).json({
        message: "Invalid token",
      });
    }

    const user_institute = await UserInstitutePlanRole.findOne({
      where: { user_id: invite.inviter_user_id },
      attributes: ["institute_id"],
      include: [
        {
          model: Institute,
          as: "institute",
          attributes: ["name"],
        },
      ],
    });

    return res.status(HTTP_OK).json({
      invite: {
        ...invite.toJSON(),
        institute_name: user_institute?.institute?.name,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
});

router.post("/create", async (req, res) => {
  const { user_id, name, email, phone, invite_type } = req.body;
  if (!user_id || !email || !invite_type || !name || !phone) {
    return res.status(HTTP_BAD_REQUEST).json({
      message: "Missing required fields",
    });
  }
  console.log(user_id, email, invite_type, name, phone);

  const t = await sequelize.transaction();
  try {
    // get role id
    const role = await Role.findOne(
      {
        where: { name: "TEACHER" },
      },
      { transaction: t }
    );
    if (!role) {
      await t.rollback();
      return res.status(HTTP_BAD_REQUEST).json({
        message: "Role not found",
      });
    }
    const teacher1 = await User.findOne({
      where: {
        name: name ? name : null,
        email: email,
        phone: phone ? phone : null,
      },
      defaults: {
        name: name ? name : null,
        email: email,
        phone: phone ? phone : null,
      },
      transaction: t,
    });
    const token = tokenUtils.enc_token(email, phone, email);
    console.log("TOKEN : ", token);
    if (teacher1) {
      mailTransporter.sendMail(
        {
          from: "dev.6amyoga@gmail.com",
          to: email,
          subject: "6AM Yoga | Teacher Invite",
          text: `Welcome to 6AM Yoga! Please click on the link to accept the invite: ${getFrontendDomain()}/teacher/invite?token=${token}`,
        },
        async (err, info) => {
          if (err) {
            await t.rollback();
            console.error(err);
            res.status(HTTP_INTERNAL_SERVER_ERROR).json({
              message: "Internal server error; try again",
            });
          } else {
            await Invite.create(
              {
                token,
                email,
                phone,
                invite_type,
                user_exists: true,
                expiry_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
                inviter_user_id: user_id,
                receiver_user_id: teacher1.user_id,
              },
              { transaction: t }
            );
            await t.commit();
            res.status(HTTP_OK).json({
              message: "Invite sent",
              token: token,
            });
          }
        }
      );
    } else {
      const [teacher, created] = await User.findOrCreate({
        where: { email },
        defaults: {
          username: email,
          name: name ? name : null,
          email: email,
          phone: phone ? phone : null,
          is_google_login: false,
          role_id: role.role_id,
        },
        transaction: t,
      });
      mailTransporter.sendMail(
        {
          from: "dev.6amyoga@gmail.com",
          to: email,
          subject: "6AM Yoga | Teacher Invite",
          text: `Welcome to 6AM Yoga! Please click on the link to accept the invite: ${getFrontendDomain()}/teacher/invite?token=${token}`,
        },
        async (err, info) => {
          if (err) {
            await t.rollback();
            console.error(err);
            res.status(HTTP_INTERNAL_SERVER_ERROR).json({
              message: "Internal server error; try again",
            });
          } else {
            await Invite.create(
              {
                token,
                email,
                phone,
                invite_type,
                user_exists: true,
                expiry_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
                inviter_user_id: user_id,
              },
              { transaction: t }
            );
            await t.commit();

            res.status(HTTP_OK).json({
              message: "Invite sent",
              token: token,
            });
          }
        }
      );
    }
    return res;
  } catch (err) {
    console.log(err);
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
});

router.post("/accept", async (req, res) => {
  const { invite_token, confirm_phone } = req.body;
  if (!invite_token || !confirm_phone) {
    return res.status(HTTP_BAD_REQUEST).json({
      message: "Missing required fields",
    });
  }
  const t = await sequelize.transaction();
  try {
    // get invite
    const invite = await Invite.findOne({
      where: { token: invite_token },
    });

    if (!invite) {
      await t.rollback();
      return res.status(HTTP_BAD_REQUEST).json({
        message: "Invite not found",
      });
    }
    // check if phone matches
    console.log(invite.phone, confirm_phone);
    if (invite.phone !== confirm_phone) {
      await t.rollback();
      return res.status(HTTP_BAD_REQUEST).json({
        message: "Invalid phone number",
      });
    }
    // check expiry
    if (invite.expiry_date < new Date()) {
      await t.rollback();
      return res.status(HTTP_BAD_REQUEST).json({
        message: "Invite expired",
      });
    }
    if (invite.is_accepted === true && invite.is_filled === true) {
      await t.rollback();
      return res.status(HTTP_BAD_REQUEST).json({
        message: "Invite already accepted",
      });
    }
    // accept
    const n = await Invite.update(
      {
        is_accepted: true,
      },
      {
        where: {
          token: invite_token,
        },
        transaction: t,
      }
    );
    const user1 = await User.findOne({
      where: {
        phone: invite.phone,
      },
    });
    console.log(user1);
    const userinstitute1 = await UserInstitutePlanRole.findOne({
      where: {
        user_id: invite.inviter_user_id,
      },
    });

    if (!user1 || !userinstitute1) {
      await t.rollback();
      return res.status(HTTP_BAD_REQUEST).json({
        message: "User/Institute not found",
      });
    }
    const user_id = user1.user_id;
    const institute_id = userinstitute1.institute_id;

    const newUserInstitute = await UserInstitutePlanRole.create(
      {
        user_id: user_id,
        institute_id: institute_id,
        role_id: 4,
        plan_id: userinstitute1.plan_id,
      },
      { transaction: t }
    );

    await t.commit();
    return res.status(HTTP_OK).json({
      message: "Successfully accepted",
      receiver_id: invite.receiver_user_id,
    });
  } catch (err) {
    await t.rollback();
    console.log(err);
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
});

router.post("/reject", async (req, res) => {
  const { invite_token, confirm_email } = req.body;

  if (!invite_token || !confirm_email) {
    return res.status(HTTP_BAD_REQUEST).json({
      message: "Missing required fields",
    });
  }

  const t = await sequelize.transaction();
  try {
    // get invite
    const invite = await Invite.findOne({
      where: { token: invite_token },
    });

    if (!invite) {
      await t.rollback();
      return res.status(HTTP_BAD_REQUEST).json({
        message: "Invite not found",
      });
    }

    // check if email matches
    if (invite.email !== confirm_email) {
      await t.rollback();
      return res.status(HTTP_BAD_REQUEST).json({
        message: "Invalid email",
      });
    }

    // check expiry
    if (invite.expiry_date < new Date()) {
      await t.rollback();
      return res.status(HTTP_BAD_REQUEST).json({
        message: "Invite expired",
      });
    }

    if (invite.is_accepted === true && invite.is_filled === true) {
      await t.rollback();
      return res.status(HTTP_BAD_REQUEST).json({
        message: "Invite already accepted",
      });
    }

    // reject
    const n = await Invite.update(
      {
        is_accepted: false,
        is_filled: true,
      },
      {
        where: {
          token: invite_token,
        },
        transaction: t,
      }
    );

    await t.commit();
    return res.status(HTTP_OK).json({
      message: "Successfully rejected",
    });
  } catch (err) {
    await t.rollback();
    console.log(err);
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
});

router.post("/resend", async (req, res) => {
  const { invite_id } = req.body;

  if (!invite_id) {
    return res.status(HTTP_BAD_REQUEST).json({
      message: "Missing required fields",
    });
  }

  try {
    const invite = await Invite.findOne({
      where: { invite_id },
    });

    if (!invite) {
      return res.status(HTTP_BAD_REQUEST).json({
        message: "Invalid invite_id",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
});

router.delete("/delete-by-id", async (req, res) => {
  return res.status(HTTP_SERVICE_UNAVAILABLE).json({
    message: "Not implemented",
  });
});

router.post("/decrypt", async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(HTTP_BAD_REQUEST).json({
      message: "Missing required fields",
    });
  }
  try {
    const invite = invite_token.dec_token(token);
    return res.status(HTTP_OK).json({
      invite,
    });
  } catch (err) {
    console.log(err);
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
});

router.post("/update-userdetails", async (req, res) => {
  const { invite_token, username, new_password, confirm_new_password } =
    req.body;

  if (!invite_token || !username || !new_password || !confirm_new_password) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }

  if (new_password !== confirm_new_password) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Passwords do not match" });
  }

  const t = await sequelize.transaction();
  try {
    const invite = tokenUtils.dec_token(invite_token);

    const user = await User.findOne({
      where: { email: invite.invite_user_email },
      transaction: t,
    });

    if (!user) {
      await t.rollback();
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User does not exist" });
    }

    // hash password
    const hashedPassword = await bcrypyt.hash(new_password, 10);

    let n = await User.update(
      { username: username, password: hashedPassword },
      {
        where: { email: invite.invite_user_email },
        transaction: t,
      }
    );

    if (n.length > 0 && n[0] !== 1) {
      await t.rollback();
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User does not exist" });
    }

    n = await Invite.update(
      { is_filled: true },
      {
        where: { token: invite_token },
        transaction: t,
      }
    );

    if (n.length > 0 && n[0] !== 1) {
      await t.rollback();
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "Invite does not exist" });
    }

    await t.commit();
    return res.status(HTTP_OK).json({ message: "updated successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to update user" });
  }
});

router.post("/retract", async (req, res) => {
  const { invite_id, invite_token } = req.body;

  if (!invite_token || !invite_id) {
    return res.status(HTTP_BAD_REQUEST).json({
      message: "Missing required fields",
    });
  }

  const t = await sequelize.transaction();

  try {
    const invite = await Invite.findOne({
      where: { invite_id, token: invite_token },
      transaction: t,
    });

    if (!invite) {
      await t.rollback();
      return res.status(HTTP_BAD_REQUEST).json({
        message: "Invalid invite id",
      });
    }

    const n = await Invite.update(
      { is_retracted: true },
      {
        where: { invite_id },
        transaction: t,
      }
    );

    if (n.length > 0 && n[0] !== 1) {
      await t.rollback();
      return res.status(HTTP_BAD_REQUEST).json({
        message: "Invalid invite id",
      });
    }

    await t.commit();
    return res.status(HTTP_OK).json({
      message: "Retracted successfully",
    });
  } catch (err) {
    await t.rollback();
    console.log(err);
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
});

router.post("/get-all-by-inviterid", async (req, res) => {
  const { inviter_user_id } = req.body;

  if (!inviter_user_id) {
    return res.status(HTTP_BAD_REQUEST).json({
      message: "Missing required fields",
    });
  }

  try {
    const invites = await Invite.findAll({
      where: { inviter_user_id },
    });

    return res.status(HTTP_OK).json({
      invites,
    });
  } catch (err) {
    console.log(err);
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
});

router.post("/create-email-verification", async (req, res) => {
  const { name, email } = req.body;
  if (!email || !name) {
    return res.status(HTTP_BAD_REQUEST).json({
      message: "Missing required fields",
    });
  }
  const t = await sequelize.transaction();
  try {
    const token = tokenUtils.enc_token(name, email);
    console.log("TOKEN : ", token);
    mailTransporter.sendMail(
      {
        from: "dev.6amyoga@gmail.com",
        to: email,
        subject: "6AM Yoga | User Verify",
        text: `Welcome to 6AM Yoga! Please click on the link to verify your email: ${getFrontendDomain()}/auth/verify-email?token=${token}`,
      },
      async (err, info) => {
        if (err) {
          await t.rollback();
          console.error(err);
          res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            message: "Internal server error; try again",
          });
        } else {
          await EmailVerification.create(
            {
              token: token,
              email: email,
              name: name,
              is_verified: false,
              expiry_date: new Date(Date.now() + 30 * 60 * 1000),
            },
            { transaction: t }
          );
          await t.commit();
          res.status(HTTP_OK).json({
            message: "Email sent",
            token: token,
          });
        }
      }
    );
    return res;
  } catch (err) {
    console.log(err);
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
});

router.post("/get-email-verification-by-token", async (req, res) => {
  const { token } = req.body;
  console.log(token, "WAS OBTAINED");
  if (!token) {
    return res.status(HTTP_BAD_REQUEST).json({
      message: "Missing required fields",
    });
  }

  try {
    const allInvites = await EmailVerification.findAll();
    console.log("All Invites are : ", allInvites);
    const invite = await EmailVerification.findOne({
      where: { token },
    });
    console.log(invite, "IS THE RETRIEVED RECORD");
    if (!invite) {
      return res.status(HTTP_BAD_REQUEST).json({
        message: "Invalid token",
      });
    }
    return res.status(HTTP_OK).json({
      invite: {
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

router.post("/email-verified", async (req, res) => {
  const { token } = req.body;
  console.log(token);
  if (!token) {
    return res.status(HTTP_BAD_REQUEST).json({
      message: "Missing required fields",
    });
  }
  const t = await sequelize.transaction();
  try {
    // get invite
    const invite = await EmailVerification.findOne({
      where: { token: token },
    });

    if (!invite) {
      await t.rollback();
      return res.status(HTTP_BAD_REQUEST).json({
        message: "Invite not found",
      });
    }
    if (invite.expiry_date < new Date()) {
      await t.rollback();
      return res.status(HTTP_BAD_REQUEST).json({
        message: "Invite expired",
      });
    }
    if (invite.is_verified === true) {
      await t.rollback();
      return res.status(HTTP_BAD_REQUEST).json({
        message: "Invite already accepted",
      });
    }
    // accept
    const n = await EmailVerification.update(
      {
        is_verified: true,
      },
      {
        where: {
          token: token,
        },
        transaction: t,
      }
    );
    await t.commit();
    return res.status(HTTP_OK).json({
      message: "Successfully verified",
    });
  } catch (err) {
    await t.rollback();
    console.log(err);
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
});

module.exports = router;

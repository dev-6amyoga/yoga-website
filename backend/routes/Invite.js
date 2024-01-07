const express = require("express");

const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_SERVICE_UNAVAILABLE,
} = require("../utils/http_status_codes");

const { Invite } = require("../models/sql/Invite");

const { sequelize } = require("../init.sequelize");
const { User } = require("../models/sql/User");
const { Role } = require("../models/sql/Role");
const tokenUtils = require("../utils/invite_token");
const { mailTransporter } = require("../init.nodemailer");
const { Institute } = require("../models/sql/Institute");
const { UserInstitute } = require("../models/sql/UserInstitute");
// const { Op } = require('sequelize');
const bcrypyt = require("bcrypt");

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

    const user_institute = await UserInstitute.findOne({
      where: { user_id: invite.inviter_user_id },
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

    const user_institute = await UserInstitute.findOne({
      where: { user_id: invite.inviter_user_id },
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

    // create a teacher
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
    if (!created) {
      await t.rollback();
      return res.status(HTTP_BAD_REQUEST).json({
        message: "Teacher already exists with the given email",
      });
    }
    const token = tokenUtils.enc_token(email, phone, email);
    console.log("TOKEN : ", token);

    mailTransporter.sendMail(
      {
        from: "dev.6amyoga@gmail.com",
        to: email,
        subject: "6AM Yoga | Teacher Invite",
        text: `Welcome to 6AM Yoga! Please click on the link to accept the invite: http://localhost:3000/teacher/invite?token=${token}`,
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
              invite_type,
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

    return res;
  } catch (err) {
    console.log(err);
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
});

router.post("/accept", async (req, res) => {
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

    await t.commit();
    return res.status(HTTP_OK).json({
      message: "Successfully accepted",
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

    // resend mail
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

router.post('/retract', async (req, res) => {
    const { invite_id, invite_token } = req.body;

    if (!invite_token || !invite_id) {
        return res.status(HTTP_BAD_REQUEST).json({
            message: 'Missing required fields',
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
                message: 'Invalid invite id',
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
                message: 'Invalid invite id',
            });
        }

        await t.commit();
        return res.status(HTTP_OK).json({
            message: 'Retracted successfully',
        });
    } catch (err) {
        await t.rollback();
        console.log(err);
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error',
        });
    }
});

router.post('/get-all-by-inviterid', async (req, res) => {
    const { inviter_user_id } = req.body;

    if (!inviter_user_id) {
        return res.status(HTTP_BAD_REQUEST).json({
            message: 'Missing required fields',
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
            message: 'Internal server error',
        });
    }
});

module.exports = router;

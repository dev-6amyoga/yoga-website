const express = require("express");
const router = express.Router();
const { User } = require("../models/sql/User");
const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");
const { Op } = require("sequelize");

const { Plan } = require("../models/sql/Plan");
const { Institute } = require("../models/sql/Institute");
const { Role } = require("../models/sql/Role");
const { sequelize } = require("../init.sequelize");
const bcrypyt = require("bcrypt");
const { UserPlan } = require("../models/sql/UserPlan");
const {
  verifyToken,
  TOKEN_TYPE_ACCESS,
  authenticateToken,
} = require("../utils/jwt");
const {
  UserInstitutePlanRole,
} = require("../models/sql/UserInstitutePlanRole");
const { GetUserInfo, GetUser } = require("../services/User.service");
const { hasPermission } = require("../utils/hasPermission");

router.post("/get-by-id", async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }
  try {
    const [user, errorUser] = await GetUserInfo({ user_id: user_id }, [
      "user_id",
      "name",
      "email",
      "phone",
      "username",
    ]);

    if (!user || errorUser) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User does not exist" });
    }

    return res.status(HTTP_OK).json({ user });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch user" });
  }
});

router.post("/get-by-token", async (req, res) => {
  const { access_token } = req.body;

  if (!access_token) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }

  try {
    const [decoded, error] = verifyToken(access_token);

    if (!decoded || error) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "Invalid access token" });
    }

    if (decoded.token_type !== TOKEN_TYPE_ACCESS) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "Invalid access token" });
    }

    const [user, errorUser] = await GetUserInfo(
      {
        user_id: decoded.user.user_id,
      },
      ["user_id", "name", "email", "phone"]
    );

    if (!user || errorUser) {
      return res.status(HTTP_BAD_REQUEST).json({ error: errorUser });
    }

    return res.status(HTTP_OK).json({ user });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch user" });
  }
});

router.post(
  "/get-by-username",
  authenticateToken,
  (req, res, next) => hasPermission(req, res, next, "USER_READ"),
  async (req, res) => {
    const { username } = req.body;

    if (!username) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "Missing required fields" });
    }

    try {
      const [user, errorUser] = await GetUser({ username });

      if (!user || errorUser) {
        return res.status(HTTP_BAD_REQUEST).json({ error: errorUser });
      }

      return res.status(HTTP_OK).json({ user });
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to fetch user" });
    }
  }
);

router.post("/get-by-email", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }

  try {
    const [user, errorUser] = await GetUser({ email });

    if (!user || errorUser) {
      return res.status(HTTP_BAD_REQUEST).json({ error: errorUser });
    }

    return res.status(HTTP_OK).json({ user });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch user" });
  }
});

router.post("/get-by-phone", async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }

  try {
    const [user, errorUser] = await GetUser({ phone });

    if (!user || errorUser) {
      return res.status(HTTP_BAD_REQUEST).json({ error: errorUser });
    }

    return res.status(HTTP_OK).json({ user });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch user" });
  }
});

router.post("/get-by-instituteid", async (req, res) => {
  const { institute_id } = req.body;

  if (!institute_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }

  try {
    const users = await sequelize.query(
      `
      SELECT * from user_institute_plan_role WHERE institute_id = ${institute_id} AND role_id = 2;
      `,
      {
        model: UserInstitutePlanRole,
        mapToModel: true,
      }
    );
    console.log(users, "ARE USERS");

    return res.status(HTTP_OK).json({ users });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch users" });
  }
});

router.post("/get-by-planid", async (req, res) => {
  const { plan_id } = req.body;

  if (!plan_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }

  try {
    const users = await sequelize.query(
      `
      SELECT u.* from user u
      JOIN user_plan up on up.user_id = u.user_id
      JOIN plan p on up.plan_id = p.plan_id
      where p.plan_id = ${plan_id};
      `,
      {
        model: User,
        mapToModel: true,
      }
    );

    return res.status(HTTP_OK).json({ users });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch users" });
  }
});

router.post("/update-profile", async (req, res) => {
  const { user_id, name, email, phone } = req.body;
  console.log(req.body);
  if (!user_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }

  try {
    // Check if email or phone already exists for another user
    const existingUser = await User.findOne({
      where: {
        [Op.and]: [
          { [Op.or]: [{ email }, { phone }] },
          { user_id: { [Op.ne]: user_id } }, // Exclude the current user from the check
        ],
      },
    });

    if (existingUser) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "Email or phone already exists for another user" });
    }

    // Update the user's profile
    const [n] = await User.update(
      { name, email, phone },
      {
        where: { user_id: user_id },
      }
    );

    if (n !== 1) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User does not exist" });
    }

    const user = await User.findByPk(user_id, {
      include: [{ model: Role, attributes: ["name"] }],
    });

    if (!user) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User does not exist" });
    }

    const plan = await UserPlan.findOne({
      include: [{ model: User, where: { user_id: user.user_id } }],
    });

    return res
      .status(HTTP_OK)
      .json({ message: "Updated successfully", user, plan });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to update user" });
  }
});

router.post("/update-password", async (req, res) => {
  const { user_id, old_password, new_password, confirm_new_password } =
    req.body;

  if (!user_id || !old_password || !new_password || !confirm_new_password) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }

  if (new_password !== confirm_new_password) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Passwords do not match" });
  }

  try {
    const user = await User.findByPk(user_id);

    if (!user) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User does not exist" });
    }

    // check old password
    const validPassword = await bcrypyt.compare(old_password, user.password);

    if (!validPassword) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "Invalid old password; try again" });
    }

    // hash password
    const hashedPassword = await bcrypyt.hash(new_password, 10);

    const n = await User.update(
      { password: hashedPassword },
      {
        where: { user_id: user_id },
      }
    );

    if (n.length > 0 && n[0] !== 1) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User does not exist" });
    }

    return res.status(HTTP_OK).json({ message: "updated successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to update user" });
  }
});

router.delete("/delete-by-id", async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }

  try {
    const n = await User.destroy({ where: { user_id: user_id } });

    if (n !== 1) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User does not exist" });
    }

    return res.status(HTTP_OK).json({ message: "Deleted user successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch user" });
  }
});

router.get("/get-all-teachers", async (req, res) => {
  try {
    const users = await UserInstitutePlanRole.findAll({
      where: { role_id: 4 },
      include: [{ model: User }, { model: Institute }],
    });
    if (!users) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "Teachers dont exist" });
    }
    return res.status(HTTP_OK).json({ users });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch teachers" });
  }
});

router.get("/get-all-institutes", async (req, res) => {
  try {
    const users = await UserInstitutePlanRole.findAll({
      where: { role_id: 2 },
      include: [{ model: User }, { model: Institute }],
    });
    if (!users) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "Institutes dont exist" });
    }
    return res.status(HTTP_OK).json({ users });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch Institutes" });
  }
});

router.get("/get-all-students", async (req, res) => {
  try {
    const users = await UserInstitutePlanRole.findAll({
      where: { role_id: 5 },
      include: [{ model: User }],
    });
    if (!users) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "Students dont exist" });
    }
    return res.status(HTTP_OK).json({ users });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch Students" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { user_id, new_password, confirm_new_password } = req.body;
  console.log(req.body);
  if (!user_id || !new_password || !confirm_new_password) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }
  if (new_password !== confirm_new_password) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Passwords do not match" });
  }
  console.log("hi");
  try {
    const user = await User.findByPk(user_id);

    if (!user) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User does not exist" });
    }
    console.log(new_password, user.password);
    const samePasswords = await bcrypyt.compare(new_password, user.password);
    if (samePasswords) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "Password not allowed; try again" });
    }

    const hashedPassword = await bcrypyt.hash(new_password, 10);
    const n = await User.update(
      { password: hashedPassword },
      {
        where: { user_id: user_id },
      }
    );

    if (n.length > 0 && n[0] !== 1) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User does not exist" });
    }
    return res.status(HTTP_OK).json({ message: "Updated successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to update user" });
  }
});

router.post("/get-by-email-and-name", async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }

  try {
    const user = await User.findOne({
      where: { email: email, name: name },
      include: [{ model: Role, attributes: ["name"] }],
    });

    if (!user) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User does not exist" });
    }

    const plan = await UserPlan.findOne({
      include: [{ model: User, where: { user_id: user.user_id } }],
    });

    return res.status(HTTP_OK).json({ user, plan });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch user" });
  }
});

router.post("/check-username", async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }

  try {
    const user = await User.findOne({
      where: { username: username },
      attributes: ["user_id"],
    });

    if (!user) {
      return res.status(HTTP_OK).json({ exists: false });
    }

    return res.status(HTTP_OK).json({ exists: true });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Error checking username" });
  }
});

router.post("/update-email", async (req, res) => {
  const { user_id, email } = req.body;
  console.log(user_id, email);
  if (!user_id || !email) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }
  try {
    const n = await User.update(
      { email },
      {
        where: { user_id: user_id },
      }
    );
    if (n.length > 0 && n[0] !== 1) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User does not exist" });
    }

    return res.status(HTTP_OK).json({ message: "updated successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to update user" });
  }
});
module.exports = router;

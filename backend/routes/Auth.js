const express = require("express");
const router = express.Router();

const auth = require("../oauth");
const { User: UserSQL } = require("../models/sql/User");
const brypt = require("bcrypt");
const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_SERVICE_UNAVAILABLE,
} = require("../utils/http_status_codes");
const { Institute } = require("../models/sql/Institute");
const { Role } = require("../models/sql/Role");
const { Op } = require("sequelize");
const { Plan } = require("../models/sql/Plan");
const { sequelize } = require("../init.sequelize");
const { timeout } = require("../utils/promise_timeout");
const { validate_email } = require("../utils/validate_email");

const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  TOKEN_TYPE_REFRESH,
  TOKEN_TYPE_ACCESS,
} = require("../utils/jwt");
const { GetUserInfo } = require("../services/User.service");
const {
  UserInstitutePlanRole,
} = require("../models/sql/UserInstitutePlanRole");

router.post("/verify-google", async (req, res) => {
  const { client_id, jwtToken } = req.body;
  try {
    const userInfo = await auth.verify(client_id, jwtToken);
    return res.status(HTTP_OK).json(userInfo);
  } catch (error) {
    console.error("Authentication error:", error.message);
    return res.status(401).json({ error: "Authentication failed" });
  }
});

router.post("/verify-tokens", async (req, res) => {
  const { access_token, refresh_token } = req.body;

  console.log({ access_token, refresh_token });

  if (!access_token || !refresh_token) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: "Missing required fields" });
  }

  // decode and verify refresh token as it expires much later	than access token
  let [decodedRefresh, errorRefresh] = verifyToken(refresh_token);

  console.log({ decodedRefresh, errorRefresh });

  if (!decodedRefresh || errorRefresh) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: "Refresh token expired" });
  }

  if (decodedRefresh.token_type !== TOKEN_TYPE_REFRESH) {
    return res.status(HTTP_BAD_REQUEST).json({ message: "Invalid token" });
  }

  let [decodedAccess, errorAccess] = verifyToken(access_token);

  if (!decodedAccess || errorAccess) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: "Access token expired" });
  }

  if (decodedAccess.token_type !== TOKEN_TYPE_ACCESS) {
    return res.status(HTTP_BAD_REQUEST).json({ message: "Invalid token" });
  }

  return res.status(HTTP_OK).json({ message: "Token verified" });
});

router.post("/login", async (req, res) => {
  // TODO : jwt token
  const { username, password } = req.body;

  if (!username || !password)
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: "Missing required fields" });

  // check if user exists
  let [user, errorUser] = await GetUserInfo({ username });

  if (!user || errorUser)
    return res.status(HTTP_BAD_REQUEST).json({ error: "User does not exist" });

  // check password
  const validPassword = await brypt.compare(password, user.password);

  if (!validPassword)
    return res.status(HTTP_BAD_REQUEST).json({ error: "Invalid password" });

  delete user.password;

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return res.status(HTTP_OK).json({ user, accessToken, refreshToken });
});

router.post("/refresh-token", async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }

  const [decoded, error] = verifyToken(refresh_token);

  console.log(decoded, error);

  if (!decoded || error) {
    return res.status(HTTP_BAD_REQUEST).json({ error: "Invalid token" });
  }

  if (decoded.token_type !== TOKEN_TYPE_REFRESH) {
    return res.status(HTTP_BAD_REQUEST).json({ error: "Invalid token" });
  }

  const user = decoded.user;

  const accessToken = generateAccessToken(user);

  return res.status(HTTP_OK).json({ accessToken });
});

router.post("/register", async (req, res) => {
  const {
    username,
    password,
    confirm_password,
    email_id,
    phone_no,
    name,
    institute_name,
    role_name,
    is_google_login,
  } = req.body;
  // validate inputs

  if (
    !username ||
    !password ||
    !email_id ||
    !phone_no ||
    !name ||
    !role_name ||
    is_google_login === undefined ||
    is_google_login === null
  )
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });

  if (!validate_email(email_id)) {
    return res.status(HTTP_BAD_REQUEST).json({ error: "Invalid email" });
  }

  // check password
  if (password !== confirm_password)
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Passwords do not match" });

  if (password.length < 4) {
    return res.status(HTTP_BAD_REQUEST).json({
      error: "Password must be at least 4 characters long",
    });
  }

  // check if user exists
  const user = await UserSQL.findOne({
    where: {
      [Op.or]: [
        { username: username },
        { email: email_id },
        { phone: phone_no },
      ],
    },
    attributes: ["user_id", "name", "username", "email", "phone"],
  });

  if (user && user.username === username)
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Username already exists" });

  if (user && user.email === email_id)
    return res.status(HTTP_BAD_REQUEST).json({ error: "Email already exists" });

  if (user && user.phone === phone_no)
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Phone No. already exists" });

  // hash password
  const salt = await brypt.genSalt(10);
  const hashedPassword = await brypt.hash(password, salt);

  // db transaction
  const t = await sequelize.transaction();
  try {
    // find insitite by name
    let institute = null;
    console.log({ institute_name });
    if (
      institute_name.length > 0 &&
      institute_name !== "" &&
      institute_name !== null &&
      institute_name !== undefined
    ) {
      institute = await Institute.findOne(
        {
          where: { name: institute_name },
          attributes: ["institute_id"],
        },
        { transaction: t }
      );

      // console.log({ institute });

      if (institute === null) throw new Error("Institute doesn't exist");
    }

    // find role by name
    const role = await Role.findOne(
      {
        where: { name: role_name },
        attributes: ["role_id"],
      },
      { transaction: t }
    );

    if (!role) throw new Error("Role doesn't exist");

    // create user
    const newUser = await UserSQL.create(
      {
        username,
        password: hashedPassword,
        name,
        email: email_id,
        phone: phone_no,
        is_google_login,
      },
      { transaction: t }
    );

    // console.log(newUser.toJSON());

    // create user_institute

    const user_institute_plan_role = await UserInstitutePlanRole.create(
      {
        user_id: newUser.user_id,
        institute_id: institute ? institute.institute_id : null,
        role_id: role.role_id,
        plan_id: null,
      },
      { transaction: t }
    );

    await timeout(t.commit(), 5000, new Error("timeout; try again"));

    return res.status(HTTP_OK).json({ user: newUser });
  } catch (error) {
    console.error(error);
    await t.rollback();

    switch (error.message) {
      case "Institute doesn't exist":
      case "Role doesn't exist":
        return res.status(HTTP_BAD_REQUEST).json({ error: error.message });
      default:
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
          error: error.message,
        });
    }
  }
});

router.post("/register-google", async (req, res) => {
  // used to register user whos logging in using google oauth
  const { email, name, is_google_login, client_id } = req.body;
  // const {access_token} = req.headers.authorization?.split(" ") ?? null

  // validate inputs
  if (
    !email ||
    !name ||
    !client_id ||
    is_google_login === undefined ||
    is_google_login === null
  )
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });

  const userInfo = await auth.verify(client_id, jwt_token);

  if (!userInfo) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Invalid Google OAuth token" });
  }

  if (userInfo.email !== email) {
    return res.status(HTTP_BAD_REQUEST).json({
      error: "unmatched email",
    });
  }

  if (!validate_email(email)) {
    return res.status(HTTP_BAD_REQUEST).json({ error: "Invalid email" });
  }

  if (!is_google_login) {
    return res.status(HTTP_BAD_REQUEST).json({
      error: "user not registered using Google OAuth",
    });
  }

  // check if user exists
  const user = await UserSQL.findOne({
    where: {
      email: email,
    },
    attributes: ["user_id", "name", "username", "email"],
  });
  if (user && user.email === email)
    return res.status(HTTP_BAD_REQUEST).json({ error: "Email already exists" });

  // db transaction
  const t = await sequelize.transaction();

  try {
    // create user
    const newUser = await UserSQL.create(
      {
        name,
        email,
        is_google_login,
      },
      { transaction: t }
    );

    const user_institute_plan_role = await UserInstitutePlanRole.create(
      {
        user_id: newUser.user_id,
        institute_id: null,
        role_id: null,
        plan_id: null,
      },
      { transaction: t }
    );

    await timeout(t.commit(), 5000, new Error("timeout; try again"));

    res.status(HTTP_OK).json({ user: newUser });
  } catch (error) {
    console.error(error);
    await t.rollback();

    switch (error.message) {
      default:
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
          error: error.message,
        });
    }
  }
});

module.exports = router;

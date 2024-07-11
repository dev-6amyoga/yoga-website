const express = require("express");
const router = express.Router();
const { User } = require("../models/sql/User");
const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");
const tokenUtils = require("../utils/invite_token");
const { Op } = require("sequelize");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const {
  DrawingUtils,
  FilesetResolver,
  PoseLandmarker,
} = require("@mediapipe/tasks-vision");

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

router.post("/pose-detection", async (req, res) => {
  const { image } = req.body;
  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );
    const landmarker = await PoseLandmarker.createFromModelPath(
      vision,
      "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"
    );
    // const landmarker = await PoseLandmarker.createFromOptions(vision, {
    //   baseOptions: {
    //     modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
    //     delegate: "GPU",
    //   },
    //   runningMode: "IMAGE",
    //   numPoses: 2,
    // });

    const imageBuffer = Buffer.from(image.split(",")[1], "base64");
    const landmarks = await landmarker.detect(imageBuffer);
    const { score, message } = detectVrikshasana(landmarks);
    res.json({ score, message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process image" });
  }
});

const detectVrikshasana = (landmarks) => {
  // Pose detection logic here
  // This should be the same as the logic in your frontend detectVrikshasana function

  let score = 0;
  let message = "Posture detected";

  // Your posture detection logic here...

  return { score, message };
};

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

  const t = await sequelize.transaction();
  try {
    const [decoded, error] = verifyToken(access_token);

    if (!decoded || error) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "Invalid access token" });
    }

    if (decoded.token_type !== TOKEN_TYPE_ACCESS) {
      await t.rollback();
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "Invalid access token" });
    }

    if (!decoded?.user?.user_id) {
      await t.rollback();
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "Invalid access token" });
    }

    // update user plans
    const uipr = await UserInstitutePlanRole.findAll({
      where: {
        user_id: decoded?.user?.user_id,
      },
      transaction: t,
    });

    if (uipr.length === 0) {
      await t.rollback();
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User not registered" });
    }

    for (let i = 0; i < uipr.length; i++) {
      const u = uipr[i];
      console.log(
        "Updating user plan status",
        decoded?.user?.user_id,
        u.get("institute_id")
      );
      await UpdateUserPlanStatus(
        decoded?.user?.user_id,
        u.get("institute_id"),
        t
      );
    }

    let [user, errorUser] = await GetUserInfo(
      { user_id: decoded?.user?.user_id },
      ["user_id", "name", "email", "phone"]
    );

    if (!user || errorUser) {
      await t.rollback();
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User does not exist" });
    }

    await t.commit();
    return res.status(HTTP_OK).json({ user });
  } catch (error) {
    await t.rollback();
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

router.post("/check-email", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }

  try {
    const user = await User.findOne({
      where: {
        email: email,
      },
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
      .json({ error: "Error checking email" });
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

router.post("/check-phone-number", async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }

  try {
    const user = await User.findOne({
      where: {
        phone: {
          [Op.like]: `%${phone}%`,
        },
      },
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
      .json({ error: "Error checking phone number" });
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
    return res.status(HTTP_OK).json({ users });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch users" });
  }
});

router.post("/get-role-by-user-id", async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }
  try {
    const user_role = await UserInstitutePlanRole.findAll({
      where: {
        user_id: user_id,
      },
      attributes: ["user_id", "role_id"],
      include: [
        {
          model: Role,
        },
      ],
    });
    if (!user_role) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User does not exist in this institute" });
    }
    return res.status(HTTP_OK).json({ user_role });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch user" });
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
  const { user_id, name, email, phone, username } = req.body;

  if (!user_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }

  try {
    let filters = [];

    if (email) {
      filters.push({ email: email });
    }

    if (phone) {
      filters.push({ phone: phone });
    }

    if (username) {
      filters.push({ username: username });
    }

    if (filters.length > 0) {
      // Check if email or phone already exists for another user
      const existingUser = await User.findOne({
        where: {
          [Op.and]: [
            { [Op.or]: filters },
            { user_id: { [Op.ne]: user_id } }, // Exclude the current user from the check
          ],
        },
      });

      if (existingUser) {
        return res.status(HTTP_BAD_REQUEST).json({
          error: "Email or phone already exists for another user",
        });
      }
    }

    let updates = {};

    if (name) {
      updates.name = name;
    }

    if (email) {
      updates.email = email;
    }

    if (phone) {
      updates.phone = phone;
    }

    if (username) {
      updates.username = username;
    }

    // Update the user's profile
    const [n] = await User.update(updates, {
      where: { user_id: user_id },
    });
    if (n !== 1) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User does not exist" });
    }

    const user = await User.findOne({
      where: { user_id: user_id },
    });
    if (!user) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User does not exist" });
    }

    return res.status(HTTP_OK).json({ message: "Updated successfully", user });
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

    if (old_password === new_password) {
      return res.status(HTTP_BAD_REQUEST).json({
        error: "New password cannot be the same as previous password!",
      });
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

router.post("/update-name-username", async (req, res) => {
  const { user_id, name, username } = req.body;

  if (!user_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }

  try {
    let filters = [];

    if (username) {
      filters.push({ username: username });
    }

    if (filters.length > 0) {
      const existingUser = await User.findOne({
        where: {
          [Op.and]: [
            { [Op.or]: filters },
            { user_id: { [Op.ne]: user_id } }, // Exclude the current user from the check
          ],
        },
      });

      if (existingUser) {
        return res.status(HTTP_BAD_REQUEST).json({
          error: "Username already exists for another user",
        });
      }
    }

    let updates = {};

    if (name) {
      updates.name = name;
    }

    if (username) {
      updates.username = username;
    }

    const [n] = await User.update(updates, {
      where: { user_id: user_id },
    });
    if (n !== 1) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User does not exist" });
    }

    const user = await User.findOne({
      where: { user_id: user_id },
    });
    if (!user) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User does not exist" });
    }

    return res.status(HTTP_OK).json({ message: "Updated successfully", user });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to update user" });
  }
});

const { mailTransporter } = require("../init.nodemailer");
const getFrontendDomain = require("../utils/getFrontendDomain");
const { UpdateUserPlanStatus } = require("../services/UserPlan.service");

router.post("/forgot-password-email", async (req, res) => {
  const { email_id } = req.body;
  const token = tokenUtils.enc_token(email_id);
  const user = await User.findOne({
    where: { email: email_id },
  });
  if (!user) {
    return res.status(HTTP_OK).json({ error: "User does not exist" });
  }
  mailTransporter.sendMail(
    {
      from: "dev.6amyoga@gmail.com",
      to: email_id,
      subject: "6AM Yoga | Forgot Password",
      text: `Welcome to 6AM Yoga! Please click on the link to reset your password: ${getFrontendDomain()}/user/forgotPassword?token=${token}`,
    },
    async (err, info) => {
      if (err) {
        console.error(err);
        res.status(HTTP_INTERNAL_SERVER_ERROR).json({
          message: "Internal server error; try again",
        });
      } else {
        res.status(HTTP_OK).json({
          message: "Email sent",
        });
      }
    }
  );
});

router.post("/forgot-password-token", async (req, res) => {
  const { token } = req.body;
  const email = tokenUtils.dec_token(token);

  try {
    if (!email) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "Token does not exist" });
    }

    // check for expiry
    const currentTime = new Date();

    const tokenTime = new Date(email.create_time);

    const diff = currentTime - tokenTime;

    if (diff > 1000 * 60 * 10) {
      return res.status(HTTP_BAD_REQUEST).json({ error: "Token expired" });
    }

    const user = await User.findOne({
      where: { email: email.invite_user_email },
      attributes: ["user_id", "email", "username"],
    });

    if (!user) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User does not exist" });
    }
    return res.status(HTTP_OK).json({ user: user });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch user" });
  }
});

router.post("/forgot-password-update", async (req, res) => {
  const { user_id, new_password, confirm_new_password } = req.body;

  // console.log(user_id, new_password, confirm_new_password);

  if (
    user_id === null ||
    user_id === undefined ||
    !new_password ||
    !confirm_new_password
  ) {
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

    // console.log(user);
    if (!user) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User does not exist" });
    }

    const samePassword = await bcrypyt.compare(new_password, user.password);

    if (samePassword) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "New password cannot be previously used!" });
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
    const userInstituteData = await UserInstitutePlanRole.findAll({
      where: { role_id: 2 },
      include: [{ model: User }, { model: Institute }],
    });
    if (!userInstituteData) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "Institutes dont exist" });
    }
    return res.status(HTTP_OK).json({ userInstituteData });
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

    let userData = users.map((u) => {
      return u.user;
    });
    return res.status(HTTP_OK).json({ users: userData });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch Students" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { user_id, new_password, confirm_new_password } = req.body;
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
  try {
    const user = await User.findByPk(user_id);

    if (!user) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User does not exist" });
    }
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

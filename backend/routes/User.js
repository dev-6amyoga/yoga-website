const express = require("express");
const router = express.Router();
const { User } = require("../models/sql/User");
const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");
const { Plan } = require("../models/sql/Plan");
const { Institute } = require("../models/sql/Institute");
const { Role } = require("../models/sql/Role");

// router.post('/addUser', async (req, res) => {
//     try {
//         const requestData = req.body;
//         const newUser = new User(requestData);
//         const savedUser = await newUser.save();
//         res.status(201).json(savedUser);
//     } catch (error) {
//         console.error('Error saving new Asana:', error);
//         res.status(500).json({ error: 'Failed to save new Asana' });
//     }
// });

// router.get('/allUsers', async (req, res) => {
//     try {
//         const users = await User.find();
//         // console.log(users);
//         res.json(users);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Failed to fetch users' });
//     }
// });

router.post("/get-by-id", async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }

  try {
    const user = await User.findByPk(id, {
      include: [
        { model: Institute, attributes: ["name"] },
        { model: Role, attributes: ["name"] },
      ],
    });

    if (!user) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User does not exist" });
    }

    const plan = await Plan.findOne({
      include: [{ model: User, where: { id: id } }],
    });

    return res.status(HTTP_OK).json({ user, plan });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch user" });
  }
});

router.post("/get-by-username", async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }

  try {
    const user = await User.findByPk(id, {
      include: [
        { model: Institute, attributes: ["name"] },
        { model: Role, attributes: ["name"] },
      ],
    });

    if (!user) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User does not exist" });
    }

    const plan = await Plan.findOne({
      include: [{ model: User, where: { id: id } }],
    });

    return res.status(HTTP_OK).json({ user, plan });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch user" });
  }
});

router.post("/get-by-email", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }

  try {
    const user = await User.findByPk(id, {
      include: [
        { model: Institute, attributes: ["name"] },
        { model: Role, attributes: ["name"] },
      ],
    });

    if (!user) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User does not exist" });
    }

    const plan = await Plan.findOne({
      include: [{ model: User, where: { id: id } }],
    });

    return res.status(HTTP_OK).json({ user, plan });
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
    const users = await User.findAll({});
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch user" });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { User: UserSQL } = require('../models/sql/User');
const brypt = require('bcrypt');
const {
    HTTP_BAD_REQUEST,
    HTTP_OK,
    HTTP_INTERNAL_SERVER_ERROR,
} = require('../utils/http_status_codes');
const { Institute } = require('../models/sql/Institute');
const { Role } = require('../models/sql/Role');
const { Op } = require('sequelize');
const { sequelize } = require('../init.sequelize');
const { timeout } = require('../utils/promise_timeout');
const { validate_email } = require('../utils/validate_email');

////////////////////////////////////////////////////////////////////////////////////

router.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        res.status(HTTP_BAD_REQUEST).json({ error: 'Missing required fields' });

    // check if user exists
    const user = await UserSQL.findOne({
        where: { username: username },
        attributes: ['id', 'name', 'username', 'email', 'password'],
        include: [
            { model: Institute, attributes: ['name'] },
            { model: Role, attributes: ['name'] },
        ],
    });

    if (!user)
        res.status(HTTP_BAD_REQUEST).json({ error: 'User does not exist' });

    // check password
    const validPassword = await brypt.compare(password, user.password);

    if (!validPassword)
        res.status(HTTP_BAD_REQUEST).json({ error: 'Invalid password' });

    res.status(HTTP_OK).json({ user });
});

router.post('/auth/register', async (req, res) => {
    const {
        username,
        password,
        confirm_password,
        email,
        name,
        institute_name,
        role_name,
        is_google_login,
    } = req.body;

    // validate inputs
    if (
        !username ||
        !password ||
        !email ||
        !name ||
        !role_name ||
        is_google_login === undefined ||
        is_google_login === null
    )
        return res
            .status(HTTP_BAD_REQUEST)
            .json({ error: 'Missing required fields' });

    if (!validate_email(email)) {
        return res.status(HTTP_BAD_REQUEST).json({ error: 'Invalid email' });
    }

    // check password
    if (password !== confirm_password)
        return res
            .status(HTTP_BAD_REQUEST)
            .json({ error: 'Passwords do not match' });

    if (password.length < 4) {
        return res.status(HTTP_BAD_REQUEST).json({
            error: 'Password must be at least 4 characters long',
        });
    }

    // check if user exists
    const user = await UserSQL.findOne({
        where: {
            [Op.or]: [{ username: username }, { email: email }],
        },
        attributes: ['id', 'name', 'username', 'email'],
    });

    console.log(user);

    if (user && user.username === username)
        return res
            .status(HTTP_BAD_REQUEST)
            .json({ error: 'Username already exists' });

    if (user && user.email === email)
        return res
            .status(HTTP_BAD_REQUEST)
            .json({ error: 'Email already exists' });

    // hash password
    const salt = await brypt.genSalt(10);
    const hashedPassword = await brypt.hash(password, salt);

    // transaction
    const t = await sequelize.transaction();
    try {
        // find insitite by name
        let institute = null;

        if (institute_name !== '') {
            institute = await Institute.findOne(
                {
                    where: { name: institute_name },
                    attributes: ['id'],
                },
                { transaction: t }
            );

            if (!institute) throw new Error("Institute doesn't exist");
        }

        // find role by name
        const role = await Role.findOne(
            {
                where: { name: role_name },
                attributes: ['id'],
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
                email,
                institute_id: institute ? institute.id : null,
                role_id: role.id,
                is_google_login,
            },
            { transaction: t }
        );

        console.log('committing');
        await timeout(t.commit(), 5000, new Error('timeout; try again'));

        res.status(HTTP_OK).json({ user: newUser });
    } catch (error) {
        console.error(error);
        await t.rollback();

        switch (error.message) {
            case "Institute doesn't exist":
            case "Role doesn't exist":
                return res
                    .status(HTTP_BAD_REQUEST)
                    .json({ error: "Role doesn't exist" });
            default:
                return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                    error: error.message,
                });
        }
    }
});

router.post('/addUser', async (req, res) => {
    try {
        const requestData = req.body;
        const newUser = new User(requestData);
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        console.error('Error saving new Asana:', error);
        res.status(500).json({ error: 'Failed to save new Asana' });
    }
});

router.get('/allUsers', async (req, res) => {
    try {
        const users = await User.find();
        // console.log(users);
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

module.exports = router;

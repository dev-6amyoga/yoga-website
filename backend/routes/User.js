const express = require('express');
const router = express.Router();
const { User } = require('../models/sql/User');
const {
    HTTP_BAD_REQUEST,
    HTTP_OK,
    HTTP_INTERNAL_SERVER_ERROR,
} = require('../utils/http_status_codes');
const { Plan } = require('../models/sql/Plan');
const { Institute } = require('../models/sql/Institute');
const { Role } = require('../models/sql/Role');
const { sequelize } = require('../init.sequelize');
const bcrypyt = require('bcrypt');
const { UserPlan } = require('../models/sql/UserPlan');

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

router.post('/get-by-id', async (req, res) => {
    const { user_id } = req.body;

    if (!user_id) {
        return res
            .status(HTTP_BAD_REQUEST)
            .json({ error: 'Missing required fields' });
    }

    try {
        const user = await User.findByPk(user_id, {
            include: [
                { model: Institute, attributes: ['name'] },
                { model: Role, attributes: ['name'] },
            ],
        });

        if (!user) {
            return res
                .status(HTTP_BAD_REQUEST)
                .json({ error: 'User does not exist' });
        }

        const plan = await UserPlan.findOne({
            include: [{ model: User, where: { user_id: user_id } }],
        });

        return res.status(HTTP_OK).json({ user, plan });
    } catch (error) {
        console.error(error);
        return res
            .status(HTTP_INTERNAL_SERVER_ERROR)
            .json({ error: 'Failed to fetch user' });
    }
});

router.post('/get-by-username', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res
            .status(HTTP_BAD_REQUEST)
            .json({ error: 'Missing required fields' });
    }

    try {
        const user = await User.findOne({
            where: {
                username: username,
            },
            include: [
                { model: Institute, attributes: ['name'] },
                { model: Role, attributes: ['name'] },
            ],
        });

        if (!user) {
            return res
                .status(HTTP_BAD_REQUEST)
                .json({ error: 'User does not exist' });
        }

        const plan = await UserPlan.findOne({
            include: [{ model: User, where: { user_id: user.user_id } }],
        });

        return res.status(HTTP_OK).json({ user, plan });
    } catch (error) {
        console.error(error);
        return res
            .status(HTTP_INTERNAL_SERVER_ERROR)
            .json({ error: 'Failed to fetch user' });
    }
});

router.post('/get-by-email', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res
            .status(HTTP_BAD_REQUEST)
            .json({ error: 'Missing required fields' });
    }

    try {
        const user = await User.findOne({
            where: { email: email },
            include: [
                { model: Institute, attributes: ['name'] },
                { model: Role, attributes: ['name'] },
            ],
        });

        if (!user) {
            return res
                .status(HTTP_BAD_REQUEST)
                .json({ error: 'User does not exist' });
        }

        const plan = await UserPlan.findOne({
            include: [{ model: User, where: { user_id: user.user_id } }],
        });

        return res.status(HTTP_OK).json({ user, plan });
    } catch (error) {
        console.error(error);
        return res
            .status(HTTP_INTERNAL_SERVER_ERROR)
            .json({ error: 'Failed to fetch user' });
    }
});

router.post('/get-by-phone', async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res
            .status(HTTP_BAD_REQUEST)
            .json({ error: 'Missing required fields' });
    }

    try {
        const user = await User.findOne({
            where: { phone: phone },
            include: [
                { model: Institute, attributes: ['name'] },
                { model: Role, attributes: ['name'] },
            ],
        });

        if (!user) {
            return res
                .status(HTTP_BAD_REQUEST)
                .json({ error: 'User does not exist' });
        }

        const plan = await UserPlan.findOne({
            include: [{ model: User, where: { user_id: user.user_id } }],
        });

        return res.status(HTTP_OK).json({ user, plan });
    } catch (error) {
        console.error(error);
        return res
            .status(HTTP_INTERNAL_SERVER_ERROR)
            .json({ error: 'Failed to fetch user' });
    }
});

router.post('/get-by-instituteid', async (req, res) => {
    const { institute_id } = req.body;

    if (!institute_id) {
        return res
            .status(HTTP_BAD_REQUEST)
            .json({ error: 'Missing required fields' });
    }

    try {
        const users = await sequelize.query(
            `SELECT u.* from user u JOIN institute i on u.institute_id = i.user_id where i.user_id = ${institute_id};`,
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
            .json({ error: 'Failed to fetch users' });
    }
});

router.post('/get-by-planid', async (req, res) => {
    const { plan_id } = req.body;

    if (!plan_id) {
        return res
            .status(HTTP_BAD_REQUEST)
            .json({ error: 'Missing required fields' });
    }

    try {
        const users = await sequelize.query(
            `SELECT u.* from user u
            JOIN user_plan up on up.user_id = u.user_id
            JOIN plan p on up.plan_id = p.user_id
            where p.user_id = ${plan_id};`,
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
            .json({ error: 'Failed to fetch users' });
    }
});

router.post('/update-profile', async (req, res) => {
    const { user_id, name, email, phone } = req.body;

    if (!user_id || !name || !email || !phone) {
        return res
            .status(HTTP_BAD_REQUEST)
            .json({ error: 'Missing required fields' });
    }

    try {
        const n = await User.update(
            { name, email, phone },
            {
                where: { user_id: user_id },
            }
        );

        if (n.length > 0 && n[0] !== 1) {
            return res
                .status(HTTP_BAD_REQUEST)
                .json({ error: 'User does not exist' });
        }

        const user = await User.findByPk(user_id, {
            include: [
                { model: Institute, attributes: ['name'] },
                { model: Role, attributes: ['name'] },
            ],
        });

        if (!user) {
            return res
                .status(HTTP_BAD_REQUEST)
                .json({ error: 'User does not exist' });
        }

        const plan = await UserPlan.findOne({
            include: [{ model: User, where: { user_id: user.user_id } }],
        });

        return res
            .status(HTTP_OK)
            .json({ message: 'updated successfully', user, plan });
    } catch (error) {
        console.error(error);
        return res
            .status(HTTP_INTERNAL_SERVER_ERROR)
            .json({ error: 'Failed to update user' });
    }
});

router.post('/update-password', async (req, res) => {
    const { user_id, new_password, confirm_new_password } = req.body;

    if (!user_id || !new_password || !confirm_new_password) {
        return res
            .status(HTTP_BAD_REQUEST)
            .json({ error: 'Missing required fields' });
    }

    if (new_password !== confirm_new_password) {
        return res
            .status(HTTP_BAD_REQUEST)
            .json({ error: 'Passwords do not match' });
    }

    try {
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
                .json({ error: 'User does not exist' });
        }

        return res.status(HTTP_OK).json({ message: 'updated successfully' });
    } catch (error) {
        console.error(error);
        return res
            .status(HTTP_INTERNAL_SERVER_ERROR)
            .json({ error: 'Failed to update user' });
    }
});

router.delete('/delete-by-id', async (req, res) => {
    const { user_id } = req.body;

    if (!user_id) {
        return res
            .status(HTTP_BAD_REQUEST)
            .json({ error: 'Missing required fields' });
    }

    try {
        const n = await User.destroy({ where: { user_id: user_id } });

        if (n !== 1) {
            return res
                .status(HTTP_BAD_REQUEST)
                .json({ error: 'User does not exist' });
        }

        return res
            .status(HTTP_OK)
            .json({ message: 'deleted user successfully' });
    } catch (error) {
        console.error(error);
        return res
            .status(HTTP_INTERNAL_SERVER_ERROR)
            .json({ error: 'Failed to fetch user' });
    }
});

module.exports = router;

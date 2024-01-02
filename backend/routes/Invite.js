const express = require('express');

const {
    HTTP_BAD_REQUEST,
    HTTP_OK,
    HTTP_INTERNAL_SERVER_ERROR,
    HTTP_SERVICE_UNAVAILABLE,
} = require('../utils/http_status_codes');

const { Invite } = require('../models/sql/Invite');

const { sequelize } = require('../init.sequelize');
const { User } = require('../models/sql/User');
const { Role } = require('../models/sql/Role');
const invite_token = require('../utils/invite_token');
// const { Op } = require('sequelize');

const router = express.Router();

router.post('/get-by-id', async (req, res) => {
    const { invite_id } = req.body;

    if (!invite_id) {
        return res.status(HTTP_BAD_REQUEST).json({
            message: 'Missing required fields',
        });
    }

    try {
        const invite = await Invite.findOne({
            where: { invite_id },
        });

        if (!invite) {
            return res.status(HTTP_BAD_REQUEST).json({
                message: 'Invalid invite_id',
            });
        }

        return res.status(HTTP_OK).json({
            invite,
        });
    } catch (err) {
        console.log(err);
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error',
        });
    }
});

router.post('/get-by-token', async (req, res) => {
    return res.status(HTTP_SERVICE_UNAVAILABLE).json({
        message: 'Not implemented',
    });
});

router.post('/create', async (req, res) => {
    const { user_id, name, email, phone, invite_type } = req.body;

    if (!user_id || !email || !invite_type || !name || !phone) {
        return res.status(HTTP_BAD_REQUEST).json({
            message: 'Missing required fields',
        });
    }

    const t = await sequelize.transaction();
    try {
        // get role id
        const role = await Role.findOne(
            {
                where: { name: 'TEACHER' },
            },
            { transaction: t }
        );

        if (!role) {
            await t.rollback();
            return res.status(HTTP_BAD_REQUEST).json({
                message: 'Role not found',
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
                message: 'Teacher already exists with the given email',
            });
        }

        // create a token
        const token = invite_token.enc_token(email, phone, email);

        // create an invite
        // send an email
    } catch (err) {
        console.log(err);
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error',
        });
    }
});

router.post('/accept', async (req, res) => {
    const { invite_id, confirm_email } = req.body;

    if (!invite_id || !confirm_email) {
        return res.status(HTTP_BAD_REQUEST).json({
            message: 'Missing required fields',
        });
    }

    const t = await sequelize.transaction();
    try {
        // get invite
        const invite = await Invite.findOne({
            where: { invite_id },
        });

        if (!invite) {
            await t.rollback();
            return res.status(HTTP_BAD_REQUEST).json({
                message: 'Invite not found',
            });
        }

        // check if email matches
        if (invite.email !== confirm_email) {
            await t.rollback();
            return res.status(HTTP_BAD_REQUEST).json({
                message: 'Invalid email',
            });
        }

        // check expiry
        if (invite.expiry_date < new Date()) {
            await t.rollback();
            return res.status(HTTP_BAD_REQUEST).json({
                message: 'Invite expired',
            });
        }

        if (invite.is_accepted === true) {
            await t.rollback();
            return res.status(HTTP_BAD_REQUEST).json({
                message: 'Invite already accepted',
            });
        }

        // accept
        const n = await Invite.update(
            {
                is_accepted: true,
            },
            {
                where: {
                    invite_id: invite_id,
                },
                transaction: t,
            }
        );

        await t.commit();
        return res.status(HTTP_OK).json({
            message: 'Successfully accepted',
        });
    } catch (err) {
        await t.rollback();
        console.log(err);
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error',
        });
    }
});

router.post('/reject', async (req, res) => {
    const { invite_id, confirm_email } = req.body;

    if (!invite_id || !confirm_email) {
        return res.status(HTTP_BAD_REQUEST).json({
            message: 'Missing required fields',
        });
    }

    const t = await sequelize.transaction();
    try {
        // get invite
        const invite = await Invite.findOne({
            where: { invite_id },
        });

        if (!invite) {
            await t.rollback();
            return res.status(HTTP_BAD_REQUEST).json({
                message: 'Invite not found',
            });
        }

        // check if email matches
        if (invite.email !== confirm_email) {
            await t.rollback();
            return res.status(HTTP_BAD_REQUEST).json({
                message: 'Invalid email',
            });
        }

        // check expiry
        if (invite.expiry_date < new Date()) {
            await t.rollback();
            return res.status(HTTP_BAD_REQUEST).json({
                message: 'Invite expired',
            });
        }

        if (invite.is_accepted === true) {
            await t.rollback();
            return res.status(HTTP_BAD_REQUEST).json({
                message: 'Invite already accepted',
            });
        }

        // reject
        const n = await Invite.update(
            {
                is_accepted: false,
            },
            {
                where: {
                    invite_id: invite_id,
                },
                transaction: t,
            }
        );

        await t.commit();
        return res.status(HTTP_OK).json({
            message: 'Successfully rejected',
        });
    } catch (err) {
        await t.rollback();
        console.log(err);
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error',
        });
    }
});

router.post('/resend', async (req, res) => {
    const { invite_id } = req.body;

    if (!invite_id) {
        return res.status(HTTP_BAD_REQUEST).json({
            message: 'Missing required fields',
        });
    }

    try {
        const invite = await Invite.findOne({
            where: { invite_id },
        });

        if (!invite) {
            return res.status(HTTP_BAD_REQUEST).json({
                message: 'Invalid invite_id',
            });
        }

        // resend mail
    } catch (err) {
        console.log(err);
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error',
        });
    }
});

router.delete('/delete-by-id', async (req, res) => {});

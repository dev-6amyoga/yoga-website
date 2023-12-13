const express = require('express');
const {
    HTTP_BAD_REQUEST,
    HTTP_OK,
    HTTP_INTERNAL_SERVER_ERROR,
} = require('../utils/http_status_codes');
const { Currency } = require('../models/sql/Currency');
const { sequelize } = require('../init.sequelize');
const { ReferralCode } = require('../models/sql/ReferralCode');

const router = express.Router();

router.post('/get-by-userid', async (req, res) => {
    const { user_id } = req.body;

    if (!user_id)
        return res
            .status(HTTP_BAD_REQUEST)
            .json({ error: 'Missing required fields' });

    try {
        const referral_code = await ReferralCode.findOne({
            where: { user_id },
        });

        return res.status(HTTP_OK).json({ referral_code });
    } catch (error) {
        console.error('Error fetching referral code:', error);
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            error: 'Error fetching referral code',
        });
    }
});

router.post('/generate-for-userid', async (req, res) => {
    const { user_id } = req.body;

    if (!user_id)
        return res
            .status(HTTP_BAD_REQUEST)
            .json({ error: 'Missing required fields' });

    const t = await sequelize.transaction();
    try {
        let created = false;
        let newCode = null;
        let n = 5;

        while (!created && newCode === null && n > 0) {
            [newCode, created] = await ReferralCode.findOrCreate({
                where: { user_id },
                defaults: { code: Math.random().toString(36).slice() },
                transaction: t,
            });

            --n;
        }

        if (!created) {
            await t.rollback();
            return res
                .status(HTTP_BAD_REQUEST)
                .json({ error: 'Referral code already exists' });
        }

        await t.commit();
        return res.status(HTTP_OK).json({ referral_code: newCode });
    } catch (error) {
        console.error('Error creating new referral code:', error);
        await t.rollback();
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            error: 'Error creating new referral code',
        });
    }
});

module.exports = router;

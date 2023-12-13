const express = require('express');
const {
    HTTP_BAD_REQUEST,
    HTTP_OK,
    HTTP_INTERNAL_SERVER_ERROR,
} = require('../utils/http_status_codes');
const { Currency } = require('../models/sql/Currency');
const { sequelize } = require('../init.sequelize');

const router = express.Router();

router.get('/get-all', async (req, res) => {
    try {
        const currencies = await Currency.findAll();
        res.status(HTTP_OK).json({ currencies });
    } catch (error) {
        console.error('Error fetching currencies:', error);
        res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            error: 'Error fetching currencies',
        });
    }
});

router.post('/register', async (req, res) => {
    const { short_tag } = req.body;
    // console.log(short_tag);

    if (!short_tag)
        return res
            .status(HTTP_BAD_REQUEST)
            .json({ error: 'Missing required fields' });

    const t = await sequelize.transaction();
    try {
        const [newC, created] = await Currency.findOrCreate({
            where: { short_tag },
            transaction: t,
        });
        // console.log({ ok });

        if (!created) {
            await t.rollback();
            return res
                .status(HTTP_BAD_REQUEST)
                .json({ error: 'Currency already exists' });
        }

        await t.commit();
        return res.status(HTTP_OK).json({ currency: newC });
    } catch (error) {
        console.error('Error creating new currency:', error);
        await t.rollback();
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            error: 'Error creating new currency',
        });
    }
});

router.delete('/delete-by-id', async (req, res) => {
    const { currency_id } = req.body;
    if (!currency_id) {
        return res
            .status(HTTP_BAD_REQUEST)
            .json({ error: 'Missing required fields' });
    }

    const t = await sequelize.transaction();
    try {
        const deletedCurrency = await Currency.destroy(
            { where: { currency_id: currency_id } },
            { transaction: t }
        );

        if (deletedCurrency) {
            await t.commit();
            return res.status(HTTP_OK).json({
                message: 'Currency deleted successfully',
            });
        } else {
            await t.rollback();

            return res.status(HTTP_BAD_REQUEST).json({
                message: 'Currency not found',
            });
        }
    } catch (error) {
        console.error(error);
        await t.rollback();
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            error: 'Failed to delete currency',
        });
    }
});

router.delete('/delete-by-tag', async (req, res) => {
    const { short_tag } = req.body;

    if (!short_tag) {
        return res
            .status(HTTP_BAD_REQUEST)
            .json({ error: 'Missing required fields' });
    }

    const t = await sequelize.transaction();
    try {
        const deletedCurrency = await Currency.destroy(
            { where: { short_tag: short_tag } },
            { transaction: t }
        );

        if (deletedCurrency) {
            await t.commit();
            return res.status(HTTP_OK).json({
                message: 'Currency deleted successfully',
            });
        } else {
            await t.rollback();

            return res.status(HTTP_BAD_REQUEST).json({
                message: 'Currency not found',
            });
        }
    } catch (error) {
        console.error(error);
        await t.rollback();
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            error: 'Failed to delete currency',
        });
    }
});

module.exports = router;

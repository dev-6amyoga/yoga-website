const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { sequelize } = require("../init.sequelize");
const { timeout } = require("../utils/promise_timeout");
const {
    HTTP_BAD_REQUEST,
    HTTP_OK,
    HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");
const { Plan } = require("../models/sql/Plan");
const { PlanPricing } = require("../models/sql/PlanPricing");
const { Currency } = require("../models/sql/Currency");

router.get("/get-all", async (req, res) => {
    try {
        let plans = await Plan.findAll({});

        const plan_pricing = await PlanPricing.findAll({
            where: {
                plan_id: {
                    [Op.in]: plans.map((p) => p.toJSON().plan_id),
                },
            },
            attributes: [
                "plan_pricing_id",
                "denomination",
                "currency_id",
                "plan_id",
            ],
            include: [{ model: Currency, attributes: ["name", "short_tag"] }],
        });

        plans = plans.map((p) => {
            return {
                ...p.toJSON(),
                pricing: plan_pricing.filter((pp) => pp.plan_id === p.plan_id),
            };
        });

        res.status(HTTP_OK).json({ plans });
    } catch (error) {
        console.error("Error fetching plans:", error);
        res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error",
        });
    }
});

router.post("/get-plan-by-id", async (req, res) => {
    const { plan_id } = req.body;
    if (!plan_id) {
        return res
            .status(HTTP_BAD_REQUEST)
            .json({ error: "Missing required fields" });
    }
    try {
        let plan = await Plan.findOne({
            where: {
                plan_id: plan_id,
            },
        });

        const plan_pricing = await PlanPricing.findAll({
            where: {
                plan_id: plan.plan_id,
            },
            attributes: [
                "plan_pricing_id",
                "denomination",
                "currency_id",
                "plan_id",
            ],
            include: [{ model: Currency, attributes: ["name", "short_tag"] }],
        });

        plan = {
            ...plan.toJSON(),
            pricing: plan_pricing,
        };

        if (!plan) {
            return res
                .status(HTTP_BAD_REQUEST)
                .json({ error: "Plan does not exist" });
        }
        return res.status(HTTP_OK).json({ plan });
    } catch (error) {
        console.error(error);
        return res
            .status(HTTP_INTERNAL_SERVER_ERROR)
            .json({ error: "Failed to fetch plan" });
    }
});

router.get("/get-all-student-plans", async (req, res) => {
    try {
        let plans = await Plan.findAll({
            where: {
                plan_user_type: "student",
            },
        });

        const plan_pricing = await PlanPricing.findAll({
            where: {
                plan_id: {
                    [Op.in]: plans.map((p) => p.toJSON().plan_id),
                },
            },
            attributes: [
                "plan_pricing_id",
                "denomination",
                "currency_id",
                "plan_id",
            ],
            include: [{ model: Currency, attributes: ["name", "short_tag"] }],
        });

        plans = plans.map((p) => {
            return {
                ...p.toJSON(),
                pricing: plan_pricing.filter((pp) => pp.plan_id === p.plan_id),
            };
        });

        return res.status(HTTP_OK).json({ plans });
    } catch (error) {
        console.error("Error fetching plans:", error);
        return res
            .status(HTTP_INTERNAL_SERVER_ERROR)
            .json({ error: "Internal Server Error" });
    }
});

router.get("/get-all-institute-plans", async (req, res) => {
    try {
        let plans = await Plan.findAll({
            where: {
                plan_user_type: "institute",
            },
        });

        const plan_pricing = await PlanPricing.findAll({
            where: {
                plan_id: {
                    [Op.in]: plans.map((p) => p.toJSON().plan_id),
                },
            },
            attributes: [
                "plan_pricing_id",
                "denomination",
                "currency_id",
                "plan_id",
            ],
            include: [{ model: Currency, attributes: ["name", "short_tag"] }],
        });

        plans = plans.map((p) => {
            return {
                ...p.toJSON(),
                pricing: plan_pricing.filter((pp) => pp.plan_id === p.plan_id),
            };
        });
        return res.status(HTTP_OK).json({ plans });
    } catch (error) {
        console.error("Error fetching plans:", error);
        return res
            .status(HTTP_INTERNAL_SERVER_ERROR)
            .json({ error: "Internal Server Error" });
    }
});

router.post("/register", async (req, res) => {
    const {
        name,
        has_basic_playlist,
        playlist_creation_limit,
        number_of_teachers,
        has_self_audio_upload,
        has_playlist_creation,
        plan_user_type,
        plan_validity,
    } = req.body;
    // validate inputs
    if (!name || !plan_user_type)
        return res
            .status(HTTP_BAD_REQUEST)
            .json({ error: "Missing required fields" });

    const plan = await Plan.findOne({
        where: {
            [Op.and]: [
                { name: name },
                { has_basic_playlist: has_basic_playlist ? true : false },
                { has_playlist_creation: has_playlist_creation ? true : false },
                // { has_playlist_creation: has_playlist_creation },
                { playlist_creation_limit: playlist_creation_limit },
                { number_of_teachers: number_of_teachers },
                { has_self_audio_upload: has_self_audio_upload ? true : false },
                { plan_user_type: plan_user_type },
                { plan_validity: plan_validity },
            ],
        },
        attributes: ["name", "has_basic_playlist"],
    });
    if (plan)
        return res
            .status(HTTP_BAD_REQUEST)
            .json({ error: "Plan already exists" });

    // db transaction
    const t = await sequelize.transaction();
    try {
        const newPlan = await Plan.create(
            {
                name: name,
                has_basic_playlist: has_basic_playlist,
                has_playlist_creation: has_playlist_creation,
                playlist_creation_limit: playlist_creation_limit,
                number_of_teachers: number_of_teachers,
                has_self_audio_upload: has_self_audio_upload,
                plan_user_type: plan_user_type,
                plan_validity: plan_validity,
            },
            { transaction: t }
        );
        await timeout(t.commit(), 5000, new Error("timeout; try again"));

        res.status(HTTP_OK).json({ plan: newPlan });
    } catch (error) {
        console.error(error);
        await t.rollback();
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            error: error.message,
        });
    }
});

router.put("/update-plan/:plan_id", async (req, res) => {
    const { plan_id } = req.params;
    const {
        name,
        has_basic_playlist,
        playlist_creation_limit,
        number_of_teachers,
        has_self_audio_upload,
        has_playlist_creation,
        plan_user_type,
        plan_validity,
    } = req.body;

    // Validate inputs
    if (!plan_id || !name || !plan_user_type) {
        return res
            .status(HTTP_BAD_REQUEST)
            .json({ error: "Missing required fields" });
    }

    const existingPlan = await Plan.findOne({
        where: {
            plan_id: plan_id,
        },
    });

    if (!existingPlan) {
        return res
            .status(HTTP_BAD_REQUEST)
            .json({ error: "Plan does not exist" });
    }

    // Update plan properties
    existingPlan.name = name;
    existingPlan.has_basic_playlist = has_basic_playlist;
    existingPlan.playlist_creation_limit = playlist_creation_limit;
    existingPlan.number_of_teachers = number_of_teachers;
    existingPlan.has_self_audio_upload = has_self_audio_upload;
    existingPlan.has_playlist_creation = has_playlist_creation;
    existingPlan.plan_user_type = plan_user_type;
    existingPlan.plan_validity = plan_validity;

    // Save the changes to the database
    const t = await sequelize.transaction();
    try {
        await existingPlan.save({ transaction: t });
        await timeout(t.commit(), 5000, new Error("timeout; try again"));

        res.status(HTTP_OK).json({ plan: existingPlan });
    } catch (error) {
        console.error(error);
        await t.rollback();
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            error: error.message,
        });
    }
});

router.delete("/deletePlan/:plan_id", async (req, res) => {
    const { plan_id } = req.params;

    if (!plan_id) {
        return res
            .status(HTTP_BAD_REQUEST)
            .json({ error: "Missing required fields" });
    }

    const existingPlan = await Plan.findOne({
        where: {
            plan_id: plan_id,
        },
    });

    if (!existingPlan) {
        return res
            .status(HTTP_BAD_REQUEST)
            .json({ error: "Plan does not exist" });
    }

    // Delete the plan from the database
    const t = await sequelize.transaction();
    try {
        await existingPlan.destroy({ transaction: t });
        await timeout(t.commit(), 5000, new Error("timeout; try again"));

        res.status(HTTP_OK).json({ message: "Plan deleted successfully" });
    } catch (error) {
        console.error(error);
        await t.rollback();
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            error: error.message,
        });
    }
});

router.post("/add-pricing", async (req, res) => {});

router.post("/update-pricing", async (req, res) => {});

router.post("/remove-pricing", async (req, res) => {});

module.exports = router;

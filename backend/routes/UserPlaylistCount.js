const express = require("express");
const router = express.Router();
const UserPlaylistCount = require("../models/mongo/UserPlaylistCount");
const {
    HTTP_BAD_REQUEST,
    HTTP_INTERNAL_SERVER_ERROR,
    HTTP_OK,
    HTTP_NOT_FOUND,
} = require("../utils/http_status_codes");

router.get("/getAllUserPlaylistCounts", async (req, res) => {
    try {
        const userPlaylistCounts = await UserPlaylistCount.find();
        res.json(userPlaylistCounts);
    } catch (error) {
        console.error(error);
        res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            error: "Failed to fetch counts",
        });
    }
});

router.post("/addUserPlaylistCount", async (req, res) => {
    try {
        const requestData = req.body;
        const newUserPlaylistCount = new UserPlaylistCount(requestData);
        const savedUserPlaylistCount = await newUserPlaylistCount.save();
        res.status(201).json(savedUserPlaylistCount);
    } catch (error) {
        console.error("Error saving new UserPlaylistCount:", error);
        res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            error: "Failed to save new UserPlaylistCount",
        });
    }
});

router.put("/updateUserPlaylistCount/:user_id", async (req, res) => {
    const user_id = req.params.user_id;
    const updatedData = req.body;
    try {
        const existingUserPlaylistCount = await UserPlaylistCount.findOne({
            user_id: user_id,
        });
        if (!existingUserPlaylistCount) {
            return res.status(HTTP_NOT_FOUND).json({ error: "Not found" });
        }
        const mergedData = {
            ...existingUserPlaylistCount.toObject(),
            ...updatedData,
        };
        const updatedUserPlaylistCount =
            await UserPlaylistCount.findOneAndUpdate(
                { user_id: user_id },
                mergedData,
                {
                    new: true,
                }
            );
        res.json(updatedUserPlaylistCount);
    } catch (error) {
        console.error(error);
        res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            error: "Failed to update",
        });
    }
});
module.exports = router;

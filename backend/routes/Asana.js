const express = require("express");
const router = express.Router();
const Asana = require("../models/mongo/Asana");
const Language = require("../models/mongo/Language");
const TransitionVideo = require("../models/mongo/TransitionVideo");
const AsanaCategory = require("../models/mongo/AsanaCategory");
const {
  HTTP_OK,
  HTTP_NOT_FOUND,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");

router.post("/video/addAsana", async (req, res) => {
  try {
    const requestData = req.body;
    const maxIdAsana = await Asana.findOne().sort({ id: -1 }).limit(1);
    let newId;
    if (maxIdAsana) {
      newId = maxIdAsana.id + 1;
    } else {
      newId = 1;
    }
    requestData.id = newId;
    const newAsana = new Asana(requestData);
    const savedAsana = await newAsana.save();
    res.status(200).json(savedAsana);
  } catch (error) {
    console.error("Error saving new Asana:", error);
    res.status(500).json({
      error: "Failed to save new Asana",
    });
  }
});

router.post("/video/addTransition", async (req, res) => {
  try {
    const requestData = req.body;
    const maxIdAsana = await TransitionVideo.findOne()
      .sort({ transition_id: -1 })
      .limit(1);
    console.log("maxIdAsana:", maxIdAsana);
    let newId;
    if (maxIdAsana) {
      const numericPart = parseInt(maxIdAsana.transition_id.split("_")[1]);
      const nextNumericPart = numericPart + 1;
      newId = "T_" + nextNumericPart;
    } else {
      newId = "T_1";
    }
    console.log("newId:", newId);
    requestData.transition_id = newId;
    const newAsana = new TransitionVideo(requestData);
    const savedAsana = await newAsana.save();
    res.status(200).json(savedAsana);
  } catch (error) {
    console.error("Error saving new video:", error);
    res.status(500).json({
      error: "Failed to save new video",
    });
  }
});

router.get("/video/getAllTransitions", async (req, res) => {
  try {
    const asanas = await TransitionVideo.find();
    res.json(asanas);
  } catch (error) {
    console.error(error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to fetch videos",
    });
  }
});

router.post("/get-transition-by-id", async (req, res) => {
  const asana_id = req.body.asana_id;
  try {
    const asanas = await TransitionVideo.findOne({
      transition_id: asana_id,
    });
    res.json(asanas);
  } catch (error) {
    console.error(error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to fetch video details",
    });
  }
});
router.delete("/video/deleteTransition/:id", async (req, res) => {
  const transitionID = req.params.id;
  try {
    const del1 = await TransitionVideo.findOneAndDelete({
      transition_id: transitionID,
    });
    if (del1) {
      res.status(HTTP_OK).json({ message: "Transition deleted successfully" });
    } else {
      res.status(HTTP_NOT_FOUND).json({ message: "Transition not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to delete Transition",
    });
  }
});

router.put("/video/updateAsana/:asanaId", async (req, res) => {
  const asanaId = req.params.asanaId;
  const updatedData = req.body;
  try {
    const existingAsana = await Asana.findOne({ id: asanaId });
    if (!existingAsana) {
      return res.status(HTTP_NOT_FOUND).json({ error: "Asana not found" });
    }
    const mergedData = { ...existingAsana.toObject(), ...updatedData };
    const updatedAsana = await Asana.findOneAndUpdate(
      { id: asanaId },
      mergedData,
      {
        new: true,
      }
    );
    res.json(updatedAsana);
  } catch (error) {
    console.error(error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to update Asana",
    });
  }
});

router.delete("/video/deleteAsana/:asanaId", async (req, res) => {
  const asanaId = req.params.asanaId;
  try {
    const deletedAsana = await Asana.findOneAndDelete({ id: asanaId });
    if (deletedAsana) {
      res.status(HTTP_OK).json({ message: "Asana deleted successfully" });
    } else {
      res.status(HTTP_NOT_FOUND).json({ message: "Asana not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to delete asana",
    });
  }
});

router.get("/video/getAllAsanas", async (req, res) => {
  try {
    const asanas = await Asana.find();
    res.json(asanas);
  } catch (error) {
    console.error(error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to fetch videos",
    });
  }
});

router.post("/get-asana-by-id", async (req, res) => {
  const asana_id = req.body.asana_id;
  try {
    const asanas = await Asana.findOne({ id: asana_id });
    res.json(asanas);
  } catch (error) {
    console.error(error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to fetch video details",
    });
  }
});

router.get("/language/getAllLanguages", async (req, res) => {
  try {
    const languages = await Language.find();
    res.json(languages);
  } catch (error) {
    console.error(error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to fetch languages",
    });
  }
});

router.post("/language/addLanguage", async (req, res) => {
  try {
    const requestData = req.body;
    const maxLangID = await Language.findOne(
      {},
      {},
      { sort: { language_id: -1 } }
    );
    const newLangID = maxLangID ? maxLangID.language_id + 1 : 1;
    requestData.language_id = newLangID;
    const newLanguage = new Language(requestData);
    const savedLanguage = await newLanguage.save();
    res.status(201).json(savedLanguage);
  } catch (err) {
    console.error("Error saving new Language:", error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to save new Language",
    });
  }
});

router.delete("/video/deleteLanguage/:languageId", async (req, res) => {
  const languageId = req.params.languageId;
  try {
    const deletedLanguage = await Language.findOneAndDelete({
      language_id: languageId,
    });
    if (deletedLanguage) {
      res.status(HTTP).json({ message: "Language deleted successfully" });
    } else {
      res.status(HTTP_NOT_FOUND).json({ message: "Language not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to delete Language",
    });
  }
});

router.get("/asana/getAllAsanaCategories", async (req, res) => {
  try {
    const cats = await AsanaCategory.find();
    res.status(200).json(cats);
  } catch (error) {
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to fetch categories",
    });
  }
});

router.post("/asana/addAsanaCategory", async (req, res) => {
  try {
    const requestData = req.body;
    const maxId = await AsanaCategory.findOne(
      {},
      {},
      { sort: { asana_category_id: -1 } }
    );
    const newId = maxId ? maxId.asana_category_id + 1 : 1;
    requestData.asana_category_id = newId;
    const new1 = new AsanaCategory(requestData);
    const saved = await new1.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error saving new Asana Category:", error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to save new Asana Category",
    });
  }
});

router.delete("/asana/deleteAsanaCategory/:catId", async (req, res) => {
  const catId = req.params.catId;
  try {
    const deleted = await AsanaCategory.findOneAndDelete({
      asana_category_id: catId,
    });
    if (deleted) {
      res.status(200).json({ message: "Asana Category deleted successfully" });
    } else {
      res.status(HTTP_NOT_FOUND).json({ message: "Asana Category not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to delete Asana Category",
    });
  }
});
module.exports = router;

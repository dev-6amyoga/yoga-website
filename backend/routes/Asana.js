const express = require('express');
const router = express.Router();
const Asana = require('../models/Asana');
const Language = require('../models/Language');

router.post('/content/video/addAsana', async (req, res) => {
    try {
        const requestData = req.body;
        const newAsana = new Asana(requestData);
        const savedAsana = await newAsana.save();
        res.status(201).json(savedAsana);
    } catch (error) {
        console.error('Error saving new Asana:', error);
        res.status(500).json({ error: 'Failed to save new Asana' });
    }
});

router.put('/content/video/updateAsana/:asanaId', async (req, res) => {
    const asanaId = req.params.asanaId;
    const updatedData = req.body;
    try {
        const existingAsana = await Asana.findOne({ id: asanaId });
        if (!existingAsana) {
            return res.status(404).json({ error: 'Asana not found' });
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
        res.status(500).json({ error: 'Failed to update Asana' });
    }
});

router.delete('/content/video/deleteAsana/:asanaId', async (req, res) => {
    const asanaId = req.params.asanaId;
    try {
        const deletedAsana = await Asana.findOneAndDelete({ id: asanaId });
        if (deletedAsana) {
            res.status(200).json({ message: 'Asana deleted successfully' });
        } else {
            res.status(404).json({ message: 'Asana not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete asana' });
    }
});

router.get('/content/video/getAllAsanas', async (req, res) => {
    try {
        const asanas = await Asana.find();
        console.log(asanas);
        res.json(asanas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
});

router.get('/content/language/getAllLanguages', async (req, res) => {
    try {
        const languages = await Language.find();
        console.log(languages);
        res.json(languages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch languages' });
    }
});

router.post('/content/language/addLanguage', async (req, res) => {
    try {
        const requestData = req.body;
        const maxLangID = await Language.findOne(
            {},
            {},
            { sort: { language_id: -1 } }
        );
        const newLangID = maxLangID ? maxLangID.language_id + 1 : 1;
        console.log(newLangID, maxLangID);
        requestData.language_id = newLangID;
        const newLanguage = new Language(requestData);
        const savedLanguage = await newLanguage.save();
        res.status(201).json(savedLanguage);
    } catch (error) {
        console.error('Error saving new Language:', error);
        res.status(500).json({ error: 'Failed to save new Language' });
    }
});

router.delete('/content/video/deleteLanguage/:languageId', async (req, res) => {
    const languageId = req.params.languageId;
    try {
        const deletedLanguage = await Language.findOneAndDelete({
            language_id: languageId,
        });
        if (deletedLanguage) {
            res.status(200).json({ message: 'Language deleted successfully' });
        } else {
            res.status(404).json({ message: 'Language not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete Language' });
    }
});
module.exports = router;

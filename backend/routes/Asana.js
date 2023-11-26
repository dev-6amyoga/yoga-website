const express = require('express');
const router = express.Router();
const Asana = require('../models/Asana');

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

module.exports = router;

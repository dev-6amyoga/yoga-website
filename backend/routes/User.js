const express = require('express');
const router = express.Router();
const User = require('../models/User');

////////////////////////////////////////////////////////////////////////////////////

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

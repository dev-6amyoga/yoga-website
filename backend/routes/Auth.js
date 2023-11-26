const express = require('express');
const router = express.Router();

router.post('/verify', async (req, res) => {
    console.log(req.body);
    const { client_id, jwtToken } = req.body;
    try {
        const userInfo = await auth.verify(client_id, jwtToken);
        res.json(userInfo);
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(401).json({ error: 'Authentication failed' });
    }
});

module.exports = router;

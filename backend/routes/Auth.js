const express = require('express');
const router = express.Router();

const auth = require('../oauth');
const { HTTP_OK } = require('../utils/http_status_codes');

router.post('/verify', async (req, res) => {
    console.log(req.body);
    const { client_id, jwtToken } = req.body;
    try {
        // console.log('trying to verify');
        const userInfo = await auth.verify(client_id, jwtToken);
        // console.log('verified');
        // console.log(userInfo);
        return res.status(HTTP_OK).json(userInfo);
    } catch (error) {
        console.error('Authentication error:', error.message);
        return res.status(401).json({ error: 'Authentication failed' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { getUserPreferences, updateUserPreferences } = require('../services/database');

// GET /users/{username}/options
router.get('/:username/options', async (req, res) => {
    try {
        const { username } = req.params;
        
        // Check if Authorization header exists
        if (!req.headers.authorization) {
            return res.status(401).json({ message: 'no valid token' });
        }

        const preferences = await getUserPreferences(username);
        
        if (!preferences) {
            return res.status(404).json({ message: 'username not found' });
        }

        res.json({
            "ufos": preferences.ufos,
            "disposedTime": preferences.time
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'internal server error' });
    }
});

// PATCH /users/{username}/options
router.patch('/:username/options', async (req, res) => {
    try {
        const { username } = req.params;
        const { numufos, time } = req.body;

        // Check if Authorization header exists
        if (!req.headers.authorization) {
            return res.status(401).json({ message: 'no valid token' });
        }

        // Validate required parameters
        if (!numufos || !time) {
            return res.status(400).json({ message: 'no mandatory parameters provided' });
        }

        const success = await updateUserPreferences(username, numufos, time);
        
        if (success) {
            res.status(201).json({ message: 'successful operation. NO CONTENT' });
        } else {
            res.status(404).json({ message: 'username not found' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'internal server error' });
    }
});

module.exports = router;
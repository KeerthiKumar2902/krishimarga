//server/routes/locations.js

const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

// @route   GET /api/locations/states
// @desc    Get list of all available States
router.get('/states', async (req, res) => {
    try {
        // We only need the state names
        const states = await Location.distinct('state');
        res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
        res.json(states.sort());
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/locations/districts/:state
// @desc    Get Districts and Markets for a specific State
router.get('/districts/:state', async (req, res) => {
    try {
        const { state } = req.params;
        const locationDoc = await Location.findOne({ state: state });
        
        if (!locationDoc) {
            return res.status(404).json({ msg: "State not found" });
        }

        res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        res.json(locationDoc.districts);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
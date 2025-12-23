const express = require('express');
const router = express.Router();

// FIX: Ensure this matches the filename in server/models/ EXACTLY.
// If your file is 'Commodity.js', use 'Commodity'. 
// If it is 'commodity.js', use 'commodity'.
const Commodity = require('../models/Commodity');

// @route   GET /api/commodities
// @desc    Get all commodities
router.get('/', async (req, res) => {
    try {
        const list = await Commodity.find().sort({ name: 1 });
        res.json(list);
    } catch (err) {
        console.error("❌ Commodity Route Error:", err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
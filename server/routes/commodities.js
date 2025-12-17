const express = require('express');
const router = express.Router();
const Commodity = require('../models/Commodity');

// @route   GET /api/commodities
// @desc    Get all commodities from the Master List
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Fetch all commodities and sort them Alphabetically (A-Z)
        const list = await Commodity.find().sort({ name: 1 });
        
        res.json(list);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
//server/routes/prices.js
const express = require('express');
const router = express.Router();
const Price = require('../models/Price'); // Correctly import the Price model

// @route   GET /api/prices
// @desc    Get prices with filters (State, District, Commodity, Date Range)
router.get('/', async (req, res) => {
    try {
        const { state, district, market, commodity, variety, from, to, limit } = req.query;

        let query = {};

        // 1. Text Filters (Case Insensitive)
        if (state) query.state = { $regex: state, $options: 'i' };
        if (district) query.district = { $regex: district, $options: 'i' };
        if (market) query.market = { $regex: market, $options: 'i' };
        if (commodity) query.commodity = { $regex: commodity, $options: 'i' };
        // Variety filter is crucial for the new Details page logic
        if (variety) query.variety = { $regex: variety, $options: 'i' };

        // 2. Date Range Filter
        if (from || to) {
            query.arrival_date = {};
            if (from) query.arrival_date.$gte = new Date(from);
            if (to) query.arrival_date.$lte = new Date(to);
        }

        // 3. Sorting & Limiting
        const limitNum = limit ? parseInt(limit) : 100;

        const prices = await Price.find(query)
            .sort({ arrival_date: -1 }) // Newest first
            .limit(limitNum);

        res.json({
            count: prices.length,
            data: prices
        });

    } catch (err) {
        console.error("❌ Price Route Error:", err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/prices/options/districts
// @desc    Get unique districts
router.get('/options/districts', async (req, res) => {
    try {
        const districts = await Price.distinct('district');
        res.json(districts.sort());
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/prices/options/commodities
// @desc    Get unique commodities (filtered by district)
router.get('/options/commodities', async (req, res) => {
    try {
        const { district } = req.query;
        let query = {};
        if (district) query.district = { $regex: district, $options: 'i' };
        
        const commodities = await Price.distinct('commodity', query);
        res.json(commodities.sort());
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;

// @route   GET /api/prices/options/varieties
// @desc    Get varieties for a specific commodity + district
router.get('/options/varieties', async (req, res) => {
    try {
        const { district, commodity } = req.query;
        let query = {};
        
        if (district) query.district = { $regex: district, $options: 'i' };
        if (commodity) query.commodity = { $regex: commodity, $options: 'i' };
        
        const varieties = await Price.distinct('variety', query);
        res.json(varieties.sort());
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
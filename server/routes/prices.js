const express = require('express');
const router = express.Router();
const Price = require('../models/Price');

// @route   GET /api/prices
// @desc    Get all prices or filter by state/district/commodity
// @access  Public
router.get('/', async (req, res) => {
    try {
        // 1. Read the "Query Parameters" from the URL
        // Example: /api/prices?district=Shimoga&commodity=Arecanut
        const { state, district, market, commodity } = req.query;

        // 2. Build the Database Query Object
        let query = {};

        // If the user sent a filter, add it to the query
        // We use regex for "fuzzy" matching (case-insensitive)
        if (state) query.state = { $regex: state, $options: 'i' };
        if (district) query.district = { $regex: district, $options: 'i' };
        if (market) query.market = { $regex: market, $options: 'i' };
        if (commodity) query.commodity = { $regex: commodity, $options: 'i' };

        // 3. Go to MongoDB and fetch the data
        // .sort({ arrival_date: -1 }) means "Show newest dates first"
        const prices = await Price.find(query).sort({ arrival_date: -1 });

        // 4. Send the result back to the user
        res.json({
            count: prices.length,
            data: prices
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
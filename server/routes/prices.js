const express = require('express');
const router = express.Router();
const Price = require('../models/Price');

// Helper: Escape special regex characters like (, ), /, +
// This ensures "Arecanut(Supari)" is treated as text, not a regex command.
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// @route   GET /api/prices
router.get('/', async (req, res) => {
    try {
        const { state, district, market, commodity, variety, from, to, limit } = req.query;

        let query = {};

        // 1. Text Filters (Now Safe for Special Characters)
        if (state) query.state = { $regex: escapeRegex(state), $options: 'i' };
        if (district) query.district = { $regex: escapeRegex(district), $options: 'i' };
        if (market) query.market = { $regex: escapeRegex(market), $options: 'i' };
        if (commodity) query.commodity = { $regex: escapeRegex(commodity), $options: 'i' };
        if (variety) query.variety = { $regex: escapeRegex(variety), $options: 'i' };

        // 2. Date Range Filter
        if (from || to) {
            query.arrival_date = {};
            
            // Scenario: Specific Date
            if (from && to && from === to) {
                // Because data was seeded in IST (UTC+5:30) but stored in UTC
                // We shift the search window by -5.5 hours to align with the stored timestamps
                const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

                const requestDate = new Date(from);
                
                const startOfDay = new Date(requestDate);
                startOfDay.setUTCHours(0, 0, 0, 0);
                
                const endOfDay = new Date(requestDate);
                endOfDay.setUTCHours(23, 59, 59, 999);

                // Shift window back to catch Indian timestamps
                const queryStart = new Date(startOfDay.getTime() - IST_OFFSET_MS);
                const queryEnd = new Date(endOfDay.getTime() - IST_OFFSET_MS);

                query.arrival_date.$gte = queryStart;
                query.arrival_date.$lte = queryEnd;
            } else {
                // Range Scenario
                if (from) {
                    const d = new Date(from);
                    d.setUTCHours(0,0,0,0);
                    query.arrival_date.$gte = d;
                }
                if (to) {
                    const d = new Date(to);
                    d.setUTCHours(23,59,59,999);
                    query.arrival_date.$lte = d;
                }
            }
        }

        const limitNum = limit ? parseInt(limit) : 100;

        const prices = await Price.find(query)
            .sort({ arrival_date: -1 })
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
router.get('/options/districts', async (req, res) => {
    try {
        const districts = await Price.distinct('district');
        res.json(districts.sort());
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/prices/options/commodities
router.get('/options/commodities', async (req, res) => {
    try {
        const { district } = req.query;
        let query = {};
        if (district) query.district = { $regex: escapeRegex(district), $options: 'i' };
        const commodities = await Price.distinct('commodity', query);
        res.json(commodities.sort());
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/prices/options/varieties
router.get('/options/varieties', async (req, res) => {
    try {
        const { district, commodity } = req.query;
        let query = {};
        if (district) query.district = { $regex: escapeRegex(district), $options: 'i' };
        // FIX: Must escape here too, or dropdowns will be empty!
        if (commodity) query.commodity = { $regex: escapeRegex(commodity), $options: 'i' };
        
        const varieties = await Price.distinct('variety', query);
        res.json(varieties.sort());
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
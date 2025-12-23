//server/routes/proxy.js

const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_KEY = process.env.DATA_GOV_API_KEY;
const RESOURCE_ID = '35985678-0d79-46b4-9ed6-6f13308a1d24';

// @route   GET /api/proxy/history
// @desc    Fetch Historical Data
// @params  range (3m, 6m, 1y) OR fromDate/toDate
router.get('/history', async (req, res) => {
    try {
        const { state, district, commodity, market, variety, range, from, to } = req.query;

        // 1. Mandatory Fields
        if (!state || !district || !commodity) {
            return res.status(400).json({ msg: "State, District, and Commodity are required." });
        }

        // 2. Determine "Limit" based on User Input (Range)
        // Since Gov API doesn't support easy "Date Range" filters, we estimate the records needed.
        let fetchLimit = 100; // Default (approx 3 months of daily data)

        if (range === '1m') fetchLimit = 35;
        if (range === '3m') fetchLimit = 100;
        if (range === '6m') fetchLimit = 200;
        if (range === '1y') fetchLimit = 400;

        // If user gave specific dates, we calculate approximate days
        if (from && to) {
            const date1 = new Date(from);
            const date2 = new Date(to);
            const diffTime = Math.abs(date2 - date1);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            fetchLimit = diffDays + 10; // Add buffer
        }

        console.log(`🔄 Proxy Fetch: ${commodity} (${range || 'custom'}) - Limit: ${fetchLimit}`);

        // 3. Build URL
        let url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json`;
        url += `&filters[State]=${encodeURIComponent(state)}`;
        url += `&filters[District]=${encodeURIComponent(district)}`;
        url += `&filters[Commodity]=${encodeURIComponent(commodity)}`;
        
        if (market) url += `&filters[Market]=${encodeURIComponent(market)}`;
        if (variety) url += `&filters[Variety]=${encodeURIComponent(variety)}`;

        // Sort by Newest first so we get the *latest* historical window
        url += `&limit=${fetchLimit}&sort[Arrival_Date]=desc`;

        const response = await axios.get(url);
        
        // 4. Send Raw Data
        res.json({
            count: response.data.records.length,
            data: response.data.records
        });

    } catch (err) {
        console.error("❌ Proxy Error:", err.message);
        res.status(500).json({ msg: "Failed to fetch external history" });
    }
});

module.exports = router;
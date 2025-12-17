require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Price = require('./models/Price');

// --- CONFIGURATION ---
const RESOURCE_ID = '35985678-0d79-46b4-9ed6-6f13308a1d24';
const API_KEY = process.env.DATA_GOV_API_KEY;

// TARGET: All South Indian States
const TARGET_STATES = [
    'Karnataka',
    'Tamil Nadu',
    'Kerala',
    'Andhra Pradesh',
    'Telangana'
];

// Set the date you want to fetch.
// In production, use "Yesterday" to ensure the market day is closed and full data is available.
const YESTERDAY = new Date();
YESTERDAY.setDate(YESTERDAY.getDate() - 1);

// Format Date to YYYY-MM-DD for the API Query
const DATE_TO_FETCH = YESTERDAY.toISOString().split('T')[0];
// OR: Manually override for testing:
// const DATE_TO_FETCH = '2025-10-17'; 
// ---------------------

/**
 * Helper: Convert "DD/MM/YYYY" string -> Date Object
 */
function parseIndianDate(dateStr) {
    if (!dateStr) return new Date();
    const parts = dateStr.split('/');
    return new Date(parts[2], parts[1] - 1, parts[0]);
}

async function fetchData() {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected.");
        console.log(`📅 Target Date: ${DATE_TO_FETCH}`);

        for (const state of TARGET_STATES) {
            console.log(`\n-----------------------------------------`);
            console.log(`🌍 Starting fetch for state: ${state}`);
            
            let offset = 0;
            let limit = 1000; // API usually caps around here
            let hasMoreData = true;
            let totalStateRecords = 0;

            // PAGINATION LOOP: Keep fetching until no more records come back
            while (hasMoreData) {
                // Build URL with State filter and Pagination (offset/limit)
                const url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&filters[State]=${encodeURIComponent(state)}&filters[Arrival_Date]=${DATE_TO_FETCH}&limit=${limit}&offset=${offset}`;

                try {
                    const response = await axios.get(url);
                    const records = response.data.records;

                    if (!records || records.length === 0) {
                        hasMoreData = false; // Stop loop
                        if (offset === 0) console.log(`⚠️ No records found for ${state}.`);
                        break;
                    }

                    console.log(`   ⬇️  Fetched batch of ${records.length} records (Offset: ${offset})...`);
                    
                    // Process and Save this batch
                    const ops = records.map(record => {
                        const realDate = parseIndianDate(record.Arrival_Date);
                        return {
                            updateOne: {
                                filter: { 
                                    market: record.Market, 
                                    commodity: record.Commodity, 
                                    variety: record.Variety, 
                                    arrival_date: realDate 
                                },
                                update: {
                                    $set: {
                                        state: record.State,
                                        district: record.District,
                                        market: record.Market,
                                        commodity: record.Commodity,
                                        variety: record.Variety,
                                        min_price: parseFloat(record.Min_Price),
                                        max_price: parseFloat(record.Max_Price),
                                        modal_price: parseFloat(record.Modal_Price),
                                        arrival_date: realDate,
                                        fetched_at: new Date()
                                    }
                                },
                                upsert: true
                            }
                        };
                    });

                    await Price.bulkWrite(ops);
                    
                    totalStateRecords += records.length;
                    
                    // If we got fewer records than the limit, we've reached the end
                    if (records.length < limit) {
                        hasMoreData = false;
                    } else {
                        // Prepare for next page
                        offset += limit;
                    }

                } catch (apiError) {
                    console.error(`❌ API Error for ${state}:`, apiError.message);
                    hasMoreData = false; // Stop this state on error
                }
            }
            
            if (totalStateRecords > 0) {
                console.log(`✅ Completed ${state}: Saved ${totalStateRecords} total records.`);
            }
        }

    } catch (error) {
        console.error("❌ Database/Script Error:", error.message);
    } finally {
        console.log("\n👋 Closing Database Connection.");
        mongoose.disconnect();
    }
}

fetchData();
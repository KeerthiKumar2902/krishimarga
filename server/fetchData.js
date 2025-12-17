require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Price = require('./models/Price');

// --- CONFIGURATION ---
const RESOURCE_ID = '35985678-0d79-46b4-9ed6-6f13308a1d24';
const API_KEY = process.env.DATA_GOV_API_KEY; 

const TARGETS = [
    { state: 'Karnataka', district: 'Shimoga', commodity: 'Arecanut(Betelnut/Supari)' },
    { state: 'Karnataka', district: 'Bangalore', commodity: 'Tomato' } 
];
// ---------------------

/**
 * Helper function to convert "DD/MM/YYYY" string to a JavaScript Date object
 * Input: "17/10/2025" -> Output: Date Object (2025-10-17)
 */
function parseIndianDate(dateStr) {
    if (!dateStr) return new Date();
    const parts = dateStr.split('/'); // Split ["17", "10", "2025"]
    // Note: Month is 0-indexed in JS (0 = Jan, 9 = Oct)
    return new Date(parts[2], parts[1] - 1, parts[0]); 
}

async function fetchData() {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected.");

        for (const target of TARGETS) {
            console.log(`\n🔍 Fetching ${target.commodity} in ${target.district}...`);
            
            // Hardcoded date for testing based on your screenshot
            const dateStr = '2025-10-17'; 

            const url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&filters[State]=${target.state}&filters[District]=${target.district}&filters[Commodity]=${encodeURIComponent(target.commodity)}&filters[Arrival_Date]=${dateStr}`;

            const response = await axios.get(url);
            const records = response.data.records;

            if (!records || records.length === 0) {
                console.log("⚠️ No records found for this target.");
                continue;
            }

            console.log(`📦 Found ${records.length} records. Saving to Database...`);

            const ops = records.map(record => {
                // FIX: Convert the string date to a real Date object
                const realDate = parseIndianDate(record.Arrival_Date);

                return {
                    updateOne: {
                        filter: { 
                            market: record.Market, 
                            commodity: record.Commodity, 
                            variety: record.Variety, 
                            arrival_date: realDate // FIX 1: Use Real Date in Filter
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
                                arrival_date: realDate, // FIX 2: Use Real Date in Save
                                fetched_at: new Date()
                            }
                        },
                        upsert: true
                    }
                };
            });

            await Price.bulkWrite(ops);
            console.log("✅ Data Saved/Updated successfully!");
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
        if (error.response) console.error("API Response:", error.response.data);
    } finally {
        console.log("\n👋 Closing Database Connection.");
        mongoose.disconnect();
    }
}

fetchData();
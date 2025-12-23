// server/seedCommoditiesFromAPI.js
require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Commodity = require('./models/Commodity');

const RESOURCE_ID = '35985678-0d79-46b4-9ed6-6f13308a1d24';
const API_KEY = process.env.DATA_GOV_API_KEY;

// We fetch data from these major states to ensure we capture 99% of all possible crops
const SOURCE_STATES = [
    'Karnataka', 'Tamil Nadu', 'Kerala', 'Andhra Pradesh', 'Telangana',
    'Maharashtra', 'Uttar Pradesh', 'Punjab', 'Gujarat', 'Madhya Pradesh',
    'West Bengal', 'Bihar', 'Rajasthan', 'Haryana', 'Odisha'
];

async function seedCommodities() {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected.");

        // We use yesterday's date to ensure data exists
        const date = new Date();
        date.setDate(date.getDate() - 1); // Yesterday
        // date.setDate(date.getDate() - 2); // Or 2 days ago if yesterday was a holiday
        const dateStr = date.toISOString().split('T')[0];

        console.log(`📅 Scanning Government Data for: ${dateStr}`);
        
        let uniqueCommodities = new Set(); // Using a Set to automatically remove duplicates

        for (const state of SOURCE_STATES) {
            console.log(`   > Scanning ${state}...`);
            
            // Fetch up to 2000 records per state to get a wide variety
            const url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&filters[State]=${encodeURIComponent(state)}&filters[Arrival_Date]=${dateStr}&limit=2000`;

            try {
                const response = await axios.get(url);
                const records = response.data.records;

                if (records && records.length > 0) {
                    records.forEach(record => {
                        // Clean the name (remove extra spaces)
                        const name = record.Commodity.trim();
                        uniqueCommodities.add(name);
                    });
                }
            } catch (err) {
                console.error(`     ❌ Failed to fetch ${state}: ${err.message}`);
            }
        }

        const finalList = Array.from(uniqueCommodities).sort();
        console.log(`\n💎 Found ${finalList.length} unique commodities in the API.`);

        if (finalList.length === 0) {
            console.log("⚠️ No commodities found. Maybe try a different date?");
            process.exit(0);
        }

        // Prepare data for MongoDB
        const dbOperations = finalList.map(name => ({
            updateOne: {
                filter: { name: name }, // If name exists...
                update: { 
                    $set: { 
                        name: name,
                        // We default to 'Other' category initially. 
                        // You can manually categorize them later or use a lookup list.
                        category: 'Other' 
                    } 
                },
                upsert: true // ...update it. If not, insert it.
            }
        }));

        console.log("💾 Saving to Database...");
        await Commodity.bulkWrite(dbOperations);
        
        console.log("✅ Success! Master Commodity List updated from Government API.");
        process.exit(0);

    } catch (error) {
        console.error("❌ Fatal Error:", error);
        process.exit(1);
    }
}

seedCommodities();
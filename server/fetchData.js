//server/fetchData.js
require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Price = require('./models/Price');

const RESOURCE_ID = '35985678-0d79-46b4-9ed6-6f13308a1d24';
const API_KEY = process.env.DATA_GOV_API_KEY;

function parseIndianDate(dateStr) {
    if (!dateStr) return new Date();
    const parts = dateStr.split('/');
    return new Date(parts[2], parts[1] - 1, parts[0]);
}

async function runDailyFetch() {
    console.log("⏰ Starting Smart Fetch (Yesterday + Today)...");

    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }

        // 1. Define the "Rolling Window" (Yesterday and Today)
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const targetDates = [yesterday, today];

        for (const dateObj of targetDates) {
            const dateStr = dateObj.toISOString().split('T')[0];
            console.log(`\n🌍 Fetching All India data for: ${dateStr}`);

            let offset = 0;
            let limit = 2000;
            let hasMore = true;

            while (hasMore) {
                const url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&filters[Arrival_Date]=${dateStr}&limit=${limit}&offset=${offset}`;

                try {
                    const res = await axios.get(url);
                    const records = res.data.records;

                    if (!records || records.length === 0) {
                        hasMore = false;
                        break;
                    }

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
                    // Minimal logging to keep console clean
                    process.stdout.write(`+`); 

                    if (records.length < limit) hasMore = false;
                    else offset += limit;

                } catch (err) {
                    console.error(`\n❌ API Error: ${err.message}`);
                    hasMore = false;
                }
            }
            console.log(" -> Done.");
        }

        // 2. CLEANUP: Delete data older than 30 days
        console.log("\n🧹 Running 30-Day Cleanup...");
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const delRes = await Price.deleteMany({ arrival_date: { $lt: thirtyDaysAgo } });
        console.log(`✅ Cleanup Done. Deleted ${delRes.deletedCount} old records.`);

    } catch (error) {
        console.error("❌ Critical Error:", error);
    }
}

if (require.main === module) {
    (async () => {
        await runDailyFetch();
        mongoose.disconnect();
    })();
}

module.exports = { runDailyFetch };
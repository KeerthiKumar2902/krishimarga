//server/syncMasterData.js
require('dotenv').config();
const mongoose = require('mongoose');
const Price = require('./models/Price');
const Location = require('./models/Location');
const Commodity = require('./models/Commodity');

async function syncMasterData() {
    console.log("🚀 Starting Master Data Sync...");
    
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }

        // 1. Extract Locations
        console.log("📍 Aggregating Locations...");
        const locations = await Price.aggregate([
            {
                $group: {
                    _id: { state: "$state", district: "$district" },
                    markets: { $addToSet: "$market" }
                }
            },
            {
                $group: {
                    _id: "$_id.state",
                    districts: {
                        $push: {
                            name: "$_id.district",
                            markets: "$markets"
                        }
                    }
                }
            }
        ]);

        await Location.deleteMany({});
        
        const locOps = locations.map(loc => ({
            insertOne: {
                document: {
                    state: loc._id,
                    districts: loc.districts.sort((a, b) => a.name.localeCompare(b.name))
                }
            }
        }));

        if (locOps.length > 0) await Location.bulkWrite(locOps);
        console.log("✅ Locations Synced.");

        // 2. Extract Varieties
        console.log("🌾 Aggregating Varieties...");
        const varieties = await Price.aggregate([
            {
                $group: {
                    _id: "$commodity",
                    varieties: { $addToSet: "$variety" }
                }
            }
        ]);

        const commOps = varieties.map(v => ({
            updateOne: {
                filter: { name: v._id },
                update: { $set: { varieties: v.varieties.sort() } }
            }
        }));

        if (commOps.length > 0) await Commodity.bulkWrite(commOps);
        console.log("✅ Commodities Synced.");

    } catch (err) {
        console.error("❌ Error:", err);
    }
}

// Only run immediately if called directly from terminal
if (require.main === module) {
    (async () => {
        await syncMasterData();
        mongoose.disconnect();
    })();
}

module.exports = { syncMasterData };
//server/index.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');

// Import Routes
const priceRoutes = require('./routes/prices');
const commodityRoutes = require('./routes/commodities');
const proxyRoutes = require('./routes/proxy');
const locationRoutes = require('./routes/locations');

// Import Automation Scripts
const { runDailyFetch } = require('./fetchData');
const { syncMasterData } = require('./syncMasterData');

const app = express();

app.use(express.json());
app.use(cors());

// Connect to Database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully!"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Register Routes
app.use('/api/prices', priceRoutes);
app.use('/api/commodities', commodityRoutes);
app.use('/api/proxy', proxyRoutes);
app.use('/api/locations', locationRoutes);

// --- AUTOMATION SCHEDULE ---

// 1. Price Updates: Run 4 times a day (10 AM, 2 PM, 6 PM, 10 PM)
const priceSchedule = ['0 10 * * *', '0 14 * * *', '0 18 * * *', '0 22 * * *'];

priceSchedule.forEach(time => {
    cron.schedule(time, () => {
        console.log(`⏰ Price Update Triggered (${time})`);
        runDailyFetch();
    });
});

// 2. Master Data Sync: Run once daily at 12:05 AM
cron.schedule('5 0 * * *', () => {
    console.log('⏰ Master Data Sync Triggered');
    syncMasterData();
});

// Base Route
app.get('/', (req, res) => {
    res.send('KrishiMarga API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
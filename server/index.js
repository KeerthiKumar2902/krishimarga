require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import Routes
const priceRoutes = require('./routes/prices');
const commodityRoutes = require('./routes/commodities'); // <--- NEW LINE 1

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully!"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use('/api/prices', priceRoutes);
app.use('/api/commodities', commodityRoutes); // <--- NEW LINE 2

app.get('/', (req, res) => {
    res.send('KrishiMarga API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
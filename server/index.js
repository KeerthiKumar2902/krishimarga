require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize the Express App
const app = express();

// Middleware
app.use(express.json()); // Allows us to parse JSON bodies from requests
app.use(cors()); // Allows our Frontend (React) to talk to this Backend

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB Connected Successfully!");
    })
    .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err);
    });

// Basic Route to Test Server
app.get('/', (req, res) => {
    res.send('KrishiMarga API is running...');
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
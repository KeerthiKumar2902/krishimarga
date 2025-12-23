//server/models/Commodity.js

const mongoose = require('mongoose');

const CommoditySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    category: {
        type: String,
        default: 'Other'
    },
    image: {
        type: String,
        default: null
    },
    popular: {
        type: Boolean,
        default: false
    },
    // <--- NEW FIELD
    varieties: {
        type: [String], // Array of strings e.g. ["Rashi", "Bette"]
        default: []
    }
});

module.exports = mongoose.model('Commodity', CommoditySchema);
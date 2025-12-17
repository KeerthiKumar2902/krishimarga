const mongoose = require('mongoose');

const CommoditySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, // No duplicate crops
        trim: true
    },
    category: {
        type: String, // e.g., "Vegetables", "Spices", "Fruits"
        default: 'Other'
    },
    image: {
        type: String, // URL to the image (local or CDN)
        default: null
    },
    popular: {
        type: Boolean, // To show "Top Crops" first
        default: false
    }
});

module.exports = mongoose.model('Commodity', CommoditySchema);
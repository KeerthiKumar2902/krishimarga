const mongoose = require('mongoose');

const PriceSchema = new mongoose.Schema({
    state: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    market: {
        type: String,
        required: true
    },
    commodity: {
        type: String,
        required: true
    },
    variety: {
        type: String,
        default: 'FAQ' // Fair Average Quality is a common default
    },
    min_price: {
        type: Number,
        required: true
    },
    max_price: {
        type: Number,
        required: true
    },
    modal_price: {
        type: Number,
        required: true
    },
    arrival_date: {
        type: Date, // We store this as a Date object so we can sort by it later
        required: true
    },
    // This field records when WE fetched the data, useful for debugging
    fetched_at: {
        type: Date,
        default: Date.now
    }
});

// Compound Index: This ensures we don't save duplicate data for the same market+commodity+date
PriceSchema.index({ market: 1, commodity: 1, variety: 1, arrival_date: 1 }, { unique: true });

module.exports = mongoose.model('Price', PriceSchema);
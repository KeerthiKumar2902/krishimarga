//server/models/Location.js

const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
    state: { 
        type: String, 
        required: true, 
        unique: true 
    },
    // We store a list of districts objects, each having a name and list of markets
    districts: [{
        name: { type: String, required: true },
        markets: [String] // List of market names inside this district
    }]
});

module.exports = mongoose.model('Location', LocationSchema);
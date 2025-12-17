import axios from 'axios';

// Point to your local Node.js server
// If you deploy later, you only change this one line.
const API_URL = 'http://localhost:5000/api';

export const marketService = {
  // Get list of unique Districts for the dropdown
  getDistricts: async () => {
    const response = await axios.get(`${API_URL}/prices/options/districts`);
    return response.data;
  },

  // Get list of Commodities for a specific district
  getCommodities: async (district) => {
    const response = await axios.get(`${API_URL}/prices/options/commodities`, {
      params: { district }
    });
    return response.data;
  },

  // Get the actual prices based on filters (State, District, Commodity)
  getPrices: async (filters) => {
    // filters looks like: { district: "Shimoga", commodity: "Arecanut" }
    const response = await axios.get(`${API_URL}/prices`, {
      params: filters
    });
    return response.data;
  }
};
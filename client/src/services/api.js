import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const marketService = {
  getStates: async () => {
    const response = await axios.get(`${API_URL}/locations/states`);
    return response.data;
  },

  getDistricts: async (state) => {
    if (!state) return [];
    const response = await axios.get(`${API_URL}/locations/districts/${state}`);
    return response.data;
  },

  // NEW: Get Varieties based on district/commodity context
  getVarieties: async (district, commodity) => {
    const response = await axios.get(`${API_URL}/prices/options/varieties`, {
        params: { district, commodity }
    });
    return response.data;
  },

  getPrices: async (filters) => {
    const response = await axios.get(`${API_URL}/prices`, { params: filters });
    return response.data;
  },

  getHistory: async (filters) => {
    const response = await axios.get(`${API_URL}/proxy/history`, { params: filters });
    return response.data;
  },

  getCommodities: async () => {
    const response = await axios.get(`${API_URL}/commodities`);
    return response.data;
  }
};
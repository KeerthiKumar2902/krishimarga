import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const marketService = {
  getDistricts: async () => {
    const response = await axios.get(`${API_URL}/prices/options/districts`);
    return response.data;
  },

  // Update: Allow fetching ALL commodities if no district is passed
  getCommodities: async (district = '') => {
    const params = district ? { district } : {};
    const response = await axios.get(`${API_URL}/prices/options/commodities`, { params });
    return response.data;
  },

  getPrices: async (filters) => {
    const response = await axios.get(`${API_URL}/prices`, { params: filters });
    return response.data;
  }
};
import React, { useState, useEffect } from 'react';
import { marketService } from '../../../services/api'; // Import your API bridge

const MarketSearch = ({ onSearch }) => {
  // State for dropdown options
  const [districts, setDistricts] = useState([]);
  const [commodities, setCommodities] = useState([]);
  
  // State for selected values
  const [filters, setFilters] = useState({
    district: '',
    commodity: ''
  });

  const [loading, setLoading] = useState(false);

  // 1. Load Districts when component mounts
  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const data = await marketService.getDistricts();
        setDistricts(data);
      } catch (err) {
        console.error("Failed to load districts", err);
      }
    };
    loadDistricts();
  }, []);

  // 2. Load Commodities when District changes
  useEffect(() => {
    const loadCommodities = async () => {
      if (!filters.district) return;
      try {
        const data = await marketService.getCommodities(filters.district);
        setCommodities(data);
      } catch (err) {
        console.error("Failed to load commodities", err);
      }
    };
    loadCommodities();
  }, [filters.district]);

  // Handle Dropdown Changes
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Handle Search Button Click
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters); // Send data up to the Main Page
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Find Market Prices</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* District Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">District</label>
          <select 
            name="district" 
            value={filters.district}
            onChange={handleChange}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
          >
            <option value="">Select District</option>
            {districts.map(dist => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
          </select>
        </div>

        {/* Commodity Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Commodity</label>
          <select 
            name="commodity" 
            value={filters.commodity}
            onChange={handleChange}
            disabled={!filters.district} // Disable if no district selected
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">All Commodities</option>
            {commodities.map(comm => (
              <option key={comm} value={comm}>{comm}</option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <button 
            type="submit"
            className="w-full bg-brand-600 text-white font-medium py-2.5 rounded-lg hover:bg-brand-700 transition-colors flex justify-center items-center gap-2 shadow-md hover:shadow-lg"
          >
            <span>🔍</span> Search Prices
          </button>
        </div>

      </form>
    </div>
  );
};

export default MarketSearch;
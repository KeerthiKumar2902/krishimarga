import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const Home = () => {
  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await axios.get(`${API_URL}/commodities`);
        setCommodities(res.data);
      } catch (err) {
        console.error("Failed to load catalog", err);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, []);

  const filteredList = commodities.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // FIX: Helper to safely navigate to commodity page
  const handleCardClick = (name) => {
    // Encodes slashes '/' to '%2F' so URL doesn't break
    const safeName = encodeURIComponent(name);
    navigate(`/market/${safeName}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Search */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">What crop are you looking for?</h1>
        <div className="max-w-xl mx-auto relative">
          <input 
            type="text" 
            placeholder="Search for Arecanut, Tomato, Rice..." 
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-4 top-3.5 text-xl">🔍</span>
        </div>
      </div>

      {/* Grid of Commodities */}
      {loading ? (
        <div className="text-center text-gray-500">Loading Crops...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredList.map((crop) => (
            <div 
              key={crop._id}
              onClick={() => handleCardClick(crop.name)} // Use the safe handler
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-brand-300 transition-all cursor-pointer flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-brand-100 transition-colors text-2xl">
                🌱
              </div>
              <h3 className="font-semibold text-gray-700 group-hover:text-brand-700">
                {crop.name}
              </h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
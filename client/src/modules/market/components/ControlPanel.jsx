import React, { useState, useEffect } from 'react';
import { Filter, Calendar } from 'lucide-react';
import { marketService } from '../../../services/api';

const ControlPanel = ({ commodity, onFilterChange }) => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [varieties, setVarieties] = useState([]);

  // Selections
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('');
  const [selectedVariety, setSelectedVariety] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // 1. Load States
  useEffect(() => {
    marketService.getStates().then(setStates).catch(console.error);
  }, []);

  // 2. Load Districts when State changes
  useEffect(() => {
    if (selectedState) {
      marketService.getDistricts(selectedState).then(data => {
        setDistricts(data);
        // Reset downstream
        setMarkets([]);
        setSelectedDistrict('');
        setSelectedMarket('');
      });
    } else {
        setDistricts([]);
    }
  }, [selectedState]);

  // 3. Load Markets & Varieties when District changes
  useEffect(() => {
    if (selectedDistrict) {
      const districtObj = districts.find(d => d.name === selectedDistrict);
      setMarkets(districtObj ? districtObj.markets : []);
      
      // Fetch Varieties available in this district for this commodity
      marketService.getVarieties(selectedDistrict, commodity).then(setVarieties);
      
      setSelectedMarket('');
      setSelectedVariety('');
    }
  }, [selectedDistrict, districts, commodity]);

  // 4. Notify Parent
  useEffect(() => {
    onFilterChange({
        state: selectedState,
        district: selectedDistrict,
        market: selectedMarket,
        variety: selectedVariety,
        date: selectedDate // Passed up to parent
    });
  }, [selectedState, selectedDistrict, selectedMarket, selectedVariety, selectedDate]);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm transition-all">
      <div className="container mx-auto px-4 py-3">
        
        <div className="flex flex-col gap-3">
            {/* Row 1: Location Filters */}
            <div className="flex flex-col md:flex-row gap-3 items-center">
                <div className="flex items-center gap-2 text-brand-700 font-medium whitespace-nowrap min-w-[80px]">
                    <Filter size={18} /> Location:
                </div>
                <select 
                    className="w-full md:w-1/3 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-gray-50"
                    value={selectedState} onChange={(e) => setSelectedState(e.target.value)}
                >
                    <option value="">Select State</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select 
                    className="w-full md:w-1/3 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-gray-50 disabled:opacity-50"
                    value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={!selectedState}
                >
                    <option value="">Select District</option>
                    {districts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                </select>
                <select 
                    className="w-full md:w-1/3 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-gray-50 disabled:opacity-50"
                    value={selectedMarket} onChange={(e) => setSelectedMarket(e.target.value)}
                    disabled={!selectedDistrict}
                >
                    <option value="">All Markets</option>
                    {markets.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>

            {/* Row 2: Detail Filters (Variety & Date) */}
            {selectedDistrict && (
                <div className="flex flex-col md:flex-row gap-3 items-center animate-fade-in">
                    <div className="flex items-center gap-2 text-brand-700 font-medium whitespace-nowrap min-w-[80px]">
                        <Filter size={18} /> Details:
                    </div>
                    
                    {/* Variety Dropdown */}
                    <select 
                        className="w-full md:w-1/3 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-gray-50"
                        value={selectedVariety} onChange={(e) => setSelectedVariety(e.target.value)}
                    >
                        <option value="">All Varieties</option>
                        {varieties.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>

                    {/* Date Picker */}
                    <div className="w-full md:w-1/3 relative">
                        <input 
                            type="date" 
                            className="w-full p-2 pl-9 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-gray-50 text-gray-600"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            max={new Date().toISOString().split("T")[0]} // Disable future dates
                        />
                        <Calendar size={16} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none"/>
                    </div>
                    
                    <button 
                        onClick={() => { setSelectedDate(''); setSelectedVariety(''); }}
                        className="text-xs text-gray-400 hover:text-brand-600 underline whitespace-nowrap"
                    >
                        Reset Details
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
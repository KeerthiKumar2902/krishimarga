import React, { useState } from 'react';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';

const MarketStats = ({ priceData, filters }) => {
  const [unit, setUnit] = useState('quintal'); // 'quintal' or 'kg'

  if (!priceData) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6 mb-6 flex items-start gap-4">
            <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                <Calendar size={24} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-800">No Recent Data Available</h3>
                <p className="text-gray-500 text-sm mt-1">
                    We couldn't find any trading data for <strong>{filters.commodity}</strong> in <strong>{filters.district}</strong> within the last 30 days.
                </p>
                <p className="text-xs text-gray-400 mt-2">Try checking the "1 Year" graph history below.</p>
            </div>
        </div>
      );
  }

  const { modal_price, min_price, max_price, arrival_date, market, variety } = priceData;
  
  // Unit Conversion Logic
  // 1 Quintal = 100 Kg. So Price/Kg = Price/100
  const displayModal = unit === 'quintal' ? modal_price : (modal_price / 100).toFixed(1);
  const displayMin = unit === 'quintal' ? min_price : (min_price / 100).toFixed(1);
  const displayMax = unit === 'quintal' ? max_price : (max_price / 100).toFixed(1);

  // Range Bar Calc
  const rangeSpan = max_price - min_price;
  const currentPos = modal_price - min_price;
  const percentage = rangeSpan === 0 ? 50 : (currentPos / rangeSpan) * 100;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full translate-x-10 -translate-y-10 opacity-50"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
        
        {/* Left Side: Price */}
        <div>
            <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xs font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-2 py-1 rounded">
                    Latest Available Price
                </h2>
                <span className="text-xs text-gray-400 border border-gray-200 px-2 py-1 rounded">
                    {new Date(arrival_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
            </div>
            
            <div className="flex items-baseline gap-3 mt-2">
                <span className="text-5xl font-extrabold text-gray-800">₹{displayModal}</span>
                
                {/* Unit Toggler */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button 
                        onClick={() => setUnit('quintal')}
                        className={`text-xs font-semibold px-2 py-1 rounded-md transition-all ${unit === 'quintal' ? 'bg-white shadow text-brand-700' : 'text-gray-500'}`}
                    >
                        / Quintal
                    </button>
                    <button 
                        onClick={() => setUnit('kg')}
                        className={`text-xs font-semibold px-2 py-1 rounded-md transition-all ${unit === 'kg' ? 'bg-white shadow text-brand-700' : 'text-gray-500'}`}
                    >
                        / Kg
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
                <MapPin size={16} className="text-brand-500"/> 
                <span>{market}, {filters.district}</span>
                <span className="text-gray-300">|</span>
                <span>Variety: <strong>{variety}</strong></span>
            </div>
        </div>

        {/* Right Side: Range */}
        <div className="mt-6 md:mt-0 w-full md:w-auto min-w-[280px]">
            <div className="bg-gray-50 px-5 py-4 rounded-xl border border-gray-200">
                <div className="flex justify-between text-sm mb-2 font-medium text-gray-600">
                    <span>Min: ₹{displayMin}</span>
                    <span>Max: ₹{displayMax}</span>
                </div>
                
                <div className="w-full h-3 bg-gray-200 rounded-full relative overflow-hidden">
                    <div 
                        className="absolute top-0 bottom-0 bg-gradient-to-r from-brand-400 to-brand-600 rounded-full shadow-sm" 
                        style={{ left: `${percentage}%`, width: '14px', transform: 'translateX(-50%)', border: '2px solid white' }}
                    ></div>
                    <div className="absolute top-0 bottom-0 bg-brand-500 w-full opacity-10"></div>
                </div>
                
                <p className="text-xs text-center text-gray-400 mt-2">Day's Range</p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default MarketStats;
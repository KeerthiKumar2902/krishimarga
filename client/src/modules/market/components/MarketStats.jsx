import React, { useState } from 'react';
import { MapPin, Calendar, Info } from 'lucide-react';

const MarketStats = ({ priceData, filters }) => {
  const [unit, setUnit] = useState('quintal');

  // Handle "No Data" gracefully
  if (!priceData) {
      return (
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-orange-400 p-6 mb-6 flex items-start gap-4 animate-fade-in">
            <div className="bg-orange-50 p-3 rounded-full text-orange-500">
                <Info size={24} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-800">
                    {filters.date ? `No Price Data for ${filters.date}` : "No Recent Data Available"}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                    No trading records found for <strong>{filters.commodity}</strong> in <strong>{filters.district}</strong>.
                </p>
            </div>
        </div>
      );
  }

  const { modal_price, min_price, max_price, arrival_date, market, variety } = priceData;
  const isSpecificDate = !!filters.date;
  
  // Unit Conversion
  const displayModal = unit === 'quintal' ? modal_price : (modal_price / 100).toFixed(1);
  const displayMin = unit === 'quintal' ? min_price : (min_price / 100).toFixed(1);
  const displayMax = unit === 'quintal' ? max_price : (max_price / 100).toFixed(1);

  // Range Bar Calculation
  const rangeSpan = max_price - min_price;
  const currentPos = modal_price - min_price;
  const percentage = rangeSpan === 0 ? 50 : (currentPos / rangeSpan) * 100;

  return (
    <div className="bg-gradient-to-br from-white to-brand-50/50 rounded-xl shadow-lg border border-brand-100 p-6 mb-6 relative overflow-hidden transition-all hover:shadow-xl">
      
      {/* Decorative Circles */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-8">
        
        {/* Left Side: Price Block */}
        <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${isSpecificDate ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-brand-50 text-brand-700 border-brand-200'}`}>
                    {isSpecificDate ? 'Price on Selected Date' : 'Latest Available Price'}
                </span>
                <div className="flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-white/80 backdrop-blur px-2 py-1 rounded border border-gray-200 shadow-sm">
                    <Calendar size={12} />
                    {new Date(arrival_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
            </div>
            
            <div className="flex items-baseline gap-3">
                {/* FIX: Changed text color to pitch black */}
                <span className="text-5xl font-black text-black tracking-tight">
                    ₹{displayModal}
                </span>
                
                {/* Unit Switcher */}
                <div className="flex bg-white border border-gray-200 p-1 rounded-lg shadow-sm">
                    <button 
                        onClick={() => setUnit('quintal')}
                        className={`text-[10px] font-bold px-3 py-1 rounded transition-all ${unit === 'quintal' ? 'bg-brand-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Quintal
                    </button>
                    <button 
                        onClick={() => setUnit('kg')}
                        className={`text-[10px] font-bold px-3 py-1 rounded transition-all ${unit === 'kg' ? 'bg-brand-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Kg
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 mt-3 font-medium">
                <MapPin size={16} className="text-brand-500"/> 
                <span>{market}, {filters.district}</span>
                <span className="text-gray-300">|</span>
                <span className="bg-white border border-gray-200 px-2 py-0.5 rounded text-xs text-gray-500 shadow-sm">
                    {variety}
                </span>
            </div>
        </div>

        {/* Right Side: Range Visualizer */}
        <div className="w-full md:w-auto min-w-[320px] bg-white/60 backdrop-blur-sm p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-end mb-3">
                <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Low</p>
                    <p className="text-lg font-bold text-red-600">₹{displayMin}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">High</p>
                    <p className="text-lg font-bold text-emerald-600">₹{displayMax}</p>
                </div>
            </div>
            
            {/* The Bar */}
            <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-yellow-400 to-emerald-500 opacity-80"></div>
                
                {/* Active Indicator Line */}
                <div 
                    className="absolute top-0 bottom-0 w-1 bg-white z-10 shadow-lg" 
                    style={{ left: `${percentage}%`, transition: 'left 1s ease-out' }}
                ></div>
                
                {/* Active Indicator Glow */}
                <div 
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-brand-900 rounded-full z-20 shadow-md" 
                    style={{ left: `${percentage}%`, transform: `translate(-50%, -50%)`, transition: 'left 1s ease-out' }}
                ></div>
            </div>

            <div className="mt-3 flex justify-between items-center">
               <p className="text-xs font-medium text-gray-500">Day's Range</p>
               <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">
                   Spread: ₹{max_price - min_price}
               </span>
            </div>
        </div>

      </div>
    </div>
  );
};

export default MarketStats;
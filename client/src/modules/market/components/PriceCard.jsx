import React from 'react';
import { TrendingUp } from 'lucide-react';

const PriceCard = ({ data, onClick }) => {
  const dateObj = new Date(data.arrival_date);
  const formattedDate = dateObj.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <div 
      onClick={() => onClick(data)}
      className="bg-white rounded-xl shadow-md p-5 border-l-4 border-brand-500 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-brand-600 transition-colors">
            {data.commodity}
          </h3>
          <p className="text-sm text-gray-500">{data.variety} Variety</p>
        </div>
        <span className="bg-brand-50 text-brand-700 text-xs px-2 py-1 rounded-full font-medium border border-brand-100">
          {data.market}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Modal Price</p>
          <p className="text-2xl font-bold text-brand-600">
            ₹{data.modal_price} <span className="text-sm font-normal text-gray-500">/quintal</span>
          </p>
        </div>
        <div className="text-right">
            <p className="text-xs text-gray-400">Range</p>
            <p className="text-sm font-medium text-gray-600">₹{data.min_price} - ₹{data.max_price}</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
        <span>📍 {data.district}, {data.state}</span>
        <div className="flex items-center gap-1 text-brand-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            <TrendingUp size={14} /> View Graph
        </div>
      </div>
    </div>
  );
};

export default PriceCard;
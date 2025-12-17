import React, { useEffect, useState } from 'react';
import { X, TrendingUp, Calendar, MapPin } from 'lucide-react';
import { marketService } from '../../../services/api';
import PriceChart from './PriceChart';

const PriceModal = ({ item, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch last 30 days of history for this specific item
    const fetchHistory = async () => {
      setLoading(true);
      try {
        // We use the same 'getPrices' but add a limit and filter strictly by this market/variety
        const result = await marketService.getPrices({
            state: item.state,
            district: item.district,
            market: item.market,
            commodity: item.commodity,
            variety: item.variety,
            limit: 30 // Get last 30 records
        });
        setHistory(result.data);
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    };

    if (item) fetchHistory();
  }, [item]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="bg-brand-600 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <h2 className="text-xl font-bold">{item.commodity}</h2>
            <p className="text-brand-100 text-sm opacity-90">{item.variety} Variety</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Quick Stats Row */}
          <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
               <MapPin size={16} /> <span>{item.market}, {item.district}</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
               <Calendar size={16} /> <span>Latest: {new Date(item.arrival_date).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="mb-4">
             <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-brand-600"/>
                30-Day Price Trend
             </h3>
          </div>

          {/* Chart Area */}
          <div className="min-h-[300px]">
            {loading ? (
               <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                  <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                  Loading history...
               </div>
            ) : (
               <PriceChart data={history} />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PriceModal;
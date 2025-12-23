import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { marketService } from '../../../services/api';

const TIME_RANGES = [
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
  { label: '1Y', value: '1y' },
];

const MarketGraph = ({ filters, commodity }) => {
  const [range, setRange] = useState('1m');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!filters.state || !filters.district) return;

    const loadData = async () => {
      setLoading(true);
      try {
        let rawData = [];

        if (range === '1m') {
            // Local DB
            const res = await marketService.getPrices({
                state: filters.state,
                district: filters.district,
                market: filters.market,
                commodity: commodity,
                limit: 30
            });
            rawData = res.data;
        } else {
            // Proxy (History)
            const res = await marketService.getHistory({
                state: filters.state,
                district: filters.district,
                market: filters.market,
                commodity: commodity,
                range: range
            });
            rawData = res.data;
        }

        // Normalize Data (Handle both Local DB and Gov API formats)
        // Gov API uses Capitalized Keys (Modal_Price), Local DB uses lowercase (modal_price)
        const formatted = rawData.slice().reverse().map(item => {
            const price = item.modal_price || item.Modal_Price; // Handle both keys
            const dateStr = item.arrival_date || item.Arrival_Date;
            
            return {
                date: new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                price: parseFloat(price)
            };
        }).filter(p => !isNaN(p.price)); // Remove bad data
        
        setData(formatted);

      } catch (err) {
        console.error("Graph Load Error", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [range, filters, commodity]);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mt-6 relative overflow-hidden">
      <div className="flex flex-wrap justify-between items-center mb-6 relative z-10">
        <h3 className="text-lg font-bold text-gray-800">Price Trend Analysis</h3>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
            {TIME_RANGES.map(t => (
                <button
                    key={t.value}
                    onClick={() => setRange(t.value)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                        range === t.value 
                        ? 'bg-white text-brand-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    {t.label}
                </button>
            ))}
        </div>
      </div>

      <div className="h-80 w-full relative z-10">
        {loading ? (
            <div className="h-full flex items-center justify-center text-gray-400 animate-pulse">Loading Chart...</div>
        ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{fontSize: 12}} />
                    <YAxis domain={['auto', 'auto']} tick={{fontSize: 12}} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [`₹${value}`, 'Price']}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#16a34a" 
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6 }} 
                    />
                </LineChart>
            </ResponsiveContainer>
        ) : (
            <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
                No history data available for this range.
            </div>
        )}
      </div>
    </div>
  );
};

export default MarketGraph;
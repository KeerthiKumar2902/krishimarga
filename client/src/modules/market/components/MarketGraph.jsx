import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { marketService } from '../../../services/api';

const TIME_RANGES = [
  { label: '1M', value: '1m' }, // Uses Local DB
  { label: '3M', value: '3m' }, // Uses Proxy
  { label: '6M', value: '6m' }, // Uses Proxy
  { label: '1Y', value: '1y' }, // Uses Proxy
];

const MarketGraph = ({ filters, commodity }) => {
  const [range, setRange] = useState('1m');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Don't load graph if no district selected
    if (!filters.state || !filters.district) return;

    const loadData = async () => {
      setLoading(true);
      try {
        let resultData = [];

        if (range === '1m') {
            // STRATEGY: Use LOCAL DB for speed (last 30 days)
            const res = await marketService.getPrices({
                state: filters.state,
                district: filters.district,
                market: filters.market,
                commodity: commodity,
                limit: 30
            });
            resultData = res.data;
        } else {
            // STRATEGY: Use PROXY for deep history
            const res = await marketService.getHistory({
                state: filters.state,
                district: filters.district,
                market: filters.market,
                commodity: commodity,
                range: range
            });
            resultData = res.data;
        }

        // Format for Chart (Reverse array to show Old -> New)
        const formatted = resultData.slice().reverse().map(item => ({
            date: new Date(item.arrival_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            price: parseFloat(item.modal_price)
        }));
        
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
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">Price Trend Analysis</h3>
        
        {/* Time Tabs */}
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

      <div className="h-80 w-full">
        {loading ? (
            <div className="h-full flex items-center justify-center text-gray-400">Loading Chart...</div>
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
            <div className="h-full flex items-center justify-center text-gray-400">
                No history data available for this range.
            </div>
        )}
      </div>
    </div>
  );
};

export default MarketGraph;
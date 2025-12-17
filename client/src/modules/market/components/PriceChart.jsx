import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PriceChart = ({ data }) => {
  // 1. Recharts expects data oldest -> newest (Left to Right)
  // Our API returns Newest -> Oldest. So we reverse a copy.
  const chartData = [...data].reverse().map(item => ({
    date: new Date(item.arrival_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    price: item.modal_price
  }));

  if (data.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed">
        Not enough data for a chart yet.
      </div>
    );
  }

  return (
    <div className="h-72 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: '#6b7280' }} 
            tickMargin={10}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }} 
            domain={['auto', 'auto']} // Auto-scale the Y-axis to fit prices
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value) => [`₹${value}`, 'Price']}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#16a34a" // Brand Green
            strokeWidth={3}
            dot={{ r: 4, fill: '#16a34a' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
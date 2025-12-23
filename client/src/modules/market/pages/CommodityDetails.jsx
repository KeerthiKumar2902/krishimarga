import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { marketService } from '../../../services/api';

import ControlPanel from '../components/ControlPanel';
import MarketStats from '../components/MarketStats';
import MarketGraph from '../components/MarketGraph';

const CommodityDetails = () => {
  const { commodityName } = useParams();
  
  const [filters, setFilters] = useState({
    state: '',
    district: '',
    market: '',
    variety: '',
    date: '' // New Filter
  });

  const [todayPrice, setTodayPrice] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch Latest Price when filters change
  useEffect(() => {
    if (!filters.district) {
        setTodayPrice(null);
        return;
    }

    const fetchLatest = async () => {
        setLoading(true);
        try {
            // Logic:
            // 1. If Date is selected, filter by that EXACT date.
            // 2. If NO date, filter by "Latest" (limit: 1, sort desc).
            
            let queryParams = {
                ...filters,
                commodity: commodityName,
                limit: 1
            };

            // If user picked a specific date, fetch THAT day (range start/end same day)
            if (filters.date) {
                queryParams.from = filters.date;
                queryParams.to = filters.date;
                // Remove limit to ensure we find it if it exists
                delete queryParams.limit; 
            }

            const res = await marketService.getPrices(queryParams);
            
            if (res.data && res.data.length > 0) {
                // If date filter was used, we might get multiple (diff markets), pick first
                setTodayPrice(res.data[0]);
            } else {
                setTodayPrice(null);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    fetchLatest();
  }, [filters, commodityName]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
        
        {/* Header */}
        <div className="bg-white pt-6 pb-4 px-4 border-b border-gray-100">
            <div className="container mx-auto flex items-center gap-4">
                <Link to="/" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{commodityName}</h1>
                    <p className="text-gray-500 text-sm">Market Intelligence Dashboard</p>
                </div>
            </div>
        </div>

        {/* Control Panel (Now passes commodity prop) */}
        <ControlPanel commodity={commodityName} onFilterChange={setFilters} />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            
            {!filters.district && (
                <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <div className="text-6xl mb-4">📍</div>
                    <h3 className="text-xl font-semibold text-gray-700">Select a Location</h3>
                    <p className="text-gray-500 mt-2">
                        Use the filters above to select State and District.
                    </p>
                </div>
            )}

            {filters.district && (
                <div className="animate-fade-in">
                    
                    {/* Stats Card */}
                    {loading ? (
                        <div className="h-40 bg-gray-200 rounded-xl animate-pulse mb-6"></div>
                    ) : (
                        <MarketStats priceData={todayPrice} filters={filters} />
                    )}

                    {/* Graph (History) */}
                    {/* We pass 'todayPrice' so graph knows what variety to default to if needed */}
                    <MarketGraph filters={filters} commodity={commodityName} />

                </div>
            )}

        </div>
    </div>
  );
};

export default CommodityDetails;
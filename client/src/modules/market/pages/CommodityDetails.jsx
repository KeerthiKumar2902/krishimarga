import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { marketService } from '../../../services/api';

import ControlPanel from '../components/ControlPanel';
import MarketStats from '../components/MarketStats';
import MarketGraph from '../components/MarketGraph';
import MarketTable from '../components/MarketTable';

const CommodityDetails = () => {
  const params = useParams(); 
  // FIX: Explicitly decode the URL parameter to handle slashes correctly
  const commodityName = decodeURIComponent(params.commodityName);
  
  const [filters, setFilters] = useState({
    state: '',
    district: '',
    market: '',
    variety: '',
    date: '' 
  });

  const [todayPrice, setTodayPrice] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!filters.district) {
        setTodayPrice(null);
        return;
    }

    const fetchLatest = async () => {
        setLoading(true);
        try {
            let queryParams = {
                ...filters,
                commodity: commodityName,
                limit: 1
            };

            if (filters.date) {
                queryParams.from = filters.date;
                queryParams.to = filters.date;
                delete queryParams.limit; 
            }

            const res = await marketService.getPrices(queryParams);
            
            if (res.data && res.data.length > 0) {
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

        <ControlPanel commodity={commodityName} onFilterChange={setFilters} />

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
                <div className="animate-fade-in space-y-6">
                    
                    {loading ? (
                        <div className="h-40 bg-gray-200 rounded-xl animate-pulse"></div>
                    ) : (
                        <MarketStats priceData={todayPrice} filters={filters} />
                    )}

                    <MarketTable filters={filters} commodity={commodityName} />

                    <MarketGraph filters={filters} commodity={commodityName} />

                </div>
            )}

        </div>
    </div>
  );
};

export default CommodityDetails;
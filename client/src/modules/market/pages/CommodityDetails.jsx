import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, MapPin } from 'lucide-react';
import { marketService } from '../../../services/api'; // Ensure this path is correct
import PriceCard from '../components/PriceCard';
import PriceModal from '../components/PriceModal';

const CommodityDetails = () => {
  const { commodityName } = useParams();
  
  // State for Data
  const [prices, setPrices] = useState([]);
  const [summary, setSummary] = useState({ max: null, min: null });
  
  // State for Filters
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // 1. Initial Load: Get Summary Stats & District Options for this Crop
  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      try {
        // Fetch ALL recent data for this crop to calculate stats
        const result = await marketService.getPrices({ 
            commodity: commodityName,
            limit: 100 
        });
        
        const data = result.data;
        if (data.length > 0) {
            // Calculate Stats
            const maxPrice = data.reduce((prev, curr) => (prev.modal_price > curr.modal_price) ? prev : curr);
            const minPrice = data.reduce((prev, curr) => (prev.modal_price < curr.modal_price) ? prev : curr);
            setSummary({ max: maxPrice, min: minPrice });

            // Extract unique districts that actually have this crop
            const uniqueDistricts = [...new Set(data.map(item => item.district))].sort();
            setDistricts(uniqueDistricts);
        }
      } catch (err) {
        console.error("Error loading stats", err);
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, [commodityName]);

  // 2. Fetch Specific Prices ONLY when District is Selected
  useEffect(() => {
    if (!selectedDistrict) {
        setPrices([]); // Clear list if no district
        return;
    }

    const fetchLocalPrices = async () => {
      setLoading(true);
      try {
        const result = await marketService.getPrices({ 
            commodity: commodityName,
            district: selectedDistrict
        });
        setPrices(result.data);
      } catch (err) {
        console.error("Error loading prices", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocalPrices();
  }, [selectedDistrict, commodityName]);

  return (
    <div className="container mx-auto px-4 py-6">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-600 transition-colors">
            <ArrowLeft size={20} />
        </Link>
        <div>
            <h1 className="text-2xl font-bold text-brand-900">{commodityName}</h1>
            <p className="text-gray-500 text-sm">Market Insights</p>
        </div>
      </div>

      {/* Summary Cards */}
      {summary.max && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100 flex items-center justify-between">
                <div>
                    <p className="text-xs text-green-600 font-semibold uppercase">Highest Price Today</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">₹{summary.max.modal_price}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin size={12}/> {summary.max.market}, {summary.max.district}
                    </p>
                </div>
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                    <TrendingUp size={24} />
                </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100 flex items-center justify-between">
                <div>
                    <p className="text-xs text-orange-600 font-semibold uppercase">Lowest Price Today</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">₹{summary.min.modal_price}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin size={12}/> {summary.min.market}, {summary.min.district}
                    </p>
                </div>
                <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                    <TrendingDown size={24} />
                </div>
            </div>
        </div>
      )}

      {/* Filter Section - This is the KEY CONTROL */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-8 sticky top-4 z-10">
        <h3 className="text-md font-semibold text-gray-700 mb-3">Check Local Rates</h3>
        <div className="relative">
            <select 
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full p-3 pl-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-brand-500 outline-none appearance-none cursor-pointer"
            >
                <option value="">-- Select Your District --</option>
                {districts.map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                ))}
            </select>
            <div className="absolute right-4 top-3.5 pointer-events-none text-gray-400">▼</div>
        </div>
      </div>

      {/* Results List - Only shows when District is Selected */}
      <div>
        {!selectedDistrict ? (
            <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p>Select a district above to see market prices.</p>
            </div>
        ) : loading ? (
            <div className="text-center py-12 text-gray-500">Fetching live rates...</div>
        ) : prices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prices.map((price) => (
                    <PriceCard 
                        key={price._id} 
                        data={price} 
                        onClick={setSelectedItem} 
                    />
                ))}
            </div>
        ) : (
            <div className="text-center py-12 text-gray-500">
                No prices found for {commodityName} in {selectedDistrict} today.
            </div>
        )}
      </div>

      {/* Modal for Graph */}
      {selectedItem && (
        <PriceModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
    </div>
  );
};

export default CommodityDetails;
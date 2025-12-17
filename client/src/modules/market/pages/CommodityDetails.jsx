import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { marketService } from '../../../services/api';
import PriceCard from '../components/PriceCard';
import PriceModal from '../components/PriceModal';

const CommodityDetails = () => {
  const { commodityName } = useParams(); // Get "Arecanut" from URL
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  // Auto-fetch prices for this commodity when page loads
  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      try {
        // We fetch ALL prices for this commodity initially
        // You can add state/district filters here later
        const result = await marketService.getPrices({ 
            commodity: commodityName,
            limit: 50 // Show top 50 recent markets
        });
        setPrices(result.data);
      } catch (err) {
        console.error("Error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, [commodityName]);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Back Button & Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-600">
            <ArrowLeft size={20} />
        </Link>
        <div>
            <h1 className="text-2xl font-bold text-gray-800">{commodityName}</h1>
            <p className="text-gray-500 text-sm">Latest Market Rates</p>
        </div>
      </div>

      {/* Stats / Filters Area (Placeholder for now) */}
      <div className="bg-brand-50 p-4 rounded-lg mb-6 border border-brand-100 text-brand-800 text-sm">
        Viewing recent prices for <strong>{commodityName}</strong>. 
        (Filters coming soon!)
      </div>

      {/* List of Prices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
            <p className="text-gray-500">Fetching live rates...</p>
        ) : prices.length > 0 ? (
            prices.map((price) => (
                <PriceCard 
                    key={price._id} 
                    data={price} 
                    onClick={setSelectedItem} 
                />
            ))
        ) : (
            <p className="text-gray-500">No prices found for {commodityName} today.</p>
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
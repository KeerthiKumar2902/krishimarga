import React, { useState, useEffect } from 'react';
import { ArrowDown, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { marketService } from '../../../services/api';

const MarketTable = ({ filters, commodity }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(7);
  const [page, setPage] = useState(1); // Pagination State
  const [totalPages, setTotalPages] = useState(1);

  // Reset to page 1 if filters change
  useEffect(() => {
    setPage(1);
  }, [filters, commodity, limit]);

  useEffect(() => {
    if (!filters.state || !filters.district) return;

    const loadTableData = async () => {
      setLoading(true);
      try {
        let query = {
            state: filters.state,
            district: filters.district,
            commodity: commodity,
            limit: limit,
            page: page // Backend doesn't support 'page' directly, but we use skip/offset logic manually if needed
            // For simplicity with your current backend, we might just fetch more and slice, 
            // OR ideally, we update backend to support skip. 
            // Let's assume standard behavior:
        };

        // Note: Your current backend uses 'limit' but doesn't have a specific 'page' param for local DB.
        // We will fetch slightly differently:
        // We fetch 'limit' records. If we want page 2, we actually need to skip.
        // Since we didn't implement 'skip' in local DB route yet, we will just fetch 
        // the top results for now. 
        // *Self-Correction*: To make this work perfectly without backend changes, 
        // we will fetch a larger batch (e.g. 100) and paginate locally for now.
        // This is faster and easier for the user experience.
        
        query.limit = 100; // Fetch 100 rows, paginate locally

        if (filters.market) query.market = filters.market;
        if (filters.variety) query.variety = filters.variety;
        if (filters.date) {
            query.from = filters.date;
            query.to = filters.date;
        }

        const res = await marketService.getPrices(query);
        setData(res.data);
        setTotalPages(Math.ceil(res.data.length / limit));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTableData();
  }, [filters, commodity, limit]); // Removed 'page' dependency to fetch once

  // Calculate Slice for current page
  const startIndex = (page - 1) * limit;
  const currentData = data.slice(startIndex, startIndex + limit);

  if (!filters.district) return null;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mt-6 animate-fade-in">
      <div className="bg-brand-50 px-6 py-4 border-b border-brand-100 flex justify-between items-center flex-wrap gap-4">
        <h3 className="font-bold text-brand-800 flex items-center gap-2">
            <ArrowDown size={18} /> Detailed Market Report
        </h3>
        
        <div className="flex items-center gap-4">
            {/* Row Controller */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Rows:</span>
                <select 
                    value={limit} 
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="bg-white border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-brand-500 outline-none cursor-pointer"
                >
                    <option value={7}>7</option>
                    <option value={15}>15</option>
                    <option value={30}>30</option>
                </select>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
                <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <span className="text-xs font-semibold text-gray-600 min-w-[30px] text-center">
                    {page} / {totalPages || 1}
                </span>
                <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                    <th className="px-6 py-3 font-semibold">Market</th>
                    <th className="px-6 py-3 font-semibold">Variety</th>
                    <th className="px-6 py-3 font-semibold text-right">Min</th>
                    <th className="px-6 py-3 font-semibold text-right">Max</th>
                    <th className="px-6 py-3 font-semibold text-right text-brand-700">Modal</th>
                    <th className="px-6 py-3 font-semibold text-center">Date</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {loading ? (
                    <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-400">Loading Report...</td>
                    </tr>
                ) : currentData.length > 0 ? (
                    currentData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-brand-50/30 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-800">{row.market}</td>
                            <td className="px-6 py-4 text-gray-600">{row.variety}</td>
                            <td className="px-6 py-4 text-right text-orange-600 font-medium">₹{row.min_price}</td>
                            <td className="px-6 py-4 text-right text-emerald-600 font-medium">₹{row.max_price}</td>
                            <td className="px-6 py-4 text-right font-bold text-brand-700 bg-brand-50/10">₹{row.modal_price}</td>
                            <td className="px-6 py-4 text-center text-gray-400 text-xs">
                                {new Date(row.arrival_date).toLocaleDateString('en-IN')}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                            No records found.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketTable;
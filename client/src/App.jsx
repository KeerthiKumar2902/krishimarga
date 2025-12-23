// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './modules/market/pages/Home';
import CommodityDetails from './modules/market/pages/CommodityDetails';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 pb-20">
        <Navbar />
        <Routes>
          {/* Page 1: The Catalog */}
          <Route path="/" element={<Home />} />
          
          {/* Page 2: The Details (Dynamic URL) */}
          <Route path="/market/:commodityName" element={<CommodityDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-brand-600 shadow-lg text-white">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo Section */}
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🌱</span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">KrishiMarga</h1>
            <p className="text-xs text-brand-100">Farmers' Path to Prosperity</p>
          </div>
        </div>

        {/* Simple Menu (Placeholder for Auth later) */}
        <div className="hidden md:flex space-x-6 text-sm font-medium">
          <a href="#" className="hover:text-brand-100">Market Prices</a>
          <a href="#" className="opacity-70 cursor-not-allowed" title="Coming Soon">Weather</a>
          <a href="#" className="opacity-70 cursor-not-allowed" title="Coming Soon">Schemes</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
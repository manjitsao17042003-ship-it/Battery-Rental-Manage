import React from 'react';
import { useData } from '../contexts/DataContext';
import { Page } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  toggleTheme: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate, toggleTheme }) => {
  const { currentMarket, setMarket, markets, isAuthenticated } = useData();

  if (!isAuthenticated) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <i className="fas fa-circle-notch fa-spin text-4xl text-blue-600 mb-4"></i>
                <p className="text-gray-600">Connecting to database...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20 pt-16">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-blue-600 text-white z-40 shadow-md">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <i className="fas fa-bolt text-yellow-300 text-lg"></i>
            <span className="font-bold text-lg tracking-tight">Battery Manager</span>
          </div>
          <div className="flex items-center gap-3">
             <select 
                value={currentMarket} 
                onChange={(e) => setMarket(e.target.value)}
                className="bg-blue-700 text-white text-xs py-1 px-2 rounded border border-blue-500 focus:outline-none"
             >
                <option value="All">All Mkts</option>
                {markets.map(m => <option key={m} value={m}>{m}</option>)}
             </select>
             <button onClick={toggleTheme} className="text-white opacity-80 hover:opacity-100">
                <i className="fas fa-moon"></i>
             </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-4 max-w-4xl">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe">
        <div className="flex justify-around items-center h-16">
          <NavButton icon="home" label="Dash" active={currentPage === 'dashboard'} onClick={() => onNavigate('dashboard')} />
          <NavButton icon="arrow-up" label="Give" active={currentPage === 'give-battery'} onClick={() => onNavigate('give-battery')} />
          <NavButton icon="arrow-down" label="Return" active={currentPage === 'return-battery'} onClick={() => onNavigate('return-battery')} />
          <NavButton icon="users" label="Users" active={currentPage === 'customers'} onClick={() => onNavigate('customers')} />
          <NavButton icon="cog" label="Settings" active={currentPage === 'settings'} onClick={() => onNavigate('settings')} />
        </div>
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ icon: string; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full h-full transition-colors ${active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
  >
    <i className={`fas fa-${icon} text-lg mb-1 ${active ? 'transform scale-110' : ''}`}></i>
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);
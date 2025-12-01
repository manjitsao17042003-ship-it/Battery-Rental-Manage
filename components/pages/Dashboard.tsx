import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Page } from '../../types';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { customers, batteries, transactions, currentMarket } = useData();

  // Stats Logic
  const totalBatteries = batteries.length;
  // Available are strictly status == 'Available'
  const availableBatteries = batteries.filter(b => b.status === 'Available').length;
  // Rented are strictly status == 'Given'
  const rentedBatteries = batteries.filter(b => b.status === 'Given').length;
  
  // Pending returns: Filtered by market via context automatically
  const pendingReturns = transactions.filter(t => t.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          Dashboard <span className="text-sm font-normal text-gray-500 ml-2">({currentMarket})</span>
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard title="Total Batteries" value={totalBatteries} color="bg-blue-600" icon="battery-full" />
        <StatCard title="Available" value={availableBatteries} color="bg-green-600" icon="check" />
        <StatCard title="Rented Out" value={rentedBatteries} color="bg-red-500" icon="sign-out-alt" />
        <StatCard title="Pending Returns" value={pendingReturns} color="bg-yellow-500" icon="clock" />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-md font-semibold text-gray-700 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <ActionButton 
            label="Give Battery" 
            icon="arrow-up" 
            color="border-blue-500 text-blue-600 hover:bg-blue-50" 
            onClick={() => onNavigate('give-battery')} 
            full
          />
          <ActionButton 
            label="Return Battery" 
            icon="arrow-down" 
            color="border-green-500 text-green-600 hover:bg-green-50" 
            onClick={() => onNavigate('return-battery')} 
            full
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <ActionButton label="Customers" icon="users" color="border-gray-300 text-gray-600 hover:bg-gray-50" onClick={() => onNavigate('customers')} />
          <ActionButton label="Batteries" icon="battery-half" color="border-gray-300 text-gray-600 hover:bg-gray-50" onClick={() => onNavigate('batteries')} />
          <ActionButton label="Reports" icon="chart-bar" color="border-gray-300 text-gray-600 hover:bg-gray-50" onClick={() => onNavigate('reports')} />
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number; color: string; icon: string }> = ({ title, value, color, icon }) => (
  <div className={`${color} text-white rounded-xl p-4 shadow-md flex flex-col items-center justify-center text-center`}>
    <div className="text-3xl font-bold mb-1">{value}</div>
    <div className="text-xs opacity-90 font-medium uppercase tracking-wide">{title}</div>
  </div>
);

const ActionButton: React.FC<{ label: string; icon: string; color: string; onClick: () => void; full?: boolean }> = ({ label, icon, color, onClick, full }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center border-2 rounded-xl p-4 transition-all active:scale-95 ${color} ${full ? 'h-24' : 'h-20'}`}
  >
    <i className={`fas fa-${icon} text-2xl mb-2`}></i>
    <span className="text-sm font-medium leading-tight">{label}</span>
  </button>
);
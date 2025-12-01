import React, { useState, useMemo } from 'react';
import { useData, getDbPaths } from '../../contexts/DataContext';
import { Customer, Battery } from '../../types';
import { doc, collection, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface GiveBatteryProps {
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onSuccess: () => void;
}

export const GiveBattery: React.FC<GiveBatteryProps> = ({ showToast, onSuccess }) => {
  const { customers, batteries, transactions, markets, currentMarket, setMarket } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedBatteries, setSelectedBatteries] = useState<Battery[]>([]);
  const [manualBatteryInput, setManualBatteryInput] = useState('');

  // 1. Market Selection (Handled by Context setMarket, but we show UI for it if 'All' is selected)
  // Force user to pick a specific market if they haven't
  const needsMarketSelection = currentMarket === 'All';

  // 2. Filter Customers
  const filteredCustomers = useMemo(() => {
    if (needsMarketSelection) return [];
    return customers
      .filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.mobile.includes(searchTerm)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [customers, searchTerm, needsMarketSelection]);

  // Check pending for styling
  const pendingCustomerIds = useMemo(() => {
    return new Set(transactions.filter(t => t.status === 'Pending').map(t => t.customerId));
  }, [transactions]);

  // 3. Available Batteries (Global inventory)
  const availableBatteries = useMemo(() => {
    return batteries
      .filter(b => b.status === 'Available')
      .sort((a, b) => a.batteryNumber.localeCompare(b.batteryNumber, undefined, { numeric: true }));
  }, [batteries]);

  const handleSelectBattery = (battery: Battery) => {
    if (!selectedBatteries.find(b => b.id === battery.id)) {
      setSelectedBatteries([...selectedBatteries, battery]);
    }
  };

  const handleRemoveBattery = (id: string) => {
    setSelectedBatteries(selectedBatteries.filter(b => b.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      showToast('Please select a customer', 'error');
      return;
    }
    if (selectedBatteries.length === 0) {
      showToast('Please select at least one battery', 'error');
      return;
    }

    try {
      const batch = writeBatch(db);
      const paths = getDbPaths();
      
      selectedBatteries.forEach(batt => {
        // Create Transaction
        const transRef = doc(collection(db, paths.transactions));
        batch.set(transRef, {
          customerId: selectedCustomerId,
          batteryNumber: batt.batteryNumber,
          market: currentMarket,
          dateGiven: serverTimestamp(),
          dateReturned: null,
          status: 'Pending'
        });

        // Update Battery Status
        const battRef = doc(db, paths.batteries, batt.id);
        batch.update(battRef, { status: 'Given' });
      });

      await batch.commit();
      showToast(`${selectedBatteries.length} batteries given successfully`, 'success');
      onSuccess(); // Go back to dashboard
    } catch (error) {
      console.error(error);
      showToast('Transaction failed', 'error');
    }
  };

  if (needsMarketSelection) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-bold mb-4">Select a Market First</h3>
        <p className="text-gray-500 mb-6">You must select a specific market to give batteries.</p>
        <div className="grid grid-cols-2 gap-4">
          {markets.map(m => (
            <button
              key={m}
              onClick={() => setMarket(m)}
              className="p-4 bg-white border rounded-lg shadow-sm hover:bg-blue-50 hover:border-blue-500 font-medium"
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold">Give Battery ({currentMarket})</h2>

      {/* Step 1: Customer */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">1. Select Customer</label>
        <input
          type="text"
          placeholder="Search by name or phone..."
          className="w-full border rounded px-3 py-2 mb-2 focus:ring-2 focus:ring-blue-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="h-48 overflow-y-auto border rounded divide-y divide-gray-100 bg-gray-50">
          {filteredCustomers.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">No customers found</div>
          ) : (
            filteredCustomers.map(c => (
              <div
                key={c.id}
                onClick={() => setSelectedCustomerId(c.id)}
                className={`p-3 cursor-pointer text-sm hover:bg-blue-50 ${selectedCustomerId === c.id ? 'bg-blue-100 border-l-4 border-blue-600' : ''} ${pendingCustomerIds.has(c.id) ? 'text-red-600' : 'text-gray-700'}`}
              >
                <div className="font-bold flex justify-between">
                  <span>{c.name}</span>
                  {pendingCustomerIds.has(c.id) && <i className="fas fa-exclamation-circle text-red-500"></i>}
                </div>
                <div className="text-xs opacity-75">{c.mobile || 'No Phone'}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Step 2: Batteries */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">2. Select Available Batteries</label>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto mb-4 p-2 bg-gray-50 rounded border">
          {availableBatteries.length === 0 ? (
             <div className="text-gray-400 text-sm w-full text-center">No available batteries</div>
          ) : (
            availableBatteries.map(b => (
              <button
                key={b.id}
                onClick={() => handleSelectBattery(b)}
                disabled={selectedBatteries.some(sb => sb.id === b.id)}
                className={`text-xs px-2 py-1 rounded border ${
                    selectedBatteries.some(sb => sb.id === b.id) 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-white hover:bg-green-50 hover:border-green-500'
                }`}
              >
                <span className={`inline-block w-2 h-2 rounded-full mr-1 bg-${b.color === 'default' ? 'gray-400' : b.color + '-500'}`}></span>
                {b.batteryNumber}
              </button>
            ))
          )}
        </div>

        {/* Selected List */}
        {selectedBatteries.length > 0 && (
          <div className="mt-2">
            <h4 className="text-xs font-semibold uppercase text-gray-500 mb-1">Selected:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedBatteries.map(b => (
                <div key={b.id} className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full flex items-center gap-2">
                  <span>{b.batteryNumber}</span>
                  <button onClick={() => handleRemoveBattery(b.id)} className="hover:text-red-200"><i className="fas fa-times"></i></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg font-bold shadow-lg active:scale-95 transition-transform"
      >
        Complete Transaction
      </button>
    </div>
  );
};
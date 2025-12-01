import React, { useState, useMemo } from 'react';
import { useData, getDbPaths } from '../../contexts/DataContext';
import { Transaction, Battery } from '../../types';
import { doc, writeBatch, serverTimestamp, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface ReturnBatteryProps {
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const ReturnBattery: React.FC<ReturnBatteryProps> = ({ showToast }) => {
  const { customers, transactions } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // 1. Find Pending Transactions
  const pendingTransactions = useMemo(() => transactions.filter(t => t.status === 'Pending'), [transactions]);

  // 2. Group by Customer
  const customersWithReturns = useMemo(() => {
    const custMap = new Map<string, { count: number; customer: any }>();
    
    pendingTransactions.forEach(t => {
      if (!custMap.has(t.customerId)) {
        const cust = customers.find(c => c.id === t.customerId);
        if (cust) {
          custMap.set(t.customerId, { count: 0, customer: cust });
        }
      }
      if (custMap.has(t.customerId)) {
        custMap.get(t.customerId)!.count++;
      }
    });

    return Array.from(custMap.values())
      .filter(item => 
        item.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => b.count - a.count); // Most returns first
  }, [pendingTransactions, customers, searchTerm]);

  // 3. Transactions for selected customer
  const selectedCustomerTransactions = useMemo(() => {
    if (!selectedCustomerId) return [];
    return pendingTransactions.filter(t => t.customerId === selectedCustomerId);
  }, [pendingTransactions, selectedCustomerId]);

  const handleReturnBattery = async (trans: Transaction) => {
    try {
      const paths = getDbPaths();
      const batch = writeBatch(db);
      
      // Update Transaction
      const transRef = doc(db, paths.transactions, trans.id);
      batch.update(transRef, {
        status: 'Returned',
        dateReturned: serverTimestamp()
      });

      // Find battery to make available
      // Note: We need to query for the battery ID based on number
      const q = query(collection(db, paths.batteries), where('batteryNumber', '==', trans.batteryNumber), limit(1));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const battRef = snapshot.docs[0].ref;
        batch.update(battRef, { status: 'Available' });
      }

      await batch.commit();
      showToast(`Battery ${trans.batteryNumber} returned`, 'success');
      
      // If last one, close modal
      if (selectedCustomerTransactions.length <= 1) {
        setSelectedCustomerId(null);
      }

    } catch (error) {
      console.error(error);
      showToast('Return failed', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Return Battery</h2>
      
      {!selectedCustomerId ? (
        <>
          <input
            type="text"
            placeholder="Search pending customers..."
            className="w-full border rounded px-3 py-2 mb-2 outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <div className="space-y-2">
            {customersWithReturns.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">No pending returns found.</div>
            ) : (
              customersWithReturns.map(({ customer, count }) => (
                <div 
                  key={customer.id} 
                  onClick={() => setSelectedCustomerId(customer.id)}
                  className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold text-gray-800">{customer.name}</h3>
                    <p className="text-xs text-gray-500">{customer.market}</p>
                  </div>
                  <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-sm">
                    {count} Pending
                  </span>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-fade-in-up">
          <div className="bg-gray-100 p-4 border-b flex justify-between items-center">
             <h3 className="font-bold">Returning for Customer</h3>
             <button onClick={() => setSelectedCustomerId(null)} className="text-gray-500 hover:text-gray-800">
               <i className="fas fa-times"></i>
             </button>
          </div>
          <div className="p-4">
             <p className="text-sm text-gray-600 mb-4">Tap a battery to mark it as returned:</p>
             <div className="space-y-2">
               {selectedCustomerTransactions.map(t => (
                 <button
                   key={t.id}
                   onClick={() => handleReturnBattery(t)}
                   className="w-full flex justify-between items-center p-3 border rounded hover:bg-green-50 border-red-200 hover:border-green-500 transition-colors group"
                 >
                   <div className="flex items-center gap-3">
                     <i className="fas fa-battery-full text-xl text-gray-400 group-hover:text-green-600"></i>
                     <span className="font-bold text-lg">{t.batteryNumber}</span>
                   </div>
                   <span className="text-xs text-gray-400">
                     {t.dateGiven?.toDate().toLocaleDateString()}
                   </span>
                 </button>
               ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
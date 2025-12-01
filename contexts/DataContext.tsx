import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, query, where, onSnapshot, doc, getDocs, getDoc 
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { Customer, Battery, Transaction } from '../types';
import { onAuthStateChanged } from 'firebase/auth';

interface DataContextType {
  customers: Customer[];
  batteries: Battery[];
  transactions: Transaction[];
  markets: string[];
  currentMarket: string;
  setMarket: (market: string) => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const DataContext = createContext<DataContextType>({
  customers: [],
  batteries: [],
  transactions: [],
  markets: [],
  currentMarket: 'All',
  setMarket: () => {},
  loading: true,
  isAuthenticated: false,
});

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [markets, setMarkets] = useState<string[]>(['Sunday', 'Wednesday', 'Friday', 'Unassigned']);
  const [currentMarket, setCurrentMarket] = useState<string>(localStorage.getItem('brm_market') || 'All');
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // App ID from original code logic
  const APP_ID = 'default-app-id'; 
  const DB_PATHS = {
    customers: `artifacts/${APP_ID}/public/data/customers`,
    batteries: `artifacts/${APP_ID}/public/data/batteries`,
    transactions: `artifacts/${APP_ID}/public/data/transactions`,
    settings: `artifacts/${APP_ID}/public/data/settings`
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (!user) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Load Settings (Markets)
    const settingsRef = doc(db, DB_PATHS.settings, 'appSettings');
    const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().value) {
        setMarkets(docSnap.data().value);
      }
    });

    setLoading(true);

    let qCustomers = query(collection(db, DB_PATHS.customers), where('isActive', '==', 1));
    let qBatteries = query(collection(db, DB_PATHS.batteries)); // Global inventory
    let qTransactions = query(collection(db, DB_PATHS.transactions));

    // If market is specific, filter customers and transactions. Batteries remain global.
    if (currentMarket !== 'All') {
      qCustomers = query(qCustomers, where('market', '==', currentMarket));
      qTransactions = query(qTransactions, where('market', '==', currentMarket));
    }

    const unsubCust = onSnapshot(qCustomers, (snap) => {
      setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Customer)));
    });

    const unsubBatt = onSnapshot(qBatteries, (snap) => {
      setBatteries(snap.docs.map(d => ({ id: d.id, ...d.data() } as Battery)));
    });

    const unsubTrans = onSnapshot(qTransactions, (snap) => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
      setLoading(false);
    });

    return () => {
      unsubSettings();
      unsubCust();
      unsubBatt();
      unsubTrans();
    };
  }, [isAuthenticated, currentMarket]);

  const setMarket = (market: string) => {
    setCurrentMarket(market);
    localStorage.setItem('brm_market', market);
  };

  return (
    <DataContext.Provider value={{
      customers,
      batteries,
      transactions,
      markets,
      currentMarket,
      setMarket,
      loading,
      isAuthenticated
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const getDbPaths = () => {
   const APP_ID = 'default-app-id'; 
   return {
    customers: `artifacts/${APP_ID}/public/data/customers`,
    batteries: `artifacts/${APP_ID}/public/data/batteries`,
    transactions: `artifacts/${APP_ID}/public/data/transactions`,
    settings: `artifacts/${APP_ID}/public/data/settings`
  };
};
import React, { useState } from 'react';
import { DataProvider } from './contexts/DataContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/pages/Dashboard';
import { GiveBattery } from './components/pages/GiveBattery';
import { ReturnBattery } from './components/pages/ReturnBattery';
import { Toast } from './components/ui/Toast';
import { Page } from './types';
import { signIn } from './services/firebase';

// Placeholders for other components
const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <div className="text-center mt-10 text-gray-500">
    <h2 className="text-xl font-bold mb-2">{title}</h2>
    <p>Component not fully implemented in this demo view.</p>
  </div>
);

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Initialize Auth immediately
  React.useEffect(() => {
    signIn();
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentPage} />;
      case 'give-battery': return <GiveBattery showToast={showToast} onSuccess={() => setCurrentPage('dashboard')} />;
      case 'return-battery': return <ReturnBattery showToast={showToast} />;
      case 'customers': return <Placeholder title="Customers Management" />; // In full app, import Customers component
      case 'batteries': return <Placeholder title="Battery Inventory" />; // In full app, import Batteries component
      case 'reports': return <Placeholder title="Reports" />; // In full app, import Reports
      case 'settings': return <Placeholder title="Settings" />; // In full app, import Settings
      default: return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <DataProvider>
      <Layout 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        toggleTheme={() => { /* Implement theme toggle logic if needed */ }}
      >
        {renderPage()}
      </Layout>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </DataProvider>
  );
};

export default App;
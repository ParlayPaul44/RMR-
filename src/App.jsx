import { useState, useEffect } from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CustomerList from './components/CustomerList';
import CustomerDetail from './components/CustomerDetail';
import ProjectList from './components/ProjectList';
import InteractionList from './components/InteractionList';
import Reports from './components/Reports';
import Settings from './components/Settings';
import SearchResults from './components/SearchResults';

function AppContent() {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { settings } = useCRM();

  // Apply dark mode on mount
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const handleNavigate = (view, data) => {
    setActiveView(view);
    if (view === 'customers' && data) {
      setSelectedCustomer(data);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setActiveView('customers');
  };

  const renderView = () => {
    if (activeView === 'customers' && selectedCustomer) {
      return (
        <CustomerDetail
          customer={selectedCustomer}
          onBack={() => setSelectedCustomer(null)}
        />
      );
    }

    switch (activeView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'customers':
        return <CustomerList onSelectCustomer={setSelectedCustomer} />;
      case 'projects':
        return <ProjectList />;
      case 'interactions':
        return <InteractionList />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout
      activeView={activeView}
      setActiveView={(view) => {
        setActiveView(view);
        setSelectedCustomer(null);
      }}
      onSearch={handleSearch}
    >
      {renderView()}
      {searchQuery && (
        <SearchResults
          query={searchQuery}
          onClose={() => setSearchQuery('')}
          onSelectCustomer={handleSelectCustomer}
          onSelectInteraction={(interaction) => {
            setActiveView('interactions');
            setSearchQuery('');
          }}
        />
      )}
    </Layout>
  );
}

function App() {
  return (
    <CRMProvider>
      <AppContent />
    </CRMProvider>
  );
}

export default App;

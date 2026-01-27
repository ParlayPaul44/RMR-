import { useState, useRef } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Download,
  Upload,
  Trash2,
  Moon,
  Sun,
  AlertTriangle,
  Check,
  Database,
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';

export default function Settings() {
  const {
    settings,
    updateSettings,
    customers,
    interactions,
    exportToCSV,
    importFromCSV,
    clearData,
    tags,
  } = useCRM();
  const [salesRepName, setSalesRepName] = useState(settings.salesRepName);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importSuccess, setImportSuccess] = useState(null);
  const customersFileRef = useRef(null);
  const interactionsFileRef = useRef(null);

  const handleSaveSettings = () => {
    updateSettings({ salesRepName });
  };

  const toggleDarkMode = () => {
    const newDarkMode = !settings.darkMode;
    updateSettings({ darkMode: newDarkMode });
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleExport = () => {
    const { customersCSV, interactionsCSV } = exportToCSV();

    // Download customers CSV
    const customersBlob = new Blob([customersCSV], { type: 'text/csv' });
    const customersUrl = URL.createObjectURL(customersBlob);
    const customersLink = document.createElement('a');
    customersLink.href = customersUrl;
    customersLink.download = 'crm-customers.csv';
    customersLink.click();
    URL.revokeObjectURL(customersUrl);

    // Small delay before second download
    setTimeout(() => {
      const interactionsBlob = new Blob([interactionsCSV], { type: 'text/csv' });
      const interactionsUrl = URL.createObjectURL(interactionsBlob);
      const interactionsLink = document.createElement('a');
      interactionsLink.href = interactionsUrl;
      interactionsLink.download = 'crm-interactions.csv';
      interactionsLink.click();
      URL.revokeObjectURL(interactionsUrl);
    }, 500);
  };

  const handleExportJSON = () => {
    const data = {
      customers,
      interactions,
      settings,
      tags,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'crm-backup.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = async () => {
    const customersFile = customersFileRef.current?.files[0];
    const interactionsFile = interactionsFileRef.current?.files[0];

    if (!customersFile && !interactionsFile) {
      alert('Please select at least one CSV file to import.');
      return;
    }

    try {
      let customersCSV = null;
      let interactionsCSV = null;

      if (customersFile) {
        customersCSV = await customersFile.text();
      }
      if (interactionsFile) {
        interactionsCSV = await interactionsFile.text();
      }

      importFromCSV(customersCSV, interactionsCSV);
      setImportSuccess('Data imported successfully!');
      setTimeout(() => setImportSuccess(null), 3000);

      // Clear file inputs
      if (customersFileRef.current) customersFileRef.current.value = '';
      if (interactionsFileRef.current) interactionsFileRef.current.value = '';
    } catch (error) {
      console.error('Import error:', error);
      alert('Error importing data. Please check the file format.');
    }
  };

  const handleImportJSON = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.customers && data.interactions) {
        importFromCSV(null, null); // This will be replaced with the import
        // Actually import the data
        const { customers: importedCustomers, interactions: importedInteractions, tags: importedTags } = data;

        // We need to call importData from context
        // Since importFromCSV doesn't handle JSON, let's use a workaround
        localStorage.setItem('sales-crm-data', JSON.stringify({
          customers: importedCustomers || [],
          interactions: importedInteractions || [],
          settings: data.settings || settings,
          tags: importedTags || [],
        }));

        window.location.reload(); // Reload to apply changes
      } else {
        alert('Invalid backup file format.');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Error importing data. Please check the file format.');
    }
  };

  const handleClearData = () => {
    clearData();
    setShowClearConfirm(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your CRM settings and data
        </p>
      </div>

      {/* Profile Settings */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <User size={20} />
          Profile Settings
        </h2>
        <div className="space-y-4">
          <div>
            <label className="label">Sales Rep Name</label>
            <input
              type="text"
              value={salesRepName}
              onChange={(e) => setSalesRepName(e.target.value)}
              className="input"
              placeholder="Your name"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This name will appear on generated reports.
            </p>
          </div>
          <button onClick={handleSaveSettings} className="btn btn-primary">
            Save Settings
          </button>
        </div>
      </div>

      {/* Appearance */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          {settings.darkMode ? <Moon size={20} /> : <Sun size={20} />}
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Toggle between light and dark themes
            </p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              settings.darkMode ? 'bg-primary-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                settings.darkMode ? 'translate-x-7' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Data Statistics */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Database size={20} />
          Data Statistics
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{customers.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Customers</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {interactions.length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Interactions</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{tags.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tags</p>
          </div>
        </div>
      </div>

      {/* Export Data */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Download size={20} />
          Export Data
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Download your CRM data for backup or transfer purposes.
        </p>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExport} className="btn btn-secondary flex items-center gap-2">
            <Download size={16} />
            Export as CSV
          </button>
          <button onClick={handleExportJSON} className="btn btn-secondary flex items-center gap-2">
            <Download size={16} />
            Export as JSON
          </button>
        </div>
      </div>

      {/* Import Data */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Upload size={20} />
          Import Data
        </h2>

        {importSuccess && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg flex items-center gap-2">
            <Check size={18} />
            {importSuccess}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="label">Import from CSV</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Customers CSV</p>
                <input
                  type="file"
                  ref={customersFileRef}
                  accept=".csv"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900 dark:file:text-primary-300"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Interactions CSV</p>
                <input
                  type="file"
                  ref={interactionsFileRef}
                  accept=".csv"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900 dark:file:text-primary-300"
                />
              </div>
            </div>
            <button onClick={handleImportCSV} className="btn btn-primary mt-3">
              Import CSV Files
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <label className="label">Import from JSON Backup</label>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900 dark:file:text-primary-300"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Warning: This will replace all existing data.
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card p-6 border-red-200 dark:border-red-900">
        <h2 className="font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle size={20} />
          Danger Zone
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Permanently delete all CRM data. This action cannot be undone.
        </p>

        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="btn btn-danger flex items-center gap-2"
          >
            <Trash2 size={16} />
            Clear All Data
          </button>
        ) : (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300 mb-3">
              Are you sure? This will delete {customers.length} customers and {interactions.length}{' '}
              interactions.
            </p>
            <div className="flex gap-3">
              <button onClick={handleClearData} className="btn btn-danger">
                Yes, Delete Everything
              </button>
              <button onClick={() => setShowClearConfirm(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

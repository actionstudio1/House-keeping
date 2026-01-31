import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import IssueReceiveForm from './components/IssueReceiveForm';
import InventoryTable from './components/InventoryTable';
import Reports from './components/Reports';
import Login from './components/Login';
import { InventoryItem, Transaction, TransactionType } from './types';
import { fetchInventory, fetchTransactions, getStoredConfig, saveConfig } from './services/sheetService';
import { Save, Database, CheckCircle } from 'lucide-react';

interface UserSession {
  username: string;
  role: string;
  loginTime: string;
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetUrl, setSheetUrl] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('satyam_mall_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as UserSession;
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('satyam_mall_user');
      }
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    const invData = await fetchInventory();
    const transData = await fetchTransactions();
    setInventory(invData);
    setTransactions(transData);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      setSheetUrl(getStoredConfig());
      loadData();
    }
  }, [isAuthenticated]);

  const handleLogin = (_username: string) => {
    const storedUser = localStorage.getItem('satyam_mall_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('satyam_mall_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const handleSheetConfigSave = () => {
    saveConfig(sheetUrl);
    alert('Configuration Saved! Reloading data...');
    loadData();
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary-500/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard inventory={inventory} transactions={transactions} />;
      case 'issue':
        return <IssueReceiveForm type={TransactionType.ISSUE} inventory={inventory} onSuccess={loadData} />;
      case 'receive':
        return <IssueReceiveForm type={TransactionType.RECEIVE} inventory={inventory} onSuccess={loadData} />;
      case 'inventory':
        return <InventoryTable inventory={inventory} onRefresh={loadData} />;
      case 'reports':
        return <Reports transactions={transactions} />;
      case 'settings':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary-600 to-accent-600 px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <Database size={28} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Google Sheet Connection</h2>
                    <p className="text-primary-100 text-sm mt-1">Connect your inventory database</p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Web App URL</label>
                  <input
                    type="text"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/..."
                    className="w-full p-4 input-glass rounded-xl text-white"
                  />
                </div>

                <button
                  onClick={handleSheetConfigSave}
                  className="w-full btn-glossy text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-lg"
                >
                  <Save size={20} />
                  Save & Connect
                </button>

                {sheetUrl && (
                  <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-4 py-3 rounded-xl border border-green-500/20">
                    <CheckCircle size={18} />
                    <span className="text-sm font-medium">Connected to Google Sheet</span>
                  </div>
                )}
              </div>

              <div className="px-8 pb-8">
                <div className="glass rounded-xl p-6 border border-yellow-500/20">
                  <h4 className="font-bold text-yellow-400 text-sm mb-3 uppercase tracking-wider">Setup Instructions</h4>
                  <ol className="space-y-2 text-sm text-dark-300">
                    <li className="flex gap-3">
                      <span className="bg-yellow-500/20 text-yellow-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                      <span>Create a Google Sheet with tabs: <b className="text-white">Inventory</b> & <b className="text-white">Transactions</b></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="bg-yellow-500/20 text-yellow-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                      <span>Go to Extensions → Apps Script</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="bg-yellow-500/20 text-yellow-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                      <span>Paste the code from <code className="bg-white/10 px-2 py-0.5 rounded text-primary-400">GOOGLE_APPS_SCRIPT.js</code></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="bg-yellow-500/20 text-yellow-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                      <span>Run <b className="text-white">setupSheets</b> function first</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="bg-yellow-500/20 text-yellow-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">5</span>
                      <span>Deploy as Web App (Access: Anyone)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="bg-yellow-500/20 text-yellow-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">6</span>
                      <span>Paste URL above and connect</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        {renderContent()}
      </main>
      <footer className="glass-dark py-4 text-center text-xs text-dark-400 border-t border-white/5">
        &copy; {new Date().getFullYear()} Satyam Mall Facility Management System. <span className="text-primary-400 font-medium">Since 1989</span>
      </footer>
    </div>
  );
};

export default App;

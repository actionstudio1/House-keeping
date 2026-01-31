import React from 'react';
import { LayoutDashboard, ArrowDownToLine, ArrowUpFromLine, Settings, Box, FileText, LogOut, User } from 'lucide-react';

interface UserSession {
  username: string;
  role: string;
  loginTime: string;
}

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserSession | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, currentUser, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'issue', label: 'Issue', icon: ArrowUpFromLine },
    { id: 'receive', label: 'Receive', icon: ArrowDownToLine },
    { id: 'inventory', label: 'Stock', icon: Box },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="glass-dark sticky top-0 z-50 shadow-glass-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="bg-gradient-to-br from-primary-500 to-accent-500 p-2.5 rounded-xl shadow-glow group-hover:shadow-glow-accent transition-all duration-300">
              <Box className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-white block">SATYAM MALL</span>
              <span className="text-xs text-primary-400 font-medium tracking-wider uppercase">Since 1989</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                    ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/20 text-white border border-primary-500/30 shadow-glow'
                    : 'text-dark-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-primary-400' : ''} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* User Info & Logout */}
            <div className="ml-4 pl-4 border-l border-white/10 flex items-center space-x-3">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-primary-500/20 to-accent-500/20 p-2 rounded-xl border border-white/10">
                  <User size={18} className="text-primary-400" />
                </div>
                <div className="hidden lg:block">
                  <p className="font-medium text-white text-sm leading-tight">{currentUser?.username}</p>
                  <p className="text-xs text-dark-400">{currentUser?.role}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 border border-red-500/20 transition-all duration-300 text-sm font-medium"
                title="Logout"
              >
                <LogOut size={16} />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-primary-500/20 to-accent-500/20 p-1.5 rounded-lg">
                <User size={14} className="text-primary-400" />
              </div>
              <span className="text-dark-300 text-sm">{currentUser?.username}</span>
              <span className="text-xs text-dark-500">({currentUser?.role})</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-1 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium border border-red-500/20"
            >
              <LogOut size={12} />
              <span>Logout</span>
            </button>
          </div>
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex-shrink-0 flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                    ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/20 text-white border border-primary-500/30'
                    : 'text-dark-400 glass hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

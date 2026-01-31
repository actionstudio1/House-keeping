import React from 'react';
import { InventoryItem, Transaction, TransactionType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, Package, ArrowUpRight, TrendingUp, Boxes, Coffee } from 'lucide-react';

interface Props {
  inventory: InventoryItem[];
  transactions: Transaction[];
}

const Dashboard: React.FC<Props> = ({ inventory, transactions }) => {
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(i => i.quantity <= i.minLevel).length;
  const recentIssues = transactions.filter(t => t.type === TransactionType.ISSUE).slice(0, 5);
  const hkItems = inventory.filter(i => i.category === 'Housekeeping').length;
  const pantryItems = inventory.filter(i => i.category === 'Pantry').length;

  const categoryData = Object.values(inventory.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = { name: item.category, value: 0 };
    acc[item.category].value += 1;
    return acc;
  }, {} as Record<string, {name: string, value: number}>));

  const COLORS = ['#818cf8', '#e879f9', '#34d399', '#fbbf24'];

  const stats = [
    { label: 'Total Items', value: totalItems, icon: Package, gradient: 'from-primary-500 to-primary-600', iconBg: 'bg-primary-500/20' },
    { label: 'Low Stock', value: lowStockItems, icon: AlertTriangle, gradient: 'from-red-500 to-red-600', iconBg: 'bg-red-500/20', alert: true },
    { label: 'Housekeeping', value: hkItems, icon: Boxes, gradient: 'from-blue-500 to-blue-600', iconBg: 'bg-blue-500/20' },
    { label: 'Pantry', value: pantryItems, icon: Coffee, gradient: 'from-accent-500 to-accent-600', iconBg: 'bg-accent-500/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card rounded-2xl p-5 group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-dark-400 uppercase font-bold tracking-wider">{stat.label}</p>
                  <h3 className={`text-3xl font-bold mt-2 ${stat.alert ? 'text-red-400' : 'text-white'}`}>
                    {stat.value}
                  </h3>
                </div>
                <div className={`${stat.iconBg} p-3 rounded-xl transition-all duration-300 group-hover:scale-110`}>
                  <Icon className={stat.alert ? 'text-red-400' : 'text-primary-400'} size={24} />
                </div>
              </div>
              <div className={`h-1 w-full bg-gradient-to-r ${stat.gradient} rounded-full mt-4 opacity-50`}></div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-primary-400" />
              Inventory Composition
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15,23,42,0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                  }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#94a3b8' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {categoryData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowUpRight size={20} className="text-accent-400" />
              Recent Stock Issued
            </h3>
          </div>
          <div className="space-y-3">
            {recentIssues.length > 0 ? (
              recentIssues.map((t, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 glass rounded-xl transition-all duration-300 hover:border-primary-500/30"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 p-3 rounded-xl">
                      <ArrowUpRight size={18} className="text-orange-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{t.itemName}</p>
                      <p className="text-xs text-dark-400">{t.location} • {new Date(t.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="font-bold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-lg text-sm">
                    -{t.quantity}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="mx-auto text-dark-500 mb-3" size={40} />
                <p className="text-dark-400 text-sm">No recent transactions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems > 0 && (
        <div className="glass-card rounded-2xl p-6 border border-red-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-500/20 p-3 rounded-xl">
              <AlertTriangle className="text-red-400" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Low Stock Alert</h3>
              <p className="text-dark-400 text-sm">{lowStockItems} items need to be restocked</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {inventory.filter(i => i.quantity <= i.minLevel).slice(0, 6).map((item, idx) => (
              <div key={idx} className="glass rounded-xl p-4 border border-red-500/10">
                <p className="font-medium text-white text-sm">{item.name}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-dark-400">Stock: {item.quantity} {item.unit}</span>
                  <span className="text-xs text-red-400 font-medium">Min: {item.minLevel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

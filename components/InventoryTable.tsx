import React, { useState } from 'react';
import { InventoryItem, Category } from '../types';
import { Search, Filter, AlertTriangle, X, ArrowUpDown, ArrowUp, ArrowDown, Download, Package, Activity, Edit2, Check, Loader2 } from 'lucide-react';
import { updateInventoryQuantity } from '../services/sheetService';

interface Props {
  inventory: InventoryItem[];
  onRefresh: () => void;
}

const InventoryTable: React.FC<Props> = ({ inventory, onRefresh }) => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editQty, setEditQty] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const filteredData = inventory.filter(item => {
    const matchesCategory = filter === 'All' || item.category === filter;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          item.id.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortOrder === 'asc') return a.name.localeCompare(b.name);
    if (sortOrder === 'desc') return b.name.localeCompare(a.name);
    return 0;
  });

  const clearFilters = () => {
    setSearch('');
    setFilter('All');
    setSortOrder(null);
  };

  const toggleSort = () => {
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
  };

  const handleExport = () => {
    const headers = ["ID", "Item Name", "Category", "Quantity", "Unit", "Min Level", "Status"];
    const csvContent = [
      headers.join(","),
      ...sortedData.map(item => {
        const status = item.quantity <= item.minLevel ? "Low Stock" : "In Stock";
        const safeName = `"${item.name.replace(/"/g, '""')}"`;
        return [item.id, safeName, item.category, item.quantity, item.unit, item.minLevel, status].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `satyam_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsEditing(false);
    setEditQty(item.quantity.toString());
  };

  const handleSaveQuantity = async () => {
    if (!selectedItem) return;
    setIsSaving(true);
    const success = await updateInventoryQuantity(selectedItem.name, Number(editQty));
    setIsSaving(false);

    if (success) {
      setSelectedItem(prev => prev ? { ...prev, quantity: Number(editQty) } : null);
      setIsEditing(false);
      onRefresh();
    } else {
      alert("Failed to update quantity.");
    }
  };

  const hasActiveFilters = search !== '' || filter !== 'All';

  return (
    <>
      <div className="glass-card rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Package className="text-primary-400" size={24} />
              Current Inventory
              <span className="text-sm font-normal text-dark-400">({sortedData.length} items)</span>
            </h2>

            <div className="flex flex-wrap gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-3 text-dark-400" size={18} />
                <input
                  type="text"
                  placeholder="Search items..."
                  className="pl-11 pr-4 py-2.5 input-glass rounded-xl text-white text-sm w-full md:w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <Filter className="absolute left-4 top-3 text-dark-400" size={18} />
                <select
                  className="pl-11 pr-8 py-2.5 input-glass rounded-xl text-white text-sm appearance-none cursor-pointer"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="All" className="bg-dark-900">All Categories</option>
                  {Object.values(Category).map(cat => (
                    <option key={cat} value={cat} className="bg-dark-900">{cat}</option>
                  ))}
                </select>
              </div>

              {/* Export */}
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 glass rounded-xl text-dark-300 hover:text-white transition-colors text-sm font-medium"
              >
                <Download size={16} />
                Export
              </button>

              {/* Clear */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors text-sm font-medium"
                >
                  <X size={16} />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-dark-300 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors select-none group"
                  onClick={toggleSort}
                >
                  <div className="flex items-center gap-2">
                    Item Name
                    {sortOrder === 'asc' && <ArrowUp size={14} className="text-primary-400" />}
                    {sortOrder === 'desc' && <ArrowDown size={14} className="text-primary-400" />}
                    {!sortOrder && <ArrowUpDown size={14} className="text-dark-500 group-hover:text-dark-400" />}
                  </div>
                </th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedData.length > 0 ? (
                sortedData.map((item) => {
                  const isLow = item.quantity <= item.minLevel;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={`transition-all cursor-pointer ${isLow ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-white/5'}`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{item.name}</div>
                        <div className="text-xs text-dark-500 font-mono">#{item.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${
                          item.category === Category.HOUSEKEEPING
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                            : 'bg-accent-500/20 text-accent-400 border border-accent-500/20'
                        }`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-white">{item.quantity}</span>
                        <span className="text-dark-400 text-xs ml-1">{item.unit}</span>
                      </td>
                      <td className="px-6 py-4">
                        {isLow ? (
                          <span className="flex items-center gap-1.5 text-red-400 text-xs font-medium">
                            <AlertTriangle size={14} className="animate-pulse" />
                            Low (Min: {item.minLevel})
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/20">
                            In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Package className="mx-auto text-dark-500 mb-3" size={40} />
                    <p className="text-dark-400">No items found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedItem(null)}>
          <div
            className="glass-card rounded-2xl w-full max-w-md overflow-hidden shadow-glass-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-accent-600 px-6 py-5 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedItem.name}</h3>
                <span className="text-xs font-mono text-primary-200">#{selectedItem.id}</span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Stock Card */}
              <div className={`p-5 rounded-xl ${selectedItem.quantity <= selectedItem.minLevel ? 'bg-red-500/10 border border-red-500/20' : 'bg-green-500/10 border border-green-500/20'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-grow">
                    <p className="text-sm text-dark-400 font-medium mb-2">Current Stock</p>
                    {isEditing ? (
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          value={editQty}
                          onChange={(e) => setEditQty(e.target.value)}
                          className="w-24 p-2 input-glass rounded-lg text-white font-bold text-xl"
                          autoFocus
                        />
                        <span className="text-dark-400">{selectedItem.unit}</span>
                        <button
                          onClick={handleSaveQuantity}
                          disabled={isSaving}
                          className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                        >
                          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                        </button>
                        <button
                          onClick={() => { setIsEditing(false); setEditQty(selectedItem.quantity.toString()); }}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-white">{selectedItem.quantity}</span>
                        <span className="text-dark-400">{selectedItem.unit}</span>
                        <button
                          onClick={() => { setIsEditing(true); setEditQty(selectedItem.quantity.toString()); }}
                          className="p-2 text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className={`p-4 rounded-xl ${selectedItem.quantity <= selectedItem.minLevel ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    {selectedItem.quantity <= selectedItem.minLevel ? <AlertTriangle size={28} /> : <Package size={28} />}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass rounded-xl p-4">
                  <p className="text-xs text-dark-500 uppercase font-bold mb-2">Category</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${
                    selectedItem.category === Category.HOUSEKEEPING
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-accent-500/20 text-accent-400'
                  }`}>
                    {selectedItem.category}
                  </span>
                </div>
                <div className="glass rounded-xl p-4">
                  <p className="text-xs text-dark-500 uppercase font-bold mb-2">Min Level</p>
                  <p className="font-semibold text-white">{selectedItem.minLevel} {selectedItem.unit}</p>
                </div>
              </div>

              {/* Status */}
              <div className="text-center">
                {selectedItem.quantity <= selectedItem.minLevel ? (
                  <p className="text-red-400 text-sm font-medium flex items-center justify-center gap-2">
                    <AlertTriangle size={16} />
                    Stock below minimum. Please reorder.
                  </p>
                ) : (
                  <p className="text-green-400 text-sm font-medium flex items-center justify-center gap-2">
                    <Activity size={16} />
                    Stock levels are healthy
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-0">
              <button
                onClick={() => setSelectedItem(null)}
                className="w-full py-3 glass rounded-xl text-dark-300 hover:text-white font-medium transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InventoryTable;

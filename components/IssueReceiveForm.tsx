import React, { useState, useEffect } from 'react';
import { TransactionType, InventoryItem, FloorLocation } from '../types';
import { submitTransaction } from '../services/sheetService';
import { CheckCircle, AlertCircle, Loader2, ArrowUpRight, ArrowDownLeft, Package } from 'lucide-react';

interface Props {
  type: TransactionType;
  inventory: InventoryItem[];
  onSuccess: () => void;
}

const IssueReceiveForm: React.FC<Props> = ({ type, inventory, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: '',
    unit: '',
    location: '',
    personName: '',
    notes: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (formData.itemName) {
      const item = inventory.find(i => i.name === formData.itemName);
      if (item) {
        setFormData(prev => ({ ...prev, unit: item.unit }));
      }
    }
  }, [formData.itemName, inventory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const selectedItem = inventory.find(i => i.name === formData.itemName);
    if (type === TransactionType.ISSUE) {
       if (!selectedItem) {
         setMessage({ type: 'error', text: 'Please select a valid item.' });
         setLoading(false);
         return;
       }
       if (selectedItem.quantity < Number(formData.quantity)) {
         setMessage({ type: 'error', text: `Insufficient stock! Only ${selectedItem.quantity} ${selectedItem.unit} available.` });
         setLoading(false);
         return;
       }
    }

    const success = await submitTransaction({
      type,
      itemName: formData.itemName,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      location: formData.location,
      personName: formData.personName,
      notes: formData.notes
    });

    if (success) {
      setMessage({ type: 'success', text: 'Transaction recorded successfully!' });
      setFormData({ itemName: '', quantity: '', unit: '', location: '', personName: '', notes: '' });
      onSuccess();
    } else {
      setMessage({ type: 'error', text: 'Failed to record transaction. Check connection.' });
    }
    setLoading(false);
  };

  const isIssue = type === TransactionType.ISSUE;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass-card rounded-2xl overflow-hidden">
        {/* Header */}
        <div className={`px-8 py-6 ${isIssue ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`}>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              {isIssue ? <ArrowUpRight size={28} className="text-white" /> : <ArrowDownLeft size={28} className="text-white" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isIssue ? 'Issue Item (Stock Out)' : 'Receive Item (Stock In)'}
              </h2>
              <p className="text-white/80 text-sm mt-1">
                {isIssue ? 'Distribute items to Satyam Mall floors' : 'Add new stock to the inventory'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Item Selection */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Item Name</label>
            {isIssue ? (
              <select
                required
                className="w-full p-4 input-glass rounded-xl text-white appearance-none cursor-pointer"
                value={formData.itemName}
                onChange={(e) => setFormData({...formData, itemName: e.target.value})}
              >
                <option value="" className="bg-dark-900">Select Item</option>
                {inventory.map(item => (
                  <option key={item.id} value={item.name} className="bg-dark-900">
                    {item.name} (Available: {item.quantity} {item.unit})
                  </option>
                ))}
              </select>
            ) : (
              <div className="relative">
                <Package className="absolute left-4 top-4 text-dark-400" size={20} />
                <input
                  type="text"
                  required
                  list="item-suggestions"
                  placeholder="Enter Item Name"
                  className="w-full pl-12 pr-4 py-4 input-glass rounded-xl text-white"
                  value={formData.itemName}
                  onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                />
                <datalist id="item-suggestions">
                  {inventory.map(item => <option key={item.id} value={item.name} />)}
                </datalist>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Quantity</label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                placeholder="0.00"
                className="w-full p-4 input-glass rounded-xl text-white"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              />
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Unit</label>
              <input
                type="text"
                required
                placeholder="e.g. pcs, kg"
                className={`w-full p-4 input-glass rounded-xl text-white ${isIssue ? 'opacity-60' : ''}`}
                value={formData.unit}
                readOnly={isIssue}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                {isIssue ? 'Destination' : 'Storage Location'}
              </label>
              <select
                required
                className="w-full p-4 input-glass rounded-xl text-white appearance-none cursor-pointer"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              >
                <option value="" className="bg-dark-900">Select</option>
                {Object.values(FloorLocation).map(loc => (
                  <option key={loc} value={loc} className="bg-dark-900">{loc}</option>
                ))}
                {!isIssue && <option value="Vendor" className="bg-dark-900">Vendor</option>}
              </select>
            </div>
          </div>

          {/* Person */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              {isIssue ? 'Receiver Name (Staff)' : 'Supplier / Deliverer Name'}
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul (HK Supervisor)"
              className="w-full p-4 input-glass rounded-xl text-white"
              value={formData.personName}
              onChange={(e) => setFormData({...formData, personName: e.target.value})}
            />
          </div>

          {/* Status Message */}
          {message && (
            <div className={`p-4 rounded-xl flex items-center space-x-3 ${
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}>
              {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg transition-all duration-300
              ${isIssue
                ? 'btn-glossy-warning'
                : 'btn-glossy-success'}
              disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2
            `}
          >
            {loading ? <Loader2 className="animate-spin" size={22} /> : null}
            {isIssue ? 'CONFIRM ISSUE' : 'CONFIRM RECEIPT'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IssueReceiveForm;

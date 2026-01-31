import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { Download, FileText, Filter, Calendar, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Props {
  transactions: Transaction[];
}

const Reports: React.FC<Props> = ({ transactions }) => {
  const [filterType, setFilterType] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesType = filterType === 'All' || t.type === filterType;

      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && new Date(t.date) >= new Date(startDate);
      }
      if (endDate) {
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        matchesDate = matchesDate && new Date(t.date) < nextDay;
      }

      return matchesType && matchesDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterType, startDate, endDate]);

  const downloadExcel = () => {
    const headers = ["Date", "Type", "Item Name", "Quantity", "Unit", "Location", "Person", "Notes"];
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map(t => {
        const safeName = `"${t.itemName.replace(/"/g, '""')}"`;
        const safePerson = `"${t.personName.replace(/"/g, '""')}"`;
        const safeNotes = t.notes ? `"${t.notes.replace(/"/g, '""')}"` : "";
        return [
          new Date(t.date).toLocaleDateString(),
          t.type,
          safeName,
          t.quantity,
          t.unit || '',
          t.location,
          safePerson,
          safeNotes
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `satyam_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Satyam Mall - Inventory Report", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    const dateStr = `Generated on: ${new Date().toLocaleDateString()} | Filter: ${filterType}`;
    doc.text(dateStr, 14, 30);

    const tableColumn = ["Date", "Type", "Item", "Qty", "Loc", "Person"];
    const tableRows = filteredTransactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.type,
      t.itemName,
      `${t.quantity} ${t.unit || ''}`,
      t.location,
      t.personName
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [99, 102, 241] }
    });

    doc.save(`satyam_report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <FileText className="text-primary-400" size={28} />
                Transaction Reports
              </h2>
              <p className="text-sm text-dark-400 mt-1">View and download history of Issues and Receipts</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={downloadExcel}
                className="flex items-center gap-2 px-5 py-2.5 btn-glossy-success rounded-xl text-white font-medium"
              >
                <FileText size={18} />
                Excel
              </button>
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 px-5 py-2.5 btn-glossy-danger rounded-xl text-white font-medium"
              >
                <Download size={18} />
                PDF
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-dark-400 uppercase mb-2">Transaction Type</label>
              <div className="relative">
                <Filter className="absolute left-4 top-3 text-dark-400" size={16} />
                <select
                  className="w-full pl-11 pr-4 py-2.5 input-glass rounded-xl text-white text-sm appearance-none cursor-pointer"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="All" className="bg-dark-900">All Types</option>
                  <option value={TransactionType.ISSUE} className="bg-dark-900">Issue (Out)</option>
                  <option value={TransactionType.RECEIVE} className="bg-dark-900">Receive (In)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-dark-400 uppercase mb-2">From Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3 text-dark-400" size={16} />
                <input
                  type="date"
                  className="w-full pl-11 pr-4 py-2.5 input-glass rounded-xl text-white text-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-dark-400 uppercase mb-2">To Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3 text-dark-400" size={16} />
                <input
                  type="date"
                  className="w-full pl-11 pr-4 py-2.5 input-glass rounded-xl text-white text-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => { setFilterType('All'); setStartDate(''); setEndDate(''); }}
                className="w-full py-2.5 glass rounded-xl text-dark-300 hover:text-white text-sm font-medium transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-dark-300 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Person</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-dark-400 whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                        t.type === TransactionType.RECEIVE
                          ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                          : 'bg-orange-500/20 text-orange-400 border border-orange-500/20'
                      }`}>
                        {t.type === TransactionType.RECEIVE ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                        {t.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{t.itemName}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-white">{t.quantity}</span>
                      <span className="text-dark-400 text-xs ml-1">{t.unit}</span>
                    </td>
                    <td className="px-6 py-4 text-dark-300">{t.location}</td>
                    <td className="px-6 py-4 text-dark-300">{t.personName}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <FileText className="mx-auto text-dark-500 mb-3" size={40} />
                    <p className="text-dark-400">No transactions found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-right">
          <span className="text-xs text-dark-500">
            Showing {filteredTransactions.length} records
          </span>
        </div>
      </div>
    </div>
  );
};

export default Reports;

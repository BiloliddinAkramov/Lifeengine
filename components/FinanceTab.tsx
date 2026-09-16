import React, { useState } from 'react';
import { AppState, ExpenseRecord } from '../types';
import { t } from '../services/translations';

interface FinanceTabProps {
  data: AppState;
  updateData: (updater: (prev: AppState) => AppState) => void;
  range: 7 | 15 | 30;
  lang: 'uz' | 'ru' | 'en';
}

export const FinanceTab: React.FC<FinanceTabProps> = ({
  data,
  updateData,
  range,
  lang
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [transType, setTransType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Oziq-ovqat');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');

  const records = Array.isArray(data?.expenseRecords) ? data.expenseRecords : [];

  // Filter records by selected range (days)
  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (range || 30));
  cutoff.setHours(0, 0, 0, 0);

  const rangeRecords = records.filter(rec => {
    if (!rec.date) return true;
    const d = new Date(rec.date);
    return isNaN(d.getTime()) || d >= cutoff;
  });

  // Calculate totals from actual transactions in range
  const totalIncome = rangeRecords
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const totalExpense = rangeRecords
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const netSavings = totalIncome - totalExpense;

  // Filter for display
  const displayedRecords = rangeRecords.filter(r => {
    if (filterType === 'all') return true;
    return r.type === filterType;
  });

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    const newRecord: ExpenseRecord = {
      id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      amount: numAmount,
      category: category || (transType === 'income' ? 'Daromad' : 'Xarajat'),
      description: description.trim() || (transType === 'income' ? 'Kirim amali' : 'Chiqim amali'),
      date: date || new Date().toISOString().split('T')[0],
      type: transType
    };

    updateData(prev => {
      const prevIncome = Array.isArray(prev.financeIncome) ? [...prev.financeIncome] : Array(30).fill(0);
      const prevExpenses = Array.isArray(prev.financeExpenses) ? [...prev.financeExpenses] : Array(30).fill(0);

      // Pad to 30 days if needed
      while (prevIncome.length < 30) prevIncome.push(0);
      while (prevExpenses.length < 30) prevExpenses.push(0);

      const dayIdx = 0; // Today index
      if (transType === 'income') {
        prevIncome[dayIdx] = (prevIncome[dayIdx] || 0) + numAmount;
      } else {
        prevExpenses[dayIdx] = (prevExpenses[dayIdx] || 0) + numAmount;
      }

      return {
        ...prev,
        financeIncome: prevIncome,
        financeExpenses: prevExpenses,
        expenseRecords: [newRecord, ...(Array.isArray(prev.expenseRecords) ? prev.expenseRecords : [])]
      };
    });

    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setShowAddModal(false);
  };

  const handleDeleteTransaction = (id: string) => {
    updateData(prev => {
      const updated = (prev.expenseRecords || []).filter(r => r.id !== id);
      return {
        ...prev,
        expenseRecords: updated
      };
    });
  };

  const categories = transType === 'expense' 
    ? ['Oziq-ovqat', 'Transport', 'Uy-joy', 'Ta\'lim', 'Kiyim', 'Sog\'liq', 'Kafelar', 'Aloqa', 'Texnika', 'Boshqa']
    : ['Oylik ish haqi', 'Freelance', 'Biznes', 'Investitsiya', 'Sovg\'a', 'Boshqa'];

  const currencySymbol = data.currency || 'UZS';

  return (
    <div className="max-w-4xl mx-auto animate-slide-up space-y-6">
      {/* Banner / Summary */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sm">
              <i className="fas fa-wallet text-amber-200"></i>
            </span>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-100">
              Shaxsiy Moliya Balansi
            </h3>
          </div>
          <span className="text-[10px] bg-white/20 px-3 py-1.5 rounded-xl font-black uppercase tracking-wider backdrop-blur-sm">
            {range} kunlik
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-amber-100 block mb-1">
              <i className="fas fa-arrow-down mr-1 text-emerald-300"></i> Jami daromad
            </span>
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
              +{totalIncome.toLocaleString()} {currencySymbol}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-amber-100 block mb-1">
              <i className="fas fa-arrow-up mr-1 text-rose-300"></i> Jami xarajat
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-100 tracking-tight">
              -{totalExpense.toLocaleString()} {currencySymbol}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-amber-100 block mb-1">
              <i className="fas fa-scale-balanced mr-1"></i> Sof jamg'arma
            </span>
            <span className={`text-xl sm:text-2xl font-black tracking-tight ${netSavings >= 0 ? 'text-emerald-300' : 'text-rose-200'}`}>
              {netSavings >= 0 ? '+' : ''}{netSavings.toLocaleString()} {currencySymbol}
            </span>
          </div>
        </div>
      </div>

      {/* Action Header & Quick Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl self-start">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              filterType === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Barchasi ({rangeRecords.length})
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              filterType === 'expense'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-rose-500'
            }`}
          >
            Xarajatlar
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              filterType === 'income'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-emerald-600'
            }`}
          >
            Daromadlar
          </button>
        </div>

        <button
          onClick={() => {
            setTransType('expense');
            setCategory('Oziq-ovqat');
            setAmount('');
            setDescription('');
            setDate(new Date().toISOString().split('T')[0]);
            setShowAddModal(true);
          }}
          className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-600/25 transition-all flex items-center justify-center gap-2 min-h-[42px]"
        >
          <i className="fas fa-plus text-xs"></i>
          <span>Yangi Amal Qo'shish</span>
        </button>
      </div>

      {/* Transactions List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm">
        {displayedRecords.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-2xl">
              <i className="fas fa-receipt"></i>
            </div>
            <p className="text-xs font-black text-slate-700 dark:text-slate-300">
              Bu oraliqda moliyaviy amallar topilmadi
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Yuqoridagi "Yangi Amal Qo'shish" tugmasi orqali xarajat yoki daromadingizni yozib boring.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayedRecords.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 hover:border-slate-200 dark:hover:border-slate-600 transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${
                    item.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}>
                    <i className={`fas ${item.type === 'income' ? 'fa-arrow-down' : 'fa-arrow-up'} text-xs`}></i>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                      {item.description}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span className="text-slate-500 dark:text-slate-400">{item.category}</span>
                      <span>•</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs sm:text-sm font-black ${
                    item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {item.type === 'income' ? '+' : '-'}{Number(item.amount).toLocaleString()} {currencySymbol}
                  </span>

                  <button
                    onClick={() => handleDeleteTransaction(item.id)}
                    title="O'chirish"
                    className="w-8 h-8 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-all opacity-70 group-hover:opacity-100"
                  >
                    <i className="fas fa-trash-alt text-xs"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for New Transaction */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Yangi Moliyaviy Amal
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center text-sm"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Type selector */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-5">
              <button
                type="button"
                onClick={() => {
                  setTransType('expense');
                  setCategory('Oziq-ovqat');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
                  transType === 'expense' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400'
                }`}
              >
                <i className="fas fa-arrow-up mr-1.5 text-xs"></i>
                Xarajat
              </button>
              <button
                type="button"
                onClick={() => {
                  setTransType('income');
                  setCategory('Oylik ish haqi');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
                  transType === 'income' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400'
                }`}
              >
                <i className="fas fa-arrow-down mr-1.5 text-xs"></i>
                Daromad
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Miqdor ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="Masalan: 50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Kategoriya
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white focus:border-amber-500"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Sana
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Izoh (ixtiyoriy)
                </label>
                <input
                  type="text"
                  placeholder="Masalan: Bozorlik, kofe, tushlik..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-[46px] py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black uppercase text-xs tracking-wider shadow-lg shadow-amber-600/25 active:scale-95 transition-all mt-3"
              >
                Saqlash
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

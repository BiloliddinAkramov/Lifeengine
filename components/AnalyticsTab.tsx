import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';
import { AppState, User, ExpenseRecord, MatrixItem } from '../types';

interface AnalyticsTabProps {
  data: AppState;
  user: User;
  range: 7 | 15 | 30;
  updateData: (updater: (prev: AppState) => AppState) => void;
  lang: 'uz' | 'ru' | 'en';
}

type AnalyticsCategory = 'all' | 'sleep' | 'finance' | 'habits' | 'tasks';

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  data,
  user,
  range,
  updateData,
  lang
}) => {
  const [activeCategory, setActiveCategory] = useState<AnalyticsCategory>('all');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const currencySymbol = data?.currency || 'UZS';

  // --- 1. TASKS DATA & METRICS ---
  const tasksList = useMemo(() => Array.isArray(data?.tasks) ? data.tasks : [], [data?.tasks]);
  const tasksDailyCounts = useMemo(() => {
    return Array.from({ length: range }, (_, i) => 
      tasksList.filter(t => Array.isArray(t?.data) && Boolean(t.data[i])).length
    );
  }, [tasksList, range]);

  const totalTasksCompleted = useMemo(() => {
    return tasksDailyCounts.reduce((acc, count) => acc + count, 0);
  }, [tasksDailyCounts]);

  const tasksEfficiency = useMemo(() => {
    const maxPossible = tasksList.length * range;
    return maxPossible > 0 ? Math.round((totalTasksCompleted / maxPossible) * 100) : 0;
  }, [tasksList.length, range, totalTasksCompleted]);

  const peakTaskDay = useMemo(() => {
    let max = -1;
    let dayIdx = 0;
    tasksDailyCounts.forEach((c, idx) => {
      if (c > max) {
        max = c;
        dayIdx = idx;
      }
    });
    return { day: dayIdx + 1, count: Math.max(0, max) };
  }, [tasksDailyCounts]);

  // --- 2. HABITS DATA & METRICS ---
  const habitsList = useMemo(() => Array.isArray(data?.habits) ? data.habits : [], [data?.habits]);
  const habitsDailyCounts = useMemo(() => {
    return Array.from({ length: range }, (_, i) => 
      habitsList.filter(h => Array.isArray(h?.data) && Boolean(h.data[i])).length
    );
  }, [habitsList, range]);

  const totalHabitsCompleted = useMemo(() => {
    return habitsDailyCounts.reduce((acc, count) => acc + count, 0);
  }, [habitsDailyCounts]);

  const habitsConsistency = useMemo(() => {
    const maxPossible = habitsList.length * range;
    return maxPossible > 0 ? Math.round((totalHabitsCompleted / maxPossible) * 100) : 0;
  }, [habitsList.length, range, totalHabitsCompleted]);

  // Best habit
  const habitRankings = useMemo(() => {
    return habitsList.map(h => {
      const arr = Array.isArray(h?.data) ? h.data : [];
      const doneCount = arr.slice(0, range).filter(Boolean).length;
      const rate = Math.round((doneCount / (range || 1)) * 100);
      return {
        id: h.id,
        name: h.name || 'Nomsiz odat',
        doneCount,
        rate
      };
    }).sort((a, b) => b.rate - a.rate);
  }, [habitsList, range]);

  // --- 3. SLEEP DATA & METRICS ---
  const sleepHoursList = useMemo(() => {
    const list = Array.isArray(data?.sleepHours) && data.sleepHours.length > 0 
      ? data.sleepHours 
      : [7.5, 8.0, 7.0, 6.5, 8.5, 7.5, 7.0, 8.0, 6.0, 7.5, 8.0, 7.0, 7.5, 8.5, 7.0, 7.5, 8.0, 6.5, 7.5, 8.0, 7.0, 6.5, 8.0, 7.5, 8.0, 7.0, 7.5, 8.0, 7.5, 8.0];
    return list.slice(0, range);
  }, [data?.sleepHours, range]);

  const avgSleepHours = useMemo(() => {
    if (sleepHoursList.length === 0) return 7.5;
    const sum = sleepHoursList.reduce((acc, val) => acc + val, 0);
    return Number((sum / sleepHoursList.length).toFixed(1));
  }, [sleepHoursList]);

  const optimalSleepDaysCount = useMemo(() => {
    return sleepHoursList.filter(h => h >= 7 && h <= 9).length;
  }, [sleepHoursList]);

  const sleepSchedule = useMemo(() => {
    const schedules = Array.isArray(data?.sleepSchedules) ? data.sleepSchedules : [];
    return schedules[0] || { bedTime: '23:00', wakeTime: '06:30', quality: 85 };
  }, [data?.sleepSchedules]);

  // --- 4. FINANCE DATA & METRICS ---
  const records = useMemo(() => Array.isArray(data?.expenseRecords) ? data.expenseRecords : [], [data?.expenseRecords]);
  
  const rangeRecords = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (range || 30));
    cutoff.setHours(0, 0, 0, 0);

    return records.filter(rec => {
      if (!rec.date) return true;
      const d = new Date(rec.date);
      return isNaN(d.getTime()) || d >= cutoff;
    });
  }, [records, range]);

  const totalIncome = useMemo(() => {
    return rangeRecords
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  }, [rangeRecords]);

  const totalExpense = useMemo(() => {
    return rangeRecords
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  }, [rangeRecords]);

  const netSavings = totalIncome - totalExpense;

  const categoryExpenses = useMemo(() => {
    const map: Record<string, number> = {};
    rangeRecords
      .filter(r => r.type === 'expense')
      .forEach(r => {
        const cat = r.category || 'Boshqa';
        map[cat] = (map[cat] || 0) + (Number(r.amount) || 0);
      });

    return Object.entries(map)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [rangeRecords, totalExpense]);

  // Daily finance distribution across range days
  const dailyFinance = useMemo(() => {
    // Generate daily breakdown for the chart
    const now = new Date();
    return Array.from({ length: range }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (range - 1 - i));
      const dateStr = d.toISOString().split('T')[0];

      const dayExpenses = rangeRecords
        .filter(r => r.type === 'expense' && r.date === dateStr)
        .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

      const dayIncome = rangeRecords
        .filter(r => r.type === 'income' && r.date === dateStr)
        .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

      return {
        day: `${i + 1}-kun`,
        date: dateStr,
        expense: dayExpenses,
        income: dayIncome
      };
    });
  }, [range, rangeRecords]);

  // --- COMBINED CHART DATA ---
  const overallChartData = useMemo(() => {
    return Array.from({ length: range }, (_, i) => {
      const day = i + 1;
      const tasksDone = tasksDailyCounts[i] || 0;
      const habitsDone = habitsDailyCounts[i] || 0;
      const sleepH = sleepHoursList[i] !== undefined ? sleepHoursList[i] : 7.0;

      return {
        day: `${day}-kun`,
        tasks: tasksDone,
        habits: habitsDone,
        sleep: sleepH
      };
    });
  }, [range, tasksDailyCounts, habitsDailyCounts, sleepHoursList]);

  // Overall Score (0-100)
  const lifeEngineScore = useMemo(() => {
    const tScore = tasksEfficiency;
    const hScore = habitsConsistency;
    const sScore = Math.min(100, Math.round((avgSleepHours / 8) * 100));
    return Math.round((tScore * 0.35) + (hScore * 0.40) + (sScore * 0.25));
  }, [tasksEfficiency, habitsConsistency, avgSleepHours]);

  // Category Tabs Configuration
  const categoriesList: { id: AnalyticsCategory; label: string; icon: string; count?: number | string; color: string }[] = [
    { id: 'all', label: 'Barchasi', icon: 'fa-layer-group', color: 'blue' },
    { id: 'sleep', label: 'Uyqu', icon: 'fa-moon', count: `${avgSleepHours}s`, color: 'indigo' },
    { id: 'finance', label: 'Moliya', icon: 'fa-wallet', count: `${(netSavings >= 0 ? '+' : '') + Math.round(netSavings / 1000)}k`, color: 'amber' },
    { id: 'habits', label: 'Odatlar', icon: 'fa-leaf', count: `${habitsConsistency}%`, color: 'emerald' },
    { id: 'tasks', label: 'Vazifalar', icon: 'fa-check-double', count: `${tasksEfficiency}%`, color: 'sky' }
  ];

  return (
    <div className="max-w-4xl mx-auto animate-slide-up space-y-4 sm:space-y-6 pb-12">
      {/* 1. Category Switcher (Horizontal scrollable pill tabs for mobile) */}
      <div className="flex items-center justify-between gap-2 px-0.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 w-full sm:w-auto">
          {categoriesList.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 active:scale-95 ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md shadow-slate-900/10'
                    : 'bg-white dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700/80'
                }`}
              >
                <i className={`fas ${cat.icon} text-[11px]`}></i>
                <span>{cat.label}</span>
                {cat.count && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isActive 
                      ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Chart View Toggle (Area / Bar) */}
        <div className="hidden sm:flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setChartType('area')}
            className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition-all ${
              chartType === 'area'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Chiziqli
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition-all ${
              chartType === 'bar'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Ustunli
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: BARCHASI (OVERALL LIFE ENGINE DASHBOARD) */}
      {/* ========================================================================= */}
      {activeCategory === 'all' && (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
          {/* Top 4 Stat Metric Cards (Compact & Responsive on Phones) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Vazifalar</span>
                <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs">
                  <i className="fas fa-check"></i>
                </span>
              </div>
              <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                {tasksEfficiency}%
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 font-bold truncate">
                {totalTasksCompleted} ta bajarildi
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Odatlar</span>
                <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs">
                  <i className="fas fa-leaf"></i>
                </span>
              </div>
              <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                {habitsConsistency}%
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 font-bold truncate">
                {totalHabitsCompleted} ta odat qaydi
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Uyqu</span>
                <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-xs">
                  <i className="fas fa-moon"></i>
                </span>
              </div>
              <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                {avgSleepHours} <span className="text-xs font-bold text-slate-400">soat</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 font-bold truncate">
                {optimalSleepDaysCount} kun me'yorda
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Sof Jamg'arma</span>
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${netSavings >= 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  <i className="fas fa-wallet"></i>
                </span>
              </div>
              <div className={`text-sm sm:text-lg font-black truncate ${netSavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                {netSavings >= 0 ? '+' : ''}{netSavings.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 font-bold truncate">
                {currencySymbol}
              </p>
            </div>
          </div>

          {/* Main Chart */}
          <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-150 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Umumiy Rivojlanish Dinamikasi
                </h3>
                <p className="text-[10px] text-slate-400 font-bold">
                  {range} kunlik vazifalar va odatlar nisbati
                </p>
              </div>

              {/* Mobile chart type selector */}
              <div className="flex sm:hidden bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                <button
                  onClick={() => setChartType('area')}
                  className={`px-2 py-0.5 text-[9px] font-black rounded ${chartType === 'area' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}
                >
                  Chiziq
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-2 py-0.5 text-[9px] font-black rounded ${chartType === 'bar' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}
                >
                  Ustun
                </button>
              </div>
            </div>

            <div className="h-64 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart data={overallChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTasksAll" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorHabitsAll" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
                    <XAxis 
                      dataKey="day" 
                      stroke="#94a3b8" 
                      fontSize={9} 
                      tickLine={false} 
                      axisLine={false}
                      interval={Math.max(1, Math.floor(range / 7))}
                    />
                    <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderRadius: '12px', 
                        border: '1px solid #1e293b', 
                        color: '#fff',
                        fontSize: '11px' 
                      }} 
                    />
                    <Area type="monotone" dataKey="tasks" name="Vazifalar" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorTasksAll)" />
                    <Area type="monotone" dataKey="habits" name="Odatlar" stroke="#10b981" strokeWidth={2.5} fill="url(#colorHabitsAll)" />
                  </AreaChart>
                ) : (
                  <BarChart data={overallChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
                    <XAxis 
                      dataKey="day" 
                      stroke="#94a3b8" 
                      fontSize={9} 
                      tickLine={false} 
                      axisLine={false}
                      interval={Math.max(1, Math.floor(range / 7))}
                    />
                    <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderRadius: '12px', 
                        border: '1px solid #1e293b', 
                        color: '#fff',
                        fontSize: '11px' 
                      }} 
                    />
                    <Bar dataKey="tasks" name="Vazifalar" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="habits" name="Odatlar" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Minimal Legend */}
            <div className="flex items-center justify-center gap-5 pt-1 text-[11px] font-bold">
              <div className="flex items-center gap-1.5 text-blue-500">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span>Vazifalar</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Odatlar</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: UYQU ANALITIKASI (SLEEP ANALYTICS) */}
      {/* ========================================================================= */}
      {activeCategory === 'sleep' && (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
          {/* Sleep KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-indigo-50/60 dark:bg-indigo-950/20 p-3.5 sm:p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block mb-1">
                O'rtacha Uyqu
              </span>
              <div className="text-xl sm:text-2xl font-black text-indigo-700 dark:text-indigo-300">
                {avgSleepHours} <span className="text-xs text-indigo-400">soat</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                Me'yor: 7.0 - 8.5 soat
              </span>
            </div>

            <div className="bg-indigo-50/60 dark:bg-indigo-950/20 p-3.5 sm:p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block mb-1">
                Ideal Kunlar
              </span>
              <div className="text-xl sm:text-2xl font-black text-indigo-700 dark:text-indigo-300">
                {optimalSleepDaysCount} / {range}
              </div>
              <span className="text-[10px] font-bold text-emerald-500">
                {Math.round((optimalSleepDaysCount / range) * 100)}% barqarorlik
              </span>
            </div>

            <div className="bg-indigo-50/60 dark:bg-indigo-950/20 p-3.5 sm:p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block mb-1">
                Belgilangan Reja
              </span>
              <div className="text-base sm:text-lg font-black text-indigo-700 dark:text-indigo-300">
                {sleepSchedule.bedTime} → {sleepSchedule.wakeTime}
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                Kutilgan grafik
              </span>
            </div>

            <div className="bg-indigo-50/60 dark:bg-indigo-950/20 p-3.5 sm:p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block mb-1">
                Uyqu Sifati
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {sleepSchedule.quality || 85}%
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                Bio-ritm indeksi
              </span>
            </div>
          </div>

          {/* Sleep Hours Chart */}
          <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-150 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Kunlik Uyqu Davomiyligi (Soatlarda)
                </h3>
                <p className="text-[10px] text-slate-400 font-bold">
                  Sariq nuqta: 8 soatlik ideal me'yor
                </p>
              </div>
            </div>

            <div className="h-64 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overallChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSleepHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    stroke="#94a3b8" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false}
                    interval={Math.max(1, Math.floor(range / 7))}
                  />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} domain={[0, 12]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderRadius: '12px', 
                      border: '1px solid #1e293b', 
                      color: '#fff',
                      fontSize: '11px' 
                    }} 
                    formatter={(val: any) => [`${val} soat`, 'Uyqu']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sleep" 
                    name="Uyqu" 
                    stroke="#6366f1" 
                    strokeWidth={3} 
                    fill="url(#colorSleepHours)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Sleep Breakdown List */}
          <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-150 dark:border-slate-800 shadow-sm space-y-2.5">
            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
              {range} kunlik uyqu qaydnomalari
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {sleepHoursList.map((hours, idx) => {
                const isOptimal = hours >= 7 && hours <= 9;
                const isLess = hours < 7;
                return (
                  <div 
                    key={idx}
                    className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-black text-slate-400 block">{idx + 1}-kun</span>
                      <span className="text-xs font-black text-slate-800 dark:text-white">{hours} soat</span>
                    </div>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                      isOptimal 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : isLess 
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                          : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    }`}>
                      {isOptimal ? 'Optimal' : isLess ? 'Kam' : "Ko'p"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: MOLIYA ANALITIKASI (FINANCE ANALYTICS) */}
      {/* ========================================================================= */}
      {activeCategory === 'finance' && (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
          {/* Finance KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-3.5 sm:p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 block mb-1">
                Jami Daromad
              </span>
              <div className="text-base sm:text-xl font-black text-emerald-600 dark:text-emerald-400 truncate">
                +{totalIncome.toLocaleString()}
              </div>
              <span className="text-[10px] font-bold text-slate-400">{currencySymbol}</span>
            </div>

            <div className="bg-rose-50/60 dark:bg-rose-950/20 p-3.5 sm:p-4 rounded-2xl border border-rose-100 dark:border-rose-900/40">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 block mb-1">
                Jami Xarajat
              </span>
              <div className="text-base sm:text-xl font-black text-rose-600 dark:text-rose-400 truncate">
                -{totalExpense.toLocaleString()}
              </div>
              <span className="text-[10px] font-bold text-slate-400">{currencySymbol}</span>
            </div>

            <div className="bg-amber-50/60 dark:bg-amber-950/20 p-3.5 sm:p-4 rounded-2xl border border-amber-100 dark:border-amber-900/40">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 block mb-1">
                Sof Qoldiq
              </span>
              <div className={`text-base sm:text-xl font-black truncate ${netSavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                {netSavings >= 0 ? '+' : ''}{netSavings.toLocaleString()}
              </div>
              <span className="text-[10px] font-bold text-slate-400">{currencySymbol}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Kunlik O'rtacha
              </span>
              <div className="text-base sm:text-xl font-black text-slate-800 dark:text-white truncate">
                {Math.round(totalExpense / (range || 1)).toLocaleString()}
              </div>
              <span className="text-[10px] font-bold text-slate-400">{currencySymbol}/kun</span>
            </div>
          </div>

          {/* Daily Income vs Expense Bar Chart */}
          <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-150 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              {range} Kunlik Daromad va Xarajat Oqimi
            </h3>

            <div className="h-64 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyFinance} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    stroke="#94a3b8" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false}
                    interval={Math.max(1, Math.floor(range / 7))}
                  />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderRadius: '12px', 
                      border: '1px solid #1e293b', 
                      color: '#fff',
                      fontSize: '11px' 
                    }} 
                    formatter={(val: any) => [`${Number(val).toLocaleString()} ${currencySymbol}`]}
                  />
                  <Bar dataKey="income" name="Daromad" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Xarajat" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 pt-1 text-[11px] font-bold">
              <div className="flex items-center gap-1.5 text-emerald-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Daromadlar</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-500">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Xarajatlar</span>
              </div>
            </div>
          </div>

          {/* Category Breakdown Progress Bars */}
          <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-150 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
              Xarajatlarning Toifalar Bo'yicha Taqsimoti
            </h4>

            {categoryExpenses.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                Tanlangan davrda xarajatlar mavjud emas
              </p>
            ) : (
              <div className="space-y-2.5">
                {categoryExpenses.map((cat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300">{cat.name}</span>
                      <span className="text-slate-900 dark:text-white font-black">
                        {cat.amount.toLocaleString()} {currencySymbol} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(5, cat.percentage))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: ODATLAR ANALITIKASI (HABITS ANALYTICS) */}
      {/* ========================================================================= */}
      {activeCategory === 'habits' && (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
          {/* Habits KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-3.5 sm:p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 block mb-1">
                Barqarorlik
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {habitsConsistency}%
              </div>
              <span className="text-[10px] font-bold text-slate-400">Umumiy intizom</span>
            </div>

            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-3.5 sm:p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 block mb-1">
                Jami Bajarildi
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {totalHabitsCompleted} <span className="text-xs font-bold text-slate-400">marta</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">{range} kun ichida</span>
            </div>

            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-3.5 sm:p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 block mb-1">
                Odatlar Soni
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {habitsList.length} <span className="text-xs font-bold text-slate-400">ta</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">Faol monitoringda</span>
            </div>

            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-3.5 sm:p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 block mb-1">
                Eng Yaxshi Odat
              </span>
              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                {habitRankings[0]?.name || "Yo'q"}
              </div>
              <span className="text-[10px] font-bold text-emerald-500">
                {habitRankings[0]?.rate || 0}% bajarilish
              </span>
            </div>
          </div>

          {/* Habits Daily Trend Chart */}
          <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-150 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Kunlik Odatlar Bajarilishi Dinamikasi
            </h3>

            <div className="h-64 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overallChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHabitsOnly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    stroke="#94a3b8" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false}
                    interval={Math.max(1, Math.floor(range / 7))}
                  />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderRadius: '12px', 
                      border: '1px solid #1e293b', 
                      color: '#fff',
                      fontSize: '11px' 
                    }} 
                    formatter={(val: any) => [`${val} ta odat bajarildi`, 'Odatlar']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="habits" 
                    name="Odatlar" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    fill="url(#colorHabitsOnly)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Individual Habit Consistency Table */}
          <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-150 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
              Har Bir Odatning Shaxsiy Natijasi
            </h4>

            {habitRankings.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">Hozircha odatlar mavjud emas</p>
            ) : (
              <div className="space-y-3">
                {habitRankings.map((h) => (
                  <div key={h.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800 dark:text-white truncate font-black">{h.name}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 shrink-0">
                        {h.doneCount} / {range} kun ({h.rate}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                        style={{ width: `${h.rate}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 5: VAZIFALAR ANALITIKASI (TASKS ANALYTICS) */}
      {/* ========================================================================= */}
      {activeCategory === 'tasks' && (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
          {/* Tasks KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-blue-50/60 dark:bg-blue-950/20 p-3.5 sm:p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-500 block mb-1">
                Samaradorlik
              </span>
              <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">
                {tasksEfficiency}%
              </div>
              <span className="text-[10px] font-bold text-slate-400">Bajarilish foizi</span>
            </div>

            <div className="bg-blue-50/60 dark:bg-blue-950/20 p-3.5 sm:p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-500 block mb-1">
                Jami Bajarildi
              </span>
              <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">
                {totalTasksCompleted} <span className="text-xs font-bold text-slate-400">ta</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">{range} kun ichida</span>
            </div>

            <div className="bg-blue-50/60 dark:bg-blue-950/20 p-3.5 sm:p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-500 block mb-1">
                Eng Sermahsul Kun
              </span>
              <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {peakTaskDay.day}-kun
              </div>
              <span className="text-[10px] font-bold text-blue-500">
                {peakTaskDay.count} ta vazifa
              </span>
            </div>

            <div className="bg-blue-50/60 dark:bg-blue-950/20 p-3.5 sm:p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-500 block mb-1">
                Kunlik O'rtacha
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {(totalTasksCompleted / (range || 1)).toFixed(1)}
              </div>
              <span className="text-[10px] font-bold text-slate-400">vazifa/kun</span>
            </div>
          </div>

          {/* Tasks Daily Dynamic Area Chart */}
          <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-150 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Kunlik Bajarilgan Vazifalar Dinamikasi
            </h3>

            <div className="h-64 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overallChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTasksOnly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    stroke="#94a3b8" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false}
                    interval={Math.max(1, Math.floor(range / 7))}
                  />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderRadius: '12px', 
                      border: '1px solid #1e293b', 
                      color: '#fff',
                      fontSize: '11px' 
                    }} 
                    formatter={(val: any) => [`${val} ta vazifa bajarildi`, 'Vazifalar']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="tasks" 
                    name="Vazifalar" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    fill="url(#colorTasksOnly)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Individual Tasks List and Consistency */}
          <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-150 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
              Vazifalarning {range} Kunlik Natijalari
            </h4>

            {tasksList.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">Hozircha vazifalar mavjud emas</p>
            ) : (
              <div className="space-y-3">
                {tasksList.map((t) => {
                  const arr = Array.isArray(t?.data) ? t.data : [];
                  const doneCount = arr.slice(0, range).filter(Boolean).length;
                  const rate = Math.round((doneCount / (range || 1)) * 100);

                  return (
                    <div key={t.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800 dark:text-white truncate font-black">{t.name || 'Nomsiz vazifa'}</span>
                        <span className="text-blue-600 dark:text-blue-400 shrink-0">
                          {doneCount} / {range} kun ({rate}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                          style={{ width: `${rate}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

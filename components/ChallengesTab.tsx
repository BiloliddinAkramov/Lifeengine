import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { ChallengeItem, User } from '../types';
import { ChallengeAnalyticsModal } from './ChallengeAnalyticsModal';
import { CreateChallengeModal } from './CreateChallengeModal';

interface ChallengesTabProps {
  challenges: ChallengeItem[];
  user: User;
  onUpdateChallenges: (challenges: ChallengeItem[]) => void;
  onAwardStars: (stars: number) => void;
  lang: 'uz' | 'ru' | 'en';
}

export const ChallengesTab: React.FC<ChallengesTabProps> = ({
  challenges,
  user,
  onUpdateChallenges,
  onAwardStars
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [analyticsChallenge, setAnalyticsChallenge] = useState<ChallengeItem | null>(null);
  const [expandedChartId, setExpandedChartId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // 24-hour cycle live timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = currentTime.toISOString().split('T')[0];

  // Calculate remaining time until midnight (end of current 24h cycle)
  const midnight = new Date(currentTime);
  midnight.setHours(24, 0, 0, 0);
  const diffMs = midnight.getTime() - currentTime.getTime();
  const hoursRemaining = Math.floor(diffMs / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const secondsRemaining = Math.floor((diffMs % (1000 * 60)) / 1000);

  // Initial defaults if none exist
  const items: ChallengeItem[] = challenges?.length ? challenges : [
    {
      id: 'c1',
      title: 'Kitobxonlik Chellenji',
      description: 'Har kuni kamida 20 sahifa kitob mutolaasi qilish',
      duration: 30,
      currentDay: 12,
      targetTime: '21:00',
      startDate: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0],
      completed: false,
      category: 'mind',
      rewardStars: 15,
      icon: 'fa-book-open',
      color: '#8b5cf6'
    },
    {
      id: 'c2',
      title: '06:00 Ertalabki Intizom',
      description: 'Har tong soat 06:00 da uyg\'onish va kunni rejalashtirish',
      duration: 21,
      currentDay: 14,
      targetTime: '06:00',
      startDate: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
      completed: false,
      category: 'discipline',
      rewardStars: 20,
      icon: 'fa-sun',
      color: '#f59e0b'
    },
    {
      id: 'c3',
      title: '10,000 Qadam Marafoni',
      description: 'Kunlik kamida 10,000 qadam yurish va tetiklik',
      duration: 30,
      currentDay: 9,
      targetTime: '18:30',
      startDate: new Date(Date.now() - 9 * 86400000).toISOString().split('T')[0],
      completed: false,
      category: 'fitness',
      rewardStars: 12,
      icon: 'fa-running',
      color: '#10b981'
    }
  ];

  // Daily check-in handler (24-hour cycle rule)
  const handleCheckIn = (id: string) => {
    const updated = items.map(c => {
      if (c.id === id) {
        const nextDay = Math.min(c.duration, c.currentDay + 1);
        const isFinished = nextDay >= c.duration;
        if (isFinished && !c.completed) {
          onAwardStars(c.rewardStars);
        }
        return {
          ...c,
          currentDay: nextDay,
          lastCheckInDate: todayStr,
          completed: isFinished
        };
      }
      return c;
    });
    onUpdateChallenges(updated);
  };

  // Undo check-in for today if made by mistake
  const handleUndoCheckIn = (id: string) => {
    const updated = items.map(c => {
      if (c.id === id && c.lastCheckInDate === todayStr && c.currentDay > 0) {
        return {
          ...c,
          currentDay: c.currentDay - 1,
          lastCheckInDate: undefined,
          completed: false
        };
      }
      return c;
    });
    onUpdateChallenges(updated);
  };

  const handleAddChallenge = (newChallenge: ChallengeItem) => {
    const updated = [newChallenge, ...items];
    onUpdateChallenges(updated);
  };

  const handleDeleteChallenge = (id: string) => {
    const updated = items.filter(c => c.id !== id);
    onUpdateChallenges(updated);
  };

  // Filtering
  const filtered = items.filter(item => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'my') return item.isCustom;
    if (activeCategory === 'active') return !item.completed;
    if (activeCategory === 'completed') return item.completed;
    return item.category === activeCategory;
  });

  // Summary Metrics
  const activeCount = items.filter(i => !i.completed).length;
  const completedTodayCount = items.filter(i => i.lastCheckInDate === todayStr).length;
  const totalStarsEarned = items.reduce((acc, curr) => curr.completed ? acc + curr.rewardStars : acc, 0);

  return (
    <div className="max-w-5xl mx-auto animate-slide-up space-y-8 pb-10">
      {/* Mobile-Optimized Top Banner with Compact 24-Hour Timer */}
      <div className="bg-gradient-to-br from-slate-900 via-[#0c2038] to-blue-950 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800/80">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                24 Soatlik Sikl
              </span>
              <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                <i className="fas fa-star text-[9px]"></i>
                {user.stars} yulduz
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">
              Chellenjlar
            </h2>
          </div>

          {/* Compact 24-Hour Live Countdown Pill */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl shrink-0 flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-1.5 text-blue-300 text-xs font-bold">
              <i className="fas fa-clock text-amber-400 animate-pulse"></i>
              <span className="text-[10px] uppercase tracking-wider">Bugun:</span>
            </div>
            <div className="text-lg sm:text-xl font-black tracking-wider font-mono text-white">
              {String(hoursRemaining).padStart(2, '0')}:
              {String(minutesRemaining).padStart(2, '0')}:
              {String(secondsRemaining).padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Mobile Friendly Filter Swiper & Create Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4">
        {/* Horizontally Scrollable Category Pills on Mobile */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 p-1.5 rounded-xl sm:rounded-2xl overflow-x-auto no-scrollbar scroll-smooth">
          {[
            { id: 'all', label: 'Barchasi' },
            { id: 'active', label: 'Faol' },
            { id: 'my', label: 'Mening' },
            { id: 'discipline', label: 'Intizom' },
            { id: 'health', label: 'Salomatlik' },
            { id: 'mind', label: 'Tafakkur' },
            { id: 'fitness', label: 'Sport' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-1.5 text-xs font-black uppercase rounded-lg sm:rounded-xl whitespace-nowrap transition-all ${
                activeCategory === tab.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Create Custom Challenge Button - Full Width on Mobile, Min 44px Height */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white text-xs font-black uppercase tracking-wider rounded-xl sm:rounded-2xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <i className="fas fa-plus text-xs"></i>
          <span>O'z Chelenjingni Qo'sh</span>
        </button>
      </div>

      {/* Challenges Cards Grid - Mobile Optimized Spacing & Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
        {filtered.map(item => {
          const progress = Math.min(100, Math.round((item.currentDay / item.duration) * 100));
          const isTodayChecked = item.lastCheckInDate === todayStr;
          const remainingDays = Math.max(0, item.duration - item.currentDay);

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-lg hover:shadow-xl flex flex-col justify-between transition-all relative group"
            >
              <div>
                {/* Header: Icon, Tags, and Analytics Button */}
                <div className="flex items-start justify-between gap-2.5 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div 
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-lg text-white shadow-md shrink-0"
                      style={{ backgroundColor: item.color || '#2563eb' }}
                    >
                      <i className={`fas ${item.icon || 'fa-fire'}`}></i>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {item.category}
                        </span>
                        {item.targetTime && (
                          <span className="text-[9px] font-bold text-amber-500 flex items-center gap-1">
                            <i className="fas fa-clock text-[8px]"></i>
                            {item.targetTime}
                          </span>
                        )}
                        {item.isCustom && (
                          <span className="text-[9px] font-black text-blue-500 uppercase">
                            Shaxsiy
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug truncate">
                        {item.title}
                      </h4>
                    </div>
                  </div>

                  {/* Actions: Inline Area Chart toggle & Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setExpandedChartId(expandedChartId === item.id ? null : item.id)}
                      className={`min-h-[36px] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 ${
                        expandedChartId === item.id
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                          : 'bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                      }`}
                      title="Grafikni ko'rish / yopish"
                    >
                      <i className="fas fa-chart-area text-xs"></i>
                      <span>Analitika</span>
                    </button>

                    {item.isCustom && (
                      <button
                        onClick={() => handleDeleteChallenge(item.id)}
                        className="w-8 h-8 rounded-xl text-slate-300 hover:text-rose-500 flex items-center justify-center transition-all active:scale-95"
                        title="O'chirish"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between text-xs font-black">
                    <span className="text-slate-700 dark:text-slate-300 text-[11px] sm:text-xs">
                      Bajarildi: <strong className="text-slate-900 dark:text-white">{item.currentDay}</strong> / {item.duration} kun
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-black text-[11px] sm:text-xs">{progress}%</span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${progress}%`,
                        backgroundColor: item.color || '#2563eb'
                      }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>{remainingDays > 0 ? `${remainingDays} kun qoldi` : 'Tugallangan! 🎉'}</span>
                    <span className="text-amber-500 flex items-center gap-1">
                      <i className="fas fa-star text-[9px]"></i>
                      +{item.rewardStars} yulduz
                    </span>
                  </div>
                </div>

                {/* Pure Beautiful Inline Area Chart when Analitika is clicked */}
                {expandedChartId === item.id && (
                  <div className="pt-2 pb-2 my-2 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
                    <div className="h-44 sm:h-52 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart 
                          data={Array.from({ length: item.duration }, (_, i) => {
                            const day = i + 1;
                            const isCompleted = day <= item.currentDay;
                            return {
                              day: `${day}-k`,
                              amalgaOshgan: isCompleted ? Math.round((day / item.duration) * 100) : null,
                              reja: Math.round((day / item.duration) * 100),
                            };
                          })} 
                          margin={{ top: 8, right: 8, left: -25, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id={`grad-${item.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="5%" stopColor={item.color || "#2563eb"} stopOpacity={0.45} />
                              <stop offset="95%" stopColor={item.color || "#2563eb"} stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="colorTargetInline" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
                          <XAxis 
                            dataKey="day" 
                            tick={{ fontSize: 9, fill: '#94a3b8' }} 
                            interval={Math.max(1, Math.floor(item.duration / 6))}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            tick={{ fontSize: 9, fill: '#94a3b8' }} 
                            domain={[0, 100]} 
                            unit="%" 
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const actualVal = payload[0]?.value;
                                const targetVal = payload[1]?.value;
                                return (
                                  <div className="bg-slate-900/95 backdrop-blur text-white px-2.5 py-1.5 rounded-lg text-xs shadow-xl border border-slate-800">
                                    <p className="font-bold text-amber-400 text-[10px]">{label}</p>
                                    <p className="text-blue-400 font-semibold text-xs">
                                      Amalda: {actualVal !== null && actualVal !== undefined ? `${actualVal}%` : '—'}
                                    </p>
                                    <p className="text-slate-400 text-[9px]">Reja: {targetVal}%</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="amalgaOshgan"
                            stroke={item.color || "#2563eb"}
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill={`url(#grad-${item.id})`}
                            connectNulls={false}
                          />
                          <Area
                            type="monotone"
                            dataKey="reja"
                            stroke="#94a3b8"
                            strokeDasharray="3 3"
                            strokeWidth={1.5}
                            fillOpacity={1}
                            fill="url(#colorTargetInline)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom 24-Hour Check-In Action Section - Touch Optimized */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                {item.completed ? (
                  <div className="w-full min-h-[44px] py-2.5 px-3 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20">
                    <i className="fas fa-check-double text-sm"></i>
                    <span>Chelenj Muvaffaqiyatli Tugallandi! (+{item.rewardStars} ⭐)</span>
                  </div>
                ) : isTodayChecked ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-h-[44px] py-2.5 px-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-black flex items-center justify-center gap-2">
                      <i className="fas fa-check-circle text-emerald-500"></i>
                      <span>Bugun Bajarildi!</span>
                    </div>
                    <button
                      onClick={() => handleUndoCheckIn(item.id)}
                      className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center text-xs font-bold transition-all active:scale-95 shrink-0"
                      title="Qaytarish"
                    >
                      <i className="fas fa-undo"></i>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleCheckIn(item.id)}
                    className="w-full min-h-[44px] py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-check text-xs"></i>
                    <span>Bugungi kunni belgilash ({item.currentDay + 1}-kun)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State when no challenge matches */}
      {filtered.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 text-center border border-slate-100 dark:border-slate-800 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4 text-2xl">
            <i className="fas fa-flag"></i>
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
            Ushbu bo'limda chellenj topilmadi
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            O'zingizga mos muddat, vaqt va maqsad bilan yangi chelenj yarating!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
          >
            Yangi Chelenj Yaratish
          </button>
        </div>
      )}

      {/* Create Custom Challenge Modal */}
      <CreateChallengeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleAddChallenge}
        lang="uz"
      />

      {/* Analytics Modal With Recharts AreaChart */}
      <ChallengeAnalyticsModal
        challenge={analyticsChallenge}
        isOpen={!!analyticsChallenge}
        onClose={() => setAnalyticsChallenge(null)}
        lang="uz"
      />
    </div>
  );
};

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { ChallengeItem } from '../types';

interface ChallengeAnalyticsModalProps {
  challenge: ChallengeItem | null;
  isOpen: boolean;
  onClose: () => void;
  lang: 'uz' | 'ru' | 'en';
}

export const ChallengeAnalyticsModal: React.FC<ChallengeAnalyticsModalProps> = ({
  challenge,
  isOpen,
  onClose
}) => {
  if (!isOpen || !challenge) return null;

  const progressPercent = Math.min(100, Math.round((challenge.currentDay / challenge.duration) * 100));

  // Generate day-by-day curve data for AreaChart
  const chartData = Array.from({ length: challenge.duration }, (_, i) => {
    const day = i + 1;
    const isCompleted = day <= challenge.currentDay;
    const targetProgress = Math.round((day / challenge.duration) * 100);
    const actualProgress = isCompleted ? Math.round((day / challenge.duration) * 100) : null;
    return {
      day: `${day}-k`,
      amalgaOshgan: actualProgress,
      reja: targetProgress,
    };
  });

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl p-5 sm:p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Minimal Clean Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm text-white shadow-sm shrink-0"
              style={{ backgroundColor: challenge.color || '#2563eb' }}
            >
              <i className={`fas ${challenge.icon || 'fa-chart-area'}`}></i>
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-black text-slate-900 dark:text-white truncate">
                {challenge.title}
              </h3>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                <span>{challenge.currentDay} / {challenge.duration} kun</span>
                <span>•</span>
                <span className="text-blue-600 dark:text-blue-400 font-black">{progressPercent}%</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-all active:scale-95 shrink-0"
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>

        {/* Pure Beautiful AreaChart */}
        <div className="w-full h-64 sm:h-72 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActualPure" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor={challenge.color || "#2563eb"} stopOpacity={0.45} />
                  <stop offset="95%" stopColor={challenge.color || "#2563eb"} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorTargetPure" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 10, fill: '#94a3b8' }} 
                interval={Math.max(1, Math.floor(challenge.duration / 7))}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#94a3b8' }} 
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
                      <div className="bg-slate-900/95 backdrop-blur text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-slate-800">
                        <p className="font-bold text-amber-400 text-[11px] mb-0.5">{label}</p>
                        <p className="text-blue-400 font-semibold text-xs">
                          Amalda: {actualVal !== null && actualVal !== undefined ? `${actualVal}%` : '—'}
                        </p>
                        <p className="text-slate-400 text-[10px]">
                          Reja: {targetVal}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="amalgaOshgan"
                stroke={challenge.color || "#2563eb"}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorActualPure)"
                connectNulls={false}
              />
              <Area
                type="monotone"
                dataKey="reja"
                stroke="#94a3b8"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#colorTargetPure)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Minimal Legend Dots */}
        <div className="flex items-center justify-center gap-5 pt-3 text-[11px] font-bold">
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
            <span 
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: challenge.color || '#2563eb' }}
            ></span>
            <span>Amalda</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 inline-block"></span>
            <span>Reja</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { AppState, MatrixItem } from '../types';
import { TrackerMatrix } from './TrackerMatrix';
import { t } from '../services/translations';

interface SleepTabProps {
  data: AppState;
  updateData: (updater: (prev: AppState) => AppState) => void;
  handleToggleDay: (type: 'sleep', id: string, day: number) => void;
  handleDelete: (type: 'sleep', id: string) => void;
  range: 7 | 15 | 30;
  lang: 'uz' | 'ru' | 'en';
  theme: 'dark' | 'light';
}

export const SleepTab: React.FC<SleepTabProps> = ({
  data,
  updateData,
  handleToggleDay,
  handleDelete,
  range,
  lang,
  theme
}) => {
  const [bedTime, setBedTime] = useState<string>('23:00');
  const [wakeTime, setWakeTime] = useState<string>('06:30');
  const [sleepQuality, setSleepQuality] = useState<number>(85);

  const sleepHoursList = Array.isArray(data?.sleepHours) ? data.sleepHours : Array(30).fill(7.0);
  const avgHours = (sleepHoursList.slice(0, range).reduce((a, b) => a + b, 0) / (range || 1)).toFixed(1);

  const handleUpdateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    updateData(prev => {
      const nextSchedules = [...(Array.isArray(prev?.sleepSchedules) ? prev.sleepSchedules : [])];
      nextSchedules[0] = {
        day: 1,
        bedTime,
        wakeTime,
        quality: sleepQuality
      };
      return { ...prev, sleepSchedules: nextSchedules };
    });
  };

  return (
    <div className="max-w-4xl mx-auto animate-slide-up space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-700 to-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-80">
            Uyqu Tizimi
          </h3>
          <span className="text-[10px] bg-white/20 px-3 py-1.5 rounded-xl font-black uppercase tracking-widest">
            {range} kunlik uyqu
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <span className="text-xs font-bold text-indigo-200 block mb-1">
              O'rtacha uyqu davomiyligi
            </span>
            <span className="text-3xl font-black text-white">
              {avgHours} <span className="text-xs text-indigo-300">soat/kun</span>
            </span>
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-200 block mb-1">
              Maqsad qilingan vaqt
            </span>
            <span className="text-3xl font-black text-indigo-200">
              {bedTime} → {wakeTime}
            </span>
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-200 block mb-1">
              Uyqu sifati indeksi
            </span>
            <span className="text-3xl font-black text-emerald-300">
              {sleepQuality}%
            </span>
          </div>
        </div>
      </div>

      {/* Sleep Schedule Setting */}
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl">
        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-6">
          Kunlik Uyqu Rejasi
        </h4>
        <form onSubmit={handleUpdateSchedule} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
              Uxlash vaqti
            </label>
            <input
              type="time"
              value={bedTime}
              onChange={(e) => setBedTime(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
              Uyg'onish vaqti
            </label>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all"
            >
              Rejani Yangilash
            </button>
          </div>
        </form>
      </div>

      {/* Sleep Matrix Grid */}
      <TrackerMatrix
        items={data.sleep}
        type="sleep"
        onToggle={(id, day) => handleToggleDay('sleep', id, day)}
        onDelete={(id) => handleDelete('sleep', id)}
        onRename={() => {}}
        color="indigo"
        lang={lang}
        theme={theme}
        range={range}
      />
    </div>
  );
};

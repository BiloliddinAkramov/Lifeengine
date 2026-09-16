import React, { useState } from 'react';
import { ChallengeItem } from '../types';

interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (challenge: ChallengeItem) => void;
  lang: 'uz' | 'ru' | 'en';
}

const PRESET_DURATIONS = [7, 14, 21, 30, 60, 100];

const ICONS = [
  { icon: 'fa-fire', label: 'Olov / Iroda' },
  { icon: 'fa-sun', label: 'Tong / Rejim' },
  { icon: 'fa-book-open', label: 'Kitob' },
  { icon: 'fa-dumbbell', label: 'Sport' },
  { icon: 'fa-running', label: 'Yugurish' },
  { icon: 'fa-water', label: 'Suv' },
  { icon: 'fa-brain', label: 'Miya' },
  { icon: 'fa-wallet', label: 'Moliya' },
  { icon: 'fa-code', label: 'Dasturlash' },
  { icon: 'fa-bullseye', label: 'Maqsad' },
];

const CATEGORIES: { id: ChallengeItem['category']; label: string; color: string }[] = [
  { id: 'discipline', label: 'Intizom', color: '#f59e0b' },
  { id: 'health', label: 'Salomatlik', color: '#10b981' },
  { id: 'mind', label: 'Tafakkur', color: '#8b5cf6' },
  { id: 'fitness', label: 'Sport', color: '#ef4444' },
  { id: 'finance', label: 'Moliya', color: '#059669' },
  { id: 'learning', label: "O'rganish", color: '#2563eb' },
];

export const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<number>(21);
  const [customDuration, setCustomDuration] = useState<string>('');
  const [targetTime, setTargetTime] = useState<string>('07:00');
  const [category, setCategory] = useState<ChallengeItem['category']>('discipline');
  const [icon, setIcon] = useState<string>('fa-fire');
  const [rewardStars, setRewardStars] = useState<number>(25);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    const finalDuration = customDuration ? parseInt(customDuration, 10) || duration : duration;
    const catObj = CATEGORIES.find(c => c.id === category);

    const newChallenge: ChallengeItem = {
      id: 'custom_' + Date.now().toString(36),
      title: cleanTitle,
      description: description.trim() || `${finalDuration} kunlik shaxsiy chelenj`,
      duration: Math.max(1, finalDuration),
      currentDay: 0,
      targetTime: targetTime || '08:00',
      startDate: new Date().toISOString().split('T')[0],
      completed: false,
      category,
      rewardStars: rewardStars || Math.min(100, Math.max(10, finalDuration)),
      icon,
      color: catObj?.color || '#2563eb',
      isCustom: true
    };

    onCreate(newChallenge);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl p-4 sm:p-6 md:p-8 my-auto max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center text-lg sm:text-xl shrink-0">
              <i className="fas fa-plus"></i>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Yangi Chelenj Yaratish
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                O'z maqsadingiz, davomiyligi va vaqtini belgilang
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-all active:scale-95 shrink-0"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 block">
              Chelenj Nomi *
            </label>
            <input
              type="text"
              required
              placeholder="Masalan: 40 kunlik yugurish yoki Kitob mutolaasi"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 outline-none text-sm font-semibold transition-all"
            />
          </div>

          {/* Duration in Days */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Davomiyligi (Kuni) *
              </label>
              <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                {customDuration ? `${customDuration} kun` : `${duration} kun`}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1.5 mb-2">
              {PRESET_DURATIONS.map(d => (
                <button
                  type="button"
                  key={d}
                  onClick={() => {
                    setDuration(d);
                    setCustomDuration('');
                  }}
                  className={`py-2 rounded-xl text-xs font-black transition-all ${
                    !customDuration && duration === d
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {d} k
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              max="365"
              placeholder="Yoki o'z kuningizni yozing (masalan 45)"
              value={customDuration}
              onChange={e => setCustomDuration(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold outline-none"
            />
          </div>

          {/* Daily Target Time & Reward Stars */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 block">
                Kunlik Vaqti (Soat) *
              </label>
              <input
                type="time"
                required
                value={targetTime}
                onChange={e => setTargetTime(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-semibold outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 block">
                Yulduz Mukofoti
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="500"
                  value={rewardStars}
                  onChange={e => setRewardStars(parseInt(e.target.value, 10) || 10)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-semibold outline-none pl-9"
                />
                <i className="fas fa-star text-amber-400 absolute left-3.5 top-4 text-xs"></i>
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 block">
              Kategoriya
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(c => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                    category === c.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 block">
              Ikonka
            </label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(ic => (
                <button
                  type="button"
                  key={ic.icon}
                  onClick={() => setIcon(ic.icon)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-all border ${
                    icon === ic.icon
                      ? 'bg-orange-500 text-white border-orange-500 scale-105 shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                  }`}
                  title={ic.label}
                >
                  <i className={`fas ${ic.icon}`}></i>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 block">
              Qisqacha Tavsif yoki Motivatsiya
            </label>
            <textarea
              rows={2}
              placeholder="Masalan: Har kuni ertalab 30 daqiqa jismoniy mashq..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
          >
            Chelenjni Boshlash
          </button>
        </form>
      </div>
    </div>
  );
};

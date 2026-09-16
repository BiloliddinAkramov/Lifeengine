import React, { useState } from 'react';
import { User, GlobalSettings, HolidayType } from '../types';
import { t } from '../services/translations';

interface AdminTabProps {
  currentUser: User;
  globalSettings: GlobalSettings;
  onUpdateGlobalSettings: (settings: GlobalSettings) => void;
  lang: 'uz' | 'ru' | 'en';
  theme: 'dark' | 'light';
}

export const AdminTab: React.FC<AdminTabProps> = ({
  currentUser,
  globalSettings,
  onUpdateGlobalSettings,
  lang,
  theme
}) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return currentUser.role === 'admin' || localStorage.getItem('admin_unlocked') === 'true';
  });
  const [adminKey, setAdminKey] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [awardUser, setAwardUser] = useState<string>('');
  const [awardAmount, setAwardAmount] = useState<string>('50');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey === 'admin_code_777' || adminKey === 'admin777' || adminKey === '905379222' || adminKey === 'biloliddin_admin') {
      setIsUnlocked(true);
      localStorage.setItem('admin_unlocked', 'true');
      setErrorMsg('');
    } else {
      setErrorMsg(t(lang, 'invalid_key'));
    }
  };

  const handleHolidayChange = (holiday: HolidayType) => {
    onUpdateGlobalSettings({
      ...globalSettings,
      holiday
    });
  };

  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
            <i className="fas fa-lock text-2xl"></i>
          </div>
          <h2 className="text-xl font-black dark:text-white uppercase tracking-widest">
            {t(lang, 'admin_access')}
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
            {t(lang, 'verification_stage')}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold text-center rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleUnlock} className="space-y-6">
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder={t(lang, 'enter_admin_key')}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white text-center tracking-[0.4em]"
          />
          <button
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all"
          >
            {t(lang, 'verify_access')}
          </button>
        </form>
      </div>
    );
  }

  const holidays: { id: HolidayType; label: string; icon: string; color: string }[] = [
    { id: 'none', label: t(lang, 'holiday_none'), icon: 'fa-ban', color: 'text-slate-400' },
    { id: 'ramadan', label: t(lang, 'holiday_ramadan'), icon: 'fa-moon', color: 'text-emerald-500' },
    { id: 'navruz', label: t(lang, 'holiday_navruz'), icon: 'fa-seedling', color: 'text-emerald-400' },
    { id: 'autumn', label: t(lang, 'holiday_autumn'), icon: 'fa-leaf', color: 'text-orange-500' },
    { id: 'newyear', label: t(lang, 'holiday_newyear'), icon: 'fa-snowflake', color: 'text-blue-400' }
  ];

  return (
    <div className="max-w-4xl mx-auto animate-slide-up space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
            Boshqaruv Paneli
          </span>
          <span className="text-xs font-mono text-emerald-400">
            ✓ Xavfsiz tizim
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black">
          Life Engine Pro Super Admin
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-md">
          Mavsumiy bayramlar rejimini o'zgartiring, foydalanuvchilarga yulduzlar taqsimlang va tizim holatini nazorat qiling.
        </p>
      </div>

      {/* Holiday Theme Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-xl">
        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-6">
          Mavsumiy Bezatish va Bayram Rejimi
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {holidays.map(h => {
            const isCurrent = globalSettings.holiday === h.id;
            return (
              <button
                key={h.id}
                onClick={() => handleHolidayChange(h.id)}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 scale-105 shadow-md'
                    : 'border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <i className={`fas ${h.icon} text-2xl ${h.color}`}></i>
                <span className="text-xs font-black text-center">{h.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stars Distributor */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-xl">
        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-6">
          Foydalanuvchiga Yulduzlar Taqdirlash
        </h4>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert(`Foydalanuvchi @${awardUser || currentUser.username} ga +${awardAmount} yulduz muvaffaqiyatli taqdim etildi!`);
            setAwardUser('');
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
              Foydalanuvchi username
            </label>
            <input
              type="text"
              placeholder="Masalan: biloliddin"
              value={awardUser}
              onChange={(e) => setAwardUser(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
              Yulduzlar miqdori
            </label>
            <input
              type="number"
              value={awardAmount}
              onChange={(e) => setAwardAmount(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all"
            >
              ⭐ Yulduz Berish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

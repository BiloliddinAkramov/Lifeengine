import React, { useState } from 'react';
import { User } from '../types';
import { t } from '../services/translations';

interface ProfileTabProps {
  user: User;
  onUpdateUser: (user: User) => void;
  lang: 'uz' | 'ru' | 'en';
  theme: 'dark' | 'light';
  onLogout?: () => void;
  onOpenLogin?: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  onUpdateUser,
  lang,
  theme,
  onLogout,
  onOpenLogin
}) => {
  const [displayName, setDisplayName] = useState<string>(user.displayName || '');
  const [pin, setPin] = useState<string>(user.pin || '');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user.avatar || '');
  const [savedMsg, setSavedMsg] = useState<boolean>(false);

  const predefinedAvatars = [
    {
      category: 'Superkarlar',
      images: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=240&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=240&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=240&auto=format&fit=crop&q=80'
      ]
    },
    {
      category: 'Qahramonlar & Afsonalar',
      images: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80'
      ]
    },
    {
      category: 'Tabiat & Minimalizm',
      images: [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=240&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=240&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=240&auto=format&fit=crop&q=80'
      ]
    }
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...user,
      displayName: displayName.trim() || user.username,
      avatar: selectedAvatar,
      pin: pin.trim()
    };
    onUpdateUser(updated);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto animate-slide-up space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-6">
          <img
            src={selectedAvatar || user.avatar}
            alt={user.displayName}
            className="w-20 h-20 md:w-24 md:h-24 rounded-3xl object-cover border-4 border-white/20 shadow-2xl"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl md:text-3xl font-black">
                {user.displayName || user.username}
              </h2>
              {user.isPremium && (
                <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider rounded-lg">
                  PRO
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {savedMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-bold text-center animate-fade-in">
          Profil ma'lumotlari muvaffaqiyatli saqlandi!
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-xl">
        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-6">
          Shaxsiy Ma'lumotlarni Tahrirlash
        </h4>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
              Ism yoki Taxallus
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-sm font-bold text-slate-900 dark:text-white focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
              Himoya PIN kodi (4-6 raqam)
            </label>
            <input
              type="password"
              placeholder="Ilovani qulflash uchun (ixtiyoriy)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-sm font-bold text-slate-900 dark:text-white focus:border-blue-500"
            />
          </div>

          {/* Avatar Collection Selector */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">
              Avatar Tasvirini Tanlang
            </label>

            <div className="space-y-4">
              {predefinedAvatars.map((cat, idx) => (
                <div key={idx}>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                    {cat.category}
                  </span>
                  <div className="flex gap-3">
                    {cat.images.map((img, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setSelectedAvatar(img)}
                        className={`w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all ${
                          selectedAvatar === img
                            ? 'border-blue-600 scale-105 shadow-lg shadow-blue-500/30'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="Avatar" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
          >
            O'zgarishlarni Saqlash
          </button>
        </form>
      </div>

      {/* Account Management & Logout Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-4">
        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
          Akkaunt va Xavfsizlik
        </h4>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Tizimdagi Maqom
            </span>
            <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5">
              {user.role === 'admin' ? '🛡️ Tizim Administratori (Admin Panel ochiq)' : '👤 Standart Foydalanuvchi'}
            </p>
          </div>
          {user.role === 'admin' ? (
            <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-xl text-[10px] font-black uppercase">
              Admin
            </span>
          ) : (
            <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-xl text-[10px] font-black uppercase">
              User
            </span>
          )}
        </div>

        {user.role !== 'admin' && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30">
            <p className="text-xs text-amber-800 dark:text-amber-300 font-bold">
              Admin paneliga kirish uchun maxsus login: <strong className="font-mono">admin</strong> / parol: <strong className="font-mono">admin777</strong>
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className="flex-1 py-3.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-user-circle"></i>
              <span>Boshqa Akkauntga Kirish</span>
            </button>
          )}
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex-1 py-3.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-500/20 hover:border-rose-500 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span>Hisobdan Chiqish</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { User, TabType, GlobalSettings } from '../types';
import { t } from '../services/translations';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  user: User;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  lang: 'uz' | 'ru' | 'en';
  setLang: (lang: 'uz' | 'ru' | 'en') => void;
  globalSettings: GlobalSettings;
  onOpenInstallModal: () => void;
  onLogout?: () => void;
  onOpenLogin?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  user,
  theme,
  toggleTheme,
  lang,
  setLang,
  globalSettings,
  onOpenInstallModal,
  onLogout,
  onOpenLogin
}) => {
  const holidayConfigs = {
    none: { title: "Lifeengine", icon: "fa-cube", color: "bg-blue-600 text-white" },
    ramadan: { title: "Ramazon Muborak", icon: "fa-moon", color: "bg-emerald-600 text-white" },
    navruz: { title: "Navro'z Ayomi", icon: "fa-seedling", color: "bg-green-600 text-white" },
    autumn: { title: "Oltin Kuz", icon: "fa-leaf", color: "bg-orange-600 text-white" },
    newyear: { title: "Yangi Yil", icon: "fa-snowflake", color: "bg-blue-500 text-white" }
  };

  const holidayInfo = holidayConfigs[globalSettings.holiday] || holidayConfigs.none;

  const navItems: { id: TabType; icon: string; color: string; labelKey: string; adminOnly?: boolean }[] = [
    { id: "tasks" as TabType, labelKey: "tasks", icon: "fa-check-circle", color: "text-blue-500" },
    { id: "habits" as TabType, labelKey: "habits", icon: "fa-seedling", color: "text-emerald-500" },
    { id: "challenges" as TabType, labelKey: "challenges", icon: "fa-fire", color: "text-orange-600" },
    { id: "community" as TabType, labelKey: "community", icon: "fa-users", color: "text-blue-600" },
    { id: "fitness" as TabType, labelKey: "fitness", icon: "fa-running", color: "text-orange-500" },
    { id: "timer" as TabType, labelKey: "timer", icon: "fa-clock", color: "text-rose-500" },
    { id: "music" as TabType, labelKey: "music", icon: "fa-music", color: "text-purple-500" },
    { id: "ai_chat" as TabType, labelKey: "ai_chat", icon: "fa-robot", color: "text-indigo-600" },
    { id: "sleep" as TabType, labelKey: "sleep", icon: "fa-moon", color: "text-indigo-500" },
    { id: "finance" as TabType, labelKey: "finance", icon: "fa-wallet", color: "text-amber-600" },
    { id: "analytics" as TabType, labelKey: "analytics", icon: "fa-chart-line", color: "text-rose-500" },
    { id: "premium" as TabType, labelKey: "premium", icon: "fa-crown", color: "text-yellow-500" },
    { id: "questions" as TabType, labelKey: "questions", icon: "fa-lightbulb", color: "text-orange-500" },
    { id: "profile" as TabType, labelKey: "profile", icon: "fa-user-circle", color: "text-blue-400" },
    { id: "admin" as TabType, labelKey: "admin", icon: "fa-user-shield", color: "text-slate-400 dark:text-slate-500", adminOnly: true }
  ].filter(item => !item.adminOnly || (item.adminOnly && user?.role === 'admin'));

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm z-50 transition-opacity md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Aside Container */}
      <aside 
        className={`fixed inset-y-0 left-0 w-72 md:w-80 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 z-[60] transform transition-transform duration-300 md:relative md:transform-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col p-6 overflow-y-auto hide-scrollbar">
          {/* Brand Header */}
          <div className="flex items-center gap-4 mb-8 shrink-0">
            {globalSettings.holiday === 'none' ? (
              <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 shrink-0 bg-white border border-slate-100 dark:border-slate-800 flex items-center justify-center p-1">
                <img src="/logo.png" alt="Life Engine" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center shadow-xl transition-colors duration-300 shrink-0 ${holidayInfo.color}`}>
                <i className={`fas ${holidayInfo.icon} text-lg text-white`}></i>
              </div>
            )}
            <div>
              <h2 className="text-sm font-black tracking-tight uppercase dark:text-white">
                {holidayInfo.title}
              </h2>
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                {t(lang, 'pro_edition')}
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className="ml-auto w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center active:scale-90 transition-all"
              title="Mavzuni o'zgartirish"
            >
              <i className={`fas ${theme === 'dark' ? 'fa-sun text-yellow-500' : 'fa-moon text-blue-500'}`}></i>
            </button>
          </div>

          {/* Language Selector */}
          <div className="space-y-4 mb-8 shrink-0">
            <div className="flex gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-1 rounded-2xl">
              {(['uz', 'ru', 'en'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${
                    lang === l 
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md' 
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex-1 space-y-1 pr-1">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-[1.4rem] transition-all group ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-[1.02]' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <i className={`fas ${item.icon} text-lg w-6 flex justify-center ${isActive ? 'text-white' : item.color} group-hover:scale-110 transition-transform`}></i>
                  <span className="text-sm font-black tracking-tight">
                    {t(lang, item.labelKey)}
                  </span>
                </button>
              );
            })}

            {/* PWA Install Button at the end of nav items */}
            <button
              onClick={() => {
                onOpenInstallModal();
                onClose();
              }}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-[1.4rem] transition-all group bg-gradient-to-r from-blue-600/10 to-indigo-600/10 hover:from-blue-600 hover:to-indigo-600 text-blue-600 dark:text-blue-400 hover:text-white border border-blue-500/20 hover:border-transparent shadow-sm mt-3"
            >
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 dark:border-slate-700 p-0.5 flex items-center justify-center shrink-0 group-hover:scale-105 shadow-md transition-transform overflow-hidden">
                <img src="/logo.png" alt="Life Engine" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 text-left">
                <span className="text-xs font-black tracking-tight block">
                  Ilovani O'rnatish
                </span>
                <span className="text-[9px] opacity-75 font-bold block">
                  Life Engine (PWA)
                </span>
              </div>
              <i className="fas fa-download text-xs opacity-70 group-hover:opacity-100 transition-opacity"></i>
            </button>
          </div>

          {/* Bottom Profile */}
          <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 shrink-0">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    onClose();
                  }}
                  className="flex-1 flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all group text-left min-w-0"
                >
                  <img
                    src={user.avatar}
                    alt={user.displayName}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform shrink-0"
                  />
                  <div className="flex-1 truncate">
                    <h4 className="text-xs font-black text-slate-800 dark:text-white truncate">
                      {user.displayName || user.username}
                    </h4>
                    <span className="text-[9px] font-bold text-slate-400 block truncate">
                      {user.role === 'admin' ? '🛡️ Admin' : '👤 Foydalanuvchi'}
                    </span>
                  </div>
                </button>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="w-9 h-9 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-all shrink-0"
                    title="Chiqish"
                  >
                    <i className="fas fa-sign-out-alt text-xs"></i>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenLogin?.();
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <i className="fas fa-sign-in-alt"></i>
                <span>Tizimga Kirish</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

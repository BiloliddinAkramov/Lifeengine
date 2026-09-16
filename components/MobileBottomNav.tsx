import React from 'react';
import { TabType } from '../types';
import { t } from '../services/translations';

interface MobileBottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  theme: 'dark' | 'light';
  lang: 'uz' | 'ru' | 'en';
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  theme,
  lang
}) => {
  const navItems: { id: TabType; labelKey: string; icon: string; activeColor: string }[] = [
    { id: "tasks", labelKey: "tasks", icon: "fa-check-circle", activeColor: "text-blue-500" },
    { id: "habits", labelKey: "habits", icon: "fa-seedling", activeColor: "text-emerald-500" },
    { id: "challenges", labelKey: "challenges", icon: "fa-fire", activeColor: "text-orange-500" },
    { id: "fitness", labelKey: "fitness", icon: "fa-running", activeColor: "text-orange-500" },
    { id: "finance", labelKey: "finance", icon: "fa-wallet", activeColor: "text-amber-600" }
  ];

  return (
    <nav 
      className={`fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t flex justify-around items-center md:hidden z-50 pb-safe px-1.5 py-1 shadow-2xl transition-colors duration-300 transform-gpu select-none ${
        theme === "dark" ? "bg-slate-900/95 border-slate-800/90 text-white" : "bg-white/95 border-slate-200/80 text-slate-900"
      }`}
      style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}
    >
      {navItems.map(item => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-1 transition-all duration-300 ${
              isActive ? item.activeColor : "text-slate-400 dark:text-slate-600"
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              isActive ? (theme === "dark" ? "bg-slate-800 shadow-inner" : "bg-slate-50 shadow-inner") : ""
            }`}>
              <i className={`fas ${item.icon} text-sm`}></i>
            </div>
            <span className="text-[8px] font-black uppercase tracking-wider">
              {t(lang, item.labelKey)}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

import React from 'react';
import { User, TabType, GlobalSettings } from '../types';
import { t } from '../services/translations';

interface HeaderProps {
  onOpenSidebar: () => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  user: User;
  globalSettings: GlobalSettings;
  lang: 'uz' | 'ru' | 'en';
  isSyncing: boolean;
  onSync: () => void;
  onOpenAiPlanner?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSidebar,
  activeTab,
  setActiveTab,
  user,
  globalSettings,
  lang,
  isSyncing,
  onSync,
  onOpenAiPlanner
}) => {
  const holidayIcon = {
    none: null,
    ramadan: 'fa-moon text-emerald-600',
    navruz: 'fa-seedling text-emerald-500',
    autumn: 'fa-leaf text-orange-500',
    newyear: 'fa-snowflake text-blue-500'
  }[globalSettings.holiday];

  const getTitle = () => {
    switch (activeTab) {
      case 'tasks': return t(lang, 'tasks');
      case 'habits': return t(lang, 'habits');
      case 'sleep': return t(lang, 'sleep');
      case 'finance': return t(lang, 'finance');
      case 'fitness': return t(lang, 'fitness');
      case 'analytics': return t(lang, 'analytics');
      case 'premium': return t(lang, 'premium');
      case 'questions': return t(lang, 'questions');
      case 'admin': return t(lang, 'admin');
      case 'ai_chat': return t(lang, 'ai_chat');
      case 'timer': return t(lang, 'timer');
      case 'music': return t(lang, 'music');
      case 'challenges': return t(lang, 'challenges');
      case 'community': return t(lang, 'community');
      case 'profile': return t(lang, 'profile');
      default: return 'Life Engine';
    }
  };

  return (
    <header className="px-3.5 py-2.5 sm:px-6 sm:py-3.5 md:px-10 md:py-5 flex items-center justify-between sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/90 shadow-sm transition-colors transform-gpu">
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Mobile Hamburger Menu */}
        <button
          onClick={onOpenSidebar}
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-800 flex items-center justify-center text-gray-900 dark:text-white md:hidden shadow-sm active:scale-95 transition-all bg-white dark:bg-slate-900"
        >
          <i className="fas fa-bars text-xs sm:text-sm"></i>
        </button>

        {/* Tab Title */}
        <h1 className="text-base sm:text-xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
          <span>{getTitle()}</span>
          {holidayIcon && (
            <i className={`fas ${holidayIcon} text-xs sm:text-sm md:text-xl animate-pulse`}></i>
          )}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* AI Assistant Button */}
        {user.isPremium && onOpenAiPlanner && (
          <button
            onClick={onOpenAiPlanner}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-xl hover:bg-black dark:hover:bg-blue-700 transition-all shadow-md flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider active:scale-95"
          >
            <i className="fas fa-wand-magic-sparkles text-[10px] text-amber-400"></i>
            <span className="hidden sm:inline">{t(lang, 'ai_spark_button')}</span>
          </button>
        )}

        {/* User Avatar */}
        <button
          onClick={() => setActiveTab('profile')}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden border-2 border-blue-500/40 hover:border-blue-500 transition-all active:scale-95 shadow-sm"
        >
          <img
            src={user.avatar}
            alt={user.displayName}
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </header>
  );
};

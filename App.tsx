import React, { useState, useEffect } from 'react';
import { User, AppState, TabType, GlobalSettings, MatrixItem } from './types';
import { LifeEngineService, DEFAULT_USER, DEFAULT_APP_STATE } from './services/lifeEngineStorage';
import { t } from './services/translations';
import { auth, onAuthStateChanged, signOut } from './firebase';

// Components
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { TrackerMatrix } from './components/TrackerMatrix';
import { EfficiencyBanner } from './components/EfficiencyBanner';
import { FitnessTab } from './components/FitnessTab';
import { TimerTab } from './components/TimerTab';
import { MusicTab } from './components/MusicTab';
import { AiChatTab } from './components/AiChatTab';
import { SleepTab } from './components/SleepTab';
import { FinanceTab } from './components/FinanceTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { ChallengesTab } from './components/ChallengesTab';
import { CommunityTab } from './components/CommunityTab';
import { PremiumTab } from './components/PremiumTab';
import { QuestionsTab } from './components/QuestionsTab';
import { ProfileTab } from './components/ProfileTab';
import { AdminTab } from './components/AdminTab';
import { PwaInstallModal } from './components/PwaInstallModal';
import { AuthModal } from './components/AuthModal';

export const App: React.FC = () => {
  const [user, setUser] = useState<User>(() => LifeEngineService.getLocalUser());
  const [appState, setAppState] = useState<AppState>(() => LifeEngineService.getLocalState());
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [range, setRange] = useState<7 | 15 | 30>(30);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [lang, setLang] = useState<'uz' | 'ru' | 'en'>('uz');

  // PWA and Auth State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      localStorage.getItem('pwa_installed') === 'true'
    );
  });
  const [showAuthModal, setShowAuthModal] = useState<boolean>(() => {
    return localStorage.getItem('life_engine_logged_in_v8') !== 'true';
  });

  // Global settings
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    holiday: 'none',
    shopStatus: 'active'
  });

  // Listen to Firebase Auth state change (Spark mode compatible)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const isAdmin = fbUser.email === 'biloliddinakramov85@gmail.com';
        const cloudData = await LifeEngineService.loadFromCloud(fbUser.uid);
        if (cloudData?.user) {
          setUser(cloudData.user);
          LifeEngineService.saveUser(cloudData.user);
        } else {
          const newUser: User = {
            id: fbUser.uid,
            username: (fbUser.displayName || fbUser.email?.split('@')[0] || 'user').toLowerCase().replace(/\s+/g, '_'),
            displayName: fbUser.displayName || 'Life User',
            email: fbUser.email || '',
            avatar: fbUser.photoURL || DEFAULT_USER.avatar,
            role: isAdmin ? 'admin' : 'user',
            status: 'active',
            joinedAt: fbUser.metadata?.creationTime || new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            stars: isAdmin ? 999 : 0,
            score: isAdmin ? 1000 : 0,
            isPremium: isAdmin,
            isLifetime: isAdmin,
            isCorporate: false,
            country: '🇺🇿'
          };
          setUser(newUser);
          LifeEngineService.saveUser(newUser);
          await LifeEngineService.syncToCloud(newUser, LifeEngineService.getLocalState());
        }

        if (isAdmin) {
          localStorage.setItem('admin_unlocked', 'true');
        }

        if (cloudData?.state) {
          setAppState(cloudData.state);
          LifeEngineService.saveLocalState(cloudData.state);
        }

        localStorage.setItem('life_engine_logged_in_v8', 'true');
        setShowAuthModal(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to PWA install event
  useEffect(() => {
    const handlePrompt = (e: any) => {
      if (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        localStorage.getItem('pwa_installed') === 'true'
      ) {
        return;
      }
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      localStorage.setItem('pwa_installed', 'true');
      setDeferredPrompt(null);
      setShowInstallModal(false);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // 1-Click Direct Install Handler
  const handleDirectInstall = async () => {
    if (isInstalled) return;
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult?.outcome === 'accepted') {
          setDeferredPrompt(null);
          setIsInstalled(true);
          localStorage.setItem('pwa_installed', 'true');
          setShowInstallModal(false);
          return;
        }
      } catch (err) {
        console.error('Install prompt error:', err);
      }
    }
    // If not triggered directly (e.g. inside iframe or browser security), open modal guide
    setShowInstallModal(true);
  };

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    LifeEngineService.saveUser(loggedUser);
    localStorage.setItem('life_engine_logged_in_v8', 'true');
    setShowAuthModal(false);
    if (loggedUser.role === 'admin') {
      setActiveTab('admin');
    }
  };

  const handleResetToZero = () => {
    const clean = LifeEngineService.resetToZero();
    setUser(clean.user);
    setAppState(clean.state);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('SignOut error:', e);
    }
    localStorage.removeItem('life_engine_logged_in_v8');
    localStorage.removeItem('admin_unlocked');
    const freshUser: User = {
      ...DEFAULT_USER,
      id: 'user_' + Date.now().toString(36),
      role: 'user',
      displayName: 'Yangi Foydalanuvchi',
      stars: 0,
      score: 0
    };
    setUser(freshUser);
    LifeEngineService.saveUser(freshUser);
    setAppState(DEFAULT_APP_STATE);
    LifeEngineService.saveLocalState(DEFAULT_APP_STATE);
    if (activeTab === 'admin') {
      setActiveTab('tasks');
    }
    setShowAuthModal(true);
  };

  // Modals
  const [modalType, setModalType] = useState<'task' | 'habit' | null>(null);
  const [newItemName, setNewItemName] = useState<string>('');
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [aiGoal, setAiGoal] = useState<string>('');
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);

  // Sync theme with HTML class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Load global settings
  useEffect(() => {
    LifeEngineService.getGlobalSettings().then(setGlobalSettings);
  }, []);

  // Sync state to local storage
  useEffect(() => {
    LifeEngineService.saveLocalState(appState);
  }, [appState]);

  // Sync user to local storage
  useEffect(() => {
    LifeEngineService.saveLocalUser(user);
  }, [user]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSyncCloud = async () => {
    setIsSyncing(true);
    await LifeEngineService.syncToCloud(user, appState);
    setTimeout(() => setIsSyncing(false), 600);
  };

  // Matrix item toggle
  const handleToggleItem = (type: 'tasks' | 'habits' | 'sleep', id: string, dayIndex: number) => {
    setAppState(prev => {
      const list = [...prev[type]];
      const index = list.findIndex(item => item.id === id);
      if (index !== -1) {
        const item = { ...list[index] };
        const data = [...item.data];
        data[dayIndex] = !data[dayIndex];
        item.data = data;
        list[index] = item;

        // Reward score on completion
        if (data[dayIndex]) {
          setUser(u => ({ ...u, score: u.score + 5 }));
        }
        return { ...prev, [type]: list };
      }
      return prev;
    });
  };

  // Matrix item delete
  const handleDeleteItem = (type: 'tasks' | 'habits' | 'sleep', id: string) => {
    setAppState(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item.id !== id)
    }));
  };

  // Matrix item rename
  const handleRenameItem = (type: 'tasks' | 'habits' | 'sleep', id: string, newName: string) => {
    setAppState(prev => ({
      ...prev,
      [type]: prev[type].map(item => item.id === id ? { ...item, name: newName } : item)
    }));
  };

  // Matrix item add
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !modalType) return;

    const newItem: MatrixItem = {
      id: (modalType === 'task' ? 't_' : 'h_') + Date.now(),
      name: newItemName.trim(),
      data: Array(30).fill(false)
    };

    setAppState(prev => {
      const key = modalType === 'task' ? 'tasks' : 'habits';
      return {
        ...prev,
        [key]: [...prev[key], newItem]
      };
    });

    setNewItemName('');
    setModalType(null);
  };

  // AI Planner Generator
  const handleGenerateAiPlan = () => {
    if (!aiGoal.trim()) return;
    setIsAiGenerating(true);

    setTimeout(() => {
      const sampleTasks: MatrixItem[] = [
        { id: 'ai_t1_' + Date.now(), name: `Reja: ${aiGoal.slice(0, 20)} bo'yicha 1-qadam`, data: Array(30).fill(false) },
        { id: 'ai_t2_' + Date.now(), name: `Tahlil va natijalarni qayd etish`, data: Array(30).fill(false) }
      ];
      const sampleHabit: MatrixItem = {
        id: 'ai_h1_' + Date.now(),
        name: `Kunlik 30 daqiqa: ${aiGoal.slice(0, 20)}`,
        data: Array(30).fill(false)
      };

      setAppState(prev => ({
        ...prev,
        tasks: [...prev.tasks, ...sampleTasks],
        habits: [...prev.habits, sampleHabit]
      }));

      setIsAiGenerating(false);
      setShowAiModal(false);
      setAiGoal('');
    }, 1200);
  };

  // Range selector component exactly from bundle
  const renderRangeSelector = () => {
    const options: { val: 7 | 15 | 30; label: string }[] = [
      { val: 7, label: '1 HAFTA' },
      { val: 15, label: '15 KUN' },
      { val: 30, label: '30 KUN' }
    ];

    return (
      <div className="flex bg-slate-100 dark:bg-slate-800/90 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl mb-3 sm:mb-5 md:mb-7 w-fit border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        {options.map(opt => (
          <button
            key={opt.val}
            onClick={() => setRange(opt.val)}
            className={`px-3 py-1 sm:px-5 sm:py-2 text-[10px] sm:text-xs font-black uppercase rounded-lg sm:rounded-xl transition-all ${
              range === opt.val
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  };

  // Calculate efficiency & consistency
  const calculateEfficiency = (items: MatrixItem[]) => {
    if (!items || !Array.isArray(items) || items.length === 0) return 0;
    let totalChecks = 0;
    const maxPossible = items.length * range;
    items.forEach(item => {
      const arr = Array.isArray(item?.data) ? item.data : [];
      totalChecks += arr.slice(0, range).filter(Boolean).length;
    });
    return maxPossible > 0 ? Math.round((totalChecks / maxPossible) * 100) : 0;
  };

  const tasksEfficiency = calculateEfficiency(appState?.tasks || []);
  const habitsConsistency = calculateEfficiency(appState?.habits || []);

  const tasksDailyCounts = Array.from({ length: range }, (_, i) => 
    (appState?.tasks || []).filter(t => Array.isArray(t?.data) && Boolean(t.data[i])).length
  );
  const habitsDailyCounts = Array.from({ length: range }, (_, i) => 
    (appState?.habits || []).filter(h => Array.isArray(h?.data) && Boolean(h.data[i])).length
  );

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Sidebar (Desktop & Mobile Drawer) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        theme={theme}
        toggleTheme={toggleTheme}
        lang={lang}
        setLang={setLang}
        globalSettings={globalSettings}
        onOpenInstallModal={handleDirectInstall}
        isInstalled={isInstalled}
        onLogout={handleLogout}
        onOpenLogin={() => setShowAuthModal(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Header */}
        <Header
          onOpenSidebar={() => setIsSidebarOpen(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          globalSettings={globalSettings}
          lang={lang}
          isSyncing={isSyncing}
          onSync={handleSyncCloud}
          onOpenAiPlanner={() => setShowAiModal(true)}
        />

        {/* View Content */}
        <main className="flex-1 p-2.5 sm:p-5 md:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-12">
          {/* Range selector for relevant tabs */}
          {['tasks', 'habits', 'sleep', 'finance', 'fitness', 'analytics'].includes(activeTab) && renderRangeSelector()}

          {/* Tab 1: TASKS */}
          {activeTab === 'tasks' && (
            <div className="animate-fade-in space-y-4 sm:space-y-6 md:space-y-8">
              {/* Blue Efficiency Banner matching Image 1 */}
              <EfficiencyBanner
                efficiency={tasksEfficiency}
                range={range}
                type="tasks"
                title="SAMARADORLIK"
                dailyCounts={tasksDailyCounts}
              />

              {/* Action Bar matching Image 1 */}
              <div className="flex items-center gap-3 md:gap-4 px-0.5 pt-0.5">
                <button
                  onClick={() => setModalType('task')}
                  className="px-4 py-2 sm:px-7 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#1b61f2] hover:bg-blue-700 text-white text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-md hover:shadow-blue-500/25 transition-all active:scale-95"
                >
                  + {t(lang, 'new_task')}
                </button>
                <h2 className="text-xs sm:text-sm font-black text-[#1b61f2] uppercase tracking-[0.2em] sm:tracking-[0.25em]">
                  {t(lang, 'tasks')}
                </h2>
              </div>

              {/* 30-Day Matrix Grid matching Image 1 */}
              <TrackerMatrix
                items={appState.tasks}
                type="tasks"
                onToggle={(id, day) => handleToggleItem('tasks', id, day)}
                onDelete={(id) => handleDeleteItem('tasks', id)}
                onRename={(id, name) => handleRenameItem('tasks', id, name)}
                color="blue"
                lang={lang}
                theme={theme}
                range={range}
              />
            </div>
          )}

          {/* Tab 2: HABITS */}
          {activeTab === 'habits' && (
            <div className="animate-fade-in space-y-4 sm:space-y-6 md:space-y-8">
              {/* Consistency Banner in Emerald Green */}
              <EfficiencyBanner
                efficiency={habitsConsistency}
                range={range}
                type="habits"
                title="ODATLAR SAMARADORLIGI"
                dailyCounts={habitsDailyCounts}
                color="emerald"
              />

              {/* Action Bar */}
              <div className="flex items-center gap-3 md:gap-4 px-0.5 pt-0.5">
                <button
                  onClick={() => setModalType('habit')}
                  className="px-4 py-2 sm:px-7 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#059669] hover:bg-emerald-700 text-white text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-md hover:shadow-emerald-500/25 transition-all active:scale-95"
                >
                  + {t(lang, 'new_habit')}
                </button>
                <h2 className="text-xs sm:text-sm font-black text-[#059669] uppercase tracking-[0.2em] sm:tracking-[0.25em]">
                  {t(lang, 'habits')}
                </h2>
              </div>

              {/* 30-Day Matrix Grid */}
              <TrackerMatrix
                items={appState.habits}
                type="habits"
                onToggle={(id, day) => handleToggleItem('habits', id, day)}
                onDelete={(id) => handleDeleteItem('habits', id)}
                onRename={(id, name) => handleRenameItem('habits', id, name)}
                color="emerald"
                lang={lang}
                theme={theme}
                range={range}
              />
            </div>
          )}

          {/* Tab 3: CHALLENGES */}
          {activeTab === 'challenges' && (
            <ChallengesTab
              challenges={appState.challenges}
              user={user}
              onUpdateChallenges={(challenges) => setAppState(prev => ({ ...prev, challenges }))}
              onAwardStars={(stars) => setUser(u => ({ ...u, stars: u.stars + stars }))}
              lang={lang}
            />
          )}

          {/* Tab 4: COMMUNITY & REYTING */}
          {activeTab === 'community' && (
            <CommunityTab
              currentUser={user}
              lang={lang}
            />
          )}

          {/* Tab 5: FITNESS & HEALTH */}
          {activeTab === 'fitness' && (
            <FitnessTab
              data={appState}
              updateData={setAppState}
              range={range}
              lang={lang}
            />
          )}

          {/* Tab 6: TIMER */}
          {activeTab === 'timer' && (
            <TimerTab
              lang={lang}
              theme={theme}
              onCompleteSession={(mins) => setUser(u => ({ ...u, score: u.score + mins }))}
            />
          )}

          {/* Tab 7: MUSIC LOUNGE */}
          {activeTab === 'music' && (
            <MusicTab
              lang={lang}
              theme={theme}
            />
          )}

          {/* Tab 8: AI CHAT */}
          {activeTab === 'ai_chat' && (
            <AiChatTab
              user={user}
              lang={lang}
            />
          )}

          {/* Tab 9: SLEEP */}
          {activeTab === 'sleep' && (
            <SleepTab
              data={appState}
              updateData={setAppState}
              handleToggleDay={(type, id, day) => handleToggleItem(type, id, day)}
              handleDelete={(type, id) => handleDeleteItem(type, id)}
              range={range}
              lang={lang}
              theme={theme}
            />
          )}

          {/* Tab 10: FINANCE */}
          {activeTab === 'finance' && (
            <FinanceTab
              data={appState}
              updateData={setAppState}
              range={range}
              lang={lang}
            />
          )}

          {/* Tab 11: ANALYTICS */}
          {activeTab === 'analytics' && (
            <AnalyticsTab
              data={appState}
              user={user}
              range={range}
              updateData={setAppState}
              lang={lang}
            />
          )}

          {/* Tab 12: PREMIUM */}
          {activeTab === 'premium' && (
            <PremiumTab
              user={user}
              lang={lang}
              theme={theme}
              onUpdateUser={setUser}
              globalSettings={globalSettings}
            />
          )}

          {/* Tab 13: QUESTIONS & SUPPORT */}
          {activeTab === 'questions' && (
            <QuestionsTab
              user={user}
              lang={lang}
            />
          )}

          {/* Tab 14: PROFILE */}
          {activeTab === 'profile' && (
            <ProfileTab
              user={user}
              onUpdateUser={setUser}
              lang={lang}
              theme={theme}
              onLogout={handleLogout}
              onOpenLogin={() => setShowAuthModal(true)}
              onResetToZero={handleResetToZero}
            />
          )}

          {/* Tab 15: ADMIN */}
          {activeTab === 'admin' && user?.role === 'admin' && (
            <AdminTab
              currentUser={user}
              globalSettings={globalSettings}
              onUpdateGlobalSettings={setGlobalSettings}
              lang={lang}
              theme={theme}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={theme}
          lang={lang}
        />
      </div>

      {/* Modal for adding Task or Habit */}
      {modalType && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-md border border-slate-100 dark:border-slate-800 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                {modalType === 'task' ? t(lang, 'new_task') : t(lang, 'new_habit')}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                  Nomi
                </label>
                <input
                  type="text"
                  required
                  placeholder={modalType === 'task' ? 'Masalan: Kitob mutolaasi' : 'Masalan: 2L suv ichish'}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className={`w-full px-5 py-4 rounded-2xl text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white ${
                    modalType === 'task' ? 'focus:border-blue-500' : 'focus:border-emerald-500'
                  }`}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className={`w-full py-4 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all mt-4 ${
                  modalType === 'task' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                Qo'shish
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Planner Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-md border border-slate-100 dark:border-slate-800 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <i className="fas fa-wand-magic-sparkles text-amber-400"></i>
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  AI Rejalashtiruvchi
                </h3>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-6 font-medium">
              Maqsadingizni kiriting (masalan: "Ingliz tilini C1 qilish" yoki "Yugurishni boshlash"), AI siz uchun 30 kunlik reja yaratadi.
            </p>

            <div className="space-y-4">
              <input
                type="text"
                value={aiGoal}
                onChange={(e) => setAiGoal(e.target.value)}
                placeholder="Maqsadingiz..."
                className="w-full px-5 py-4 rounded-2xl text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white focus:border-blue-500"
              />

              <button
                onClick={handleGenerateAiPlan}
                disabled={isAiGenerating || !aiGoal.trim()}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAiGenerating ? (
                  <>
                    <i className="fas fa-circle-notch animate-spin"></i>
                    <span>Reja tuzilmoqda...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-bolt text-amber-400"></i>
                    <span>Avtomatik Reja Yaratish</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* PWA Install Modal */}
      <PwaInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        deferredPrompt={deferredPrompt}
        onInstalled={() => {
          setIsInstalled(true);
          localStorage.setItem('pwa_installed', 'true');
        }}
      />

      {/* Auth / Login Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onLogin={handleLogin}
        onClose={() => setShowAuthModal(false)}
        isDismissable={true}
      />
    </div>
  );
};
export default App;

import React, { useState } from 'react';
import { User } from '../types';
import { LifeEngineLogo } from './LifeEngineLogo';
import { auth, googleProvider, signInWithPopup } from '../firebase';
import { LifeEngineService } from '../services/lifeEngineStorage';

interface AuthModalProps {
  isOpen: boolean;
  onLogin: (user: User) => void;
  onClose?: () => void;
  isDismissable?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onLogin,
  onClose,
  isDismissable = false
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  // Google Sign-In with Firebase
  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const fbUser = res.user;
      if (fbUser) {
        const isAdmin = fbUser.email === 'biloliddinakramov85@gmail.com';
        const userObj: User = {
          id: fbUser.uid,
          username: (fbUser.displayName || fbUser.email?.split('@')[0] || 'user').toLowerCase().replace(/\s+/g, '_'),
          displayName: fbUser.displayName || 'Life User',
          email: fbUser.email || '',
          avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=240&auto=format&fit=crop&q=80',
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

        if (isAdmin) {
          localStorage.setItem('admin_unlocked', 'true');
        }

        // Persist to Cloud & Local
        await LifeEngineService.syncToCloud(userObj, LifeEngineService.getLocalState());
        LifeEngineService.saveUser(userObj);
        onLogin(userObj);
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setError('Google orqali kirishda xatolik yuz berdi: ' + (err?.message || 'Qayta urinib ko\'ring'));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Dedicated Admin Login (triggered strictly when correct admin credentials are submitted)
  const executeAdminLogin = () => {
    localStorage.setItem('admin_unlocked', 'true');
    const adminUser: User = {
      id: 'admin_root',
      username: 'admin_code_777',
      displayName: 'Tizim Administratori',
      email: 'admin@lifeengine.uz',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
      role: 'admin',
      status: 'active',
      joinedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      stars: 999,
      score: 1000,
      isPremium: true,
      isLifetime: true,
      isCorporate: true,
      country: '🇺🇿'
    };
    LifeEngineService.syncToCloud(adminUser, LifeEngineService.getLocalState());
    onLogin(adminUser);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanUsername = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUsername || !cleanPass) {
      setError('Iltimos, login va parolni kiriting.');
      return;
    }

    // Secret Admin Login Check
    if (
      (cleanUsername === 'admin_code_777' || cleanUsername === 'admin') &&
      (cleanPass === 'admin777' || cleanPass === 'admin_code_777' || cleanPass === '905379222')
    ) {
      executeAdminLogin();
      return;
    }

    if (cleanUsername === 'admin_code_777' || cleanUsername === 'admin') {
      setError('Login yoki parol noto\'g\'ri.');
      return;
    }

    // Regular User Login or Registration
    if (mode === 'register') {
      const newUser: User = {
        id: 'user_' + Date.now().toString(36),
        username: cleanUsername,
        displayName: displayName.trim() || cleanUsername,
        email: `${cleanUsername}@lifeengine.uz`,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
        role: 'user',
        status: 'active',
        joinedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        stars: 0,
        score: 0,
        isPremium: false,
        isLifetime: false,
        isCorporate: false,
        country: '🇺🇿'
      };
      setSuccess('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!');
      setTimeout(() => onLogin(newUser), 350);
    } else {
      // Normal user login
      const existingUser: User = {
        id: 'user_' + cleanUsername,
        username: cleanUsername,
        displayName: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
        email: `${cleanUsername}@lifeengine.uz`,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80',
        role: 'user',
        status: 'active',
        joinedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        stars: 0,
        score: 0,
        isPremium: false,
        isLifetime: false,
        isCorporate: false,
        country: '🇺🇿'
      };
      onLogin(existingUser);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-white overflow-y-auto animate-fade-in">
      <div 
        className="w-full max-w-md my-auto py-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Top App Header With The New Logo from image.png */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-28 h-28 flex items-center justify-center mb-1 transition-transform hover:scale-105">
            <LifeEngineLogo className="w-full h-full" showText={true} textColor="#0c2038" />
          </div>
          <p className="text-[10px] md:text-xs font-bold text-slate-400 tracking-[0.25em] uppercase mt-1">
            HAYOTINGIZNI BIZ BILAN TARTIBLANG
          </p>
        </div>

        {/* Clean Pure White Container Card */}
        <div className="bg-white border border-slate-200/80 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-slate-200/60 relative overflow-hidden">
          {isDismissable && onClose && (
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all"
              title="Yopish"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
          )}

          <h2 className="text-2xl font-black text-[#0c2038] text-center mb-8 tracking-tight">
            {mode === 'register' ? "Ro'yxatdan O'tish" : "Xush Kelibsiz"}
          </h2>

          {/* Feedback alerts */}
          {error && (
            <div className="mb-5 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-bold text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl text-xs font-bold text-center">
              {success}
            </div>
          )}

          {/* Google Sign-In with Firebase Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 border-2 border-slate-200/90 hover:border-slate-300 text-slate-800 font-black text-sm rounded-2xl shadow-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] mb-6"
          >
            {isGoogleLoading ? (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{isGoogleLoading ? "Ulanmoqda..." : "Google orqali kirish"}</span>
          </button>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
              YOKI
            </span>
            <div className="border-t border-slate-200 w-full"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                  Ism va Familiya
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Biloliddin"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 text-slate-900 font-semibold rounded-2xl border border-slate-200/80 focus:border-[#0c2038] focus:bg-white outline-none transition-all text-sm shadow-sm"
                />
              </div>
            )}

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                USERNAME
              </label>
              <input
                type="text"
                required
                placeholder="Foydalanuvchi nomi"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 text-slate-900 font-semibold rounded-2xl border border-slate-200/80 focus:border-[#0c2038] focus:bg-white outline-none transition-all text-sm shadow-sm"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                PAROL
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 text-slate-900 font-semibold rounded-2xl border border-slate-200/80 focus:border-[#0c2038] focus:bg-white outline-none transition-all text-sm shadow-sm"
              />
            </div>

            {/* KIRISH Button in Dark Navy Brand Color */}
            <button
              type="submit"
              className="w-full py-4 bg-[#0c2038] hover:bg-[#142e4d] active:scale-[0.98] text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-slate-900/20 transition-all mt-4"
            >
              {mode === 'register' ? "Ro'yxatdan O'tish" : "KIRISH"}
            </button>
          </form>

          {/* Simple Clean Toggle */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
              className="text-xs font-bold text-[#0c2038] hover:text-blue-600 hover:underline transition-all"
            >
              {mode === 'login' ? "Hisobingiz yo'qmi? Ro'yxatdan o'tish" : "Hisobingiz bormi? Kirish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

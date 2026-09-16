import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { LifeEngineService } from '../services/lifeEngineStorage';
import { t } from '../services/translations';

interface CommunityTabProps {
  currentUser: User;
  lang: 'uz' | 'ru' | 'en';
}

export const CommunityTab: React.FC<CommunityTabProps> = ({ currentUser, lang }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadRealLeaders = async () => {
    try {
      const cloudLeaders = await LifeEngineService.getLeaderboard(50);
      
      // Combine with currentUser so active user is always represented with real score
      const map = new Map<string, User>();
      cloudLeaders.forEach(u => {
        if (u.id && u.username) {
          map.set(u.id, u);
        }
      });

      if (currentUser?.id && currentUser?.username) {
        const existing = map.get(currentUser.id);
        map.set(currentUser.id, {
          ...currentUser,
          score: Math.max(currentUser.score || 0, existing?.score || 0),
          stars: Math.max(currentUser.stars || 0, existing?.stars || 0),
        });
      }

      // Strictly real users, sorted by score descending
      const realUsers = Array.from(map.values())
        .filter(u => u.status !== 'banned')
        .sort((a, b) => (b.score || 0) - (a.score || 0));

      setUsers(realUsers);
    } catch (err) {
      console.warn('Failed to load real users from Firestore:', err);
      // If network error, only show current user, NO BOTS
      if (currentUser?.id) {
        setUsers([currentUser]);
      } else {
        setUsers([]);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadRealLeaders();
  }, [currentUser.id, currentUser.score, currentUser.stars]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadRealLeaders();
  };

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <div className="max-w-4xl mx-auto animate-slide-up space-y-6 sm:space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden border border-blue-500/20">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
            <i className="fas fa-signal text-[9px] text-emerald-300"></i>
            Haqiqiy Foydalanuvchilar
          </span>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-all active:scale-95"
            title="Yangilash"
          >
            <i className={`fas fa-rotate-right text-[11px] ${isRefreshing ? 'animate-spin' : ''}`}></i>
            <span className="hidden sm:inline">Yangilash</span>
          </button>
        </div>

        <h2 className="text-xl sm:text-2xl md:text-4xl font-black mb-2">
          Samaradorlik Hamjamiyati
        </h2>
        <p className="text-xs md:text-sm text-blue-100 font-medium max-w-lg leading-relaxed">
          O'zbekiston bo'ylab ro'yxatdan o'tgan real foydalanuvchilarning kunlik intizom, vazifa va odatlar bo'yicha haqiqiy reytingi. Barcha botlar olib tashlangan.
        </p>

        {/* Real users count pill */}
        <div className="mt-4 sm:mt-6 inline-flex items-center gap-2 bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-bold border border-white/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Faol haqiqiy foydalanuvchilar: <strong className="text-white">{users.length} nafar</strong></span>
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] p-12 text-center border border-slate-100 dark:border-slate-800 shadow-xl">
          <i className="fas fa-circle-notch fa-spin text-3xl text-blue-600 mb-4"></i>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Haqiqiy foydalanuvchilar yuklanmoqda...
          </p>
        </div>
      ) : users.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] p-8 sm:p-12 text-center border border-slate-100 dark:border-slate-800 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto text-2xl">
            <i className="fas fa-users"></i>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            Hozircha foydalanuvchilar mavjud emas
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Ilovaga kirganingizdan so'ng profilingiz avtomatik tarzda reytingda paydo bo'ladi.
          </p>
        </div>
      ) : (
        <>
          {/* Top Podium for Real Users */}
          {users.length >= 3 ? (
            /* 3+ Users Podium */
            <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 pt-4 sm:pt-6">
              {/* 2nd place */}
              <div className="flex flex-col items-center justify-end text-center">
                <div className="relative mb-2 sm:mb-3">
                  <img
                    src={top3[1]?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80'}
                    alt={top3[1]?.displayName}
                    className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-slate-300 shadow-lg"
                  />
                  <span className="absolute -bottom-2 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-300 text-slate-800 font-black text-[10px] sm:text-xs flex items-center justify-center shadow-md">
                    2
                  </span>
                </div>
                <h4 className="text-[11px] sm:text-xs md:text-sm font-black text-slate-900 dark:text-white truncate max-w-[90px] sm:max-w-[110px]">
                  {top3[1]?.displayName || top3[1]?.username}
                </h4>
                <span className="text-[10px] font-bold text-blue-500">
                  {top3[1]?.score || 0} ball
                </span>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-12 sm:h-16 rounded-t-xl sm:rounded-t-2xl mt-2 sm:mt-3 flex items-center justify-center text-[10px] sm:text-xs font-black text-slate-500">
                  🥈 2-o'rin
                </div>
              </div>

              {/* 1st place */}
              <div className="flex flex-col items-center justify-end text-center">
                <div className="relative mb-2 sm:mb-3">
                  <i className="fas fa-crown text-amber-400 text-lg sm:text-2xl absolute -top-4 sm:-top-6 left-1/2 transform -translate-x-1/2 drop-shadow-md"></i>
                  <img
                    src={top3[0]?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80'}
                    alt={top3[0]?.displayName}
                    className="w-18 h-18 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl object-cover border-4 border-amber-400 shadow-xl"
                  />
                  <span className="absolute -bottom-2 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                    1
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm md:text-base font-black text-slate-900 dark:text-white truncate max-w-[100px] sm:max-w-[130px]">
                  {top3[0]?.displayName || top3[0]?.username}
                </h4>
                <span className="text-[10px] sm:text-xs font-black text-amber-500">
                  {top3[0]?.score || 0} ball
                </span>
                <div className="w-full bg-gradient-to-t from-amber-500/20 to-amber-500/30 border border-amber-400/40 h-16 sm:h-24 rounded-t-xl sm:rounded-t-2xl mt-2 sm:mt-3 flex items-center justify-center text-[10px] sm:text-xs font-black text-amber-600 dark:text-amber-300">
                  🥇 Yetakchi
                </div>
              </div>

              {/* 3rd place */}
              <div className="flex flex-col items-center justify-end text-center">
                <div className="relative mb-2 sm:mb-3">
                  <img
                    src={top3[2]?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80'}
                    alt={top3[2]?.displayName}
                    className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-amber-700/60 shadow-lg"
                  />
                  <span className="absolute -bottom-2 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-700 text-white font-black text-[10px] sm:text-xs flex items-center justify-center shadow-md">
                    3
                  </span>
                </div>
                <h4 className="text-[11px] sm:text-xs md:text-sm font-black text-slate-900 dark:text-white truncate max-w-[90px] sm:max-w-[110px]">
                  {top3[2]?.displayName || top3[2]?.username}
                </h4>
                <span className="text-[10px] font-bold text-blue-500">
                  {top3[2]?.score || 0} ball
                </span>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-10 sm:h-12 rounded-t-xl sm:rounded-t-2xl mt-2 sm:mt-3 flex items-center justify-center text-[10px] sm:text-xs font-black text-slate-500">
                  🥉 3-o'rin
                </div>
              </div>
            </div>
          ) : (
            /* 1 or 2 Real Users Showcase */
            <div className="bg-gradient-to-b from-amber-500/10 to-transparent dark:from-amber-500/5 rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 border border-amber-500/20 text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-amber-400 mx-auto mb-3 shadow-xl relative">
                <img
                  src={top3[0]?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80'}
                  alt={top3[0]?.displayName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black mb-2 shadow-md">
                <i className="fas fa-crown text-[11px]"></i> 1-O'rin Yetakchisi
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {top3[0]?.displayName}
              </h3>
              <p className="text-xs font-bold text-slate-400">@{top3[0]?.username}</p>
              <div className="flex items-center justify-center gap-4 mt-3">
                <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-xl border border-blue-200 dark:border-blue-800">
                  {top3[0]?.score || 0} Ball
                </span>
                <span className="text-xs font-black text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                  <i className="fas fa-star text-[10px]"></i> {top3[0]?.stars || 0} Yulduz
                </span>
              </div>
              {users.length === 1 && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 max-w-sm mx-auto">
                  Tabriklaymiz! Siz reytingda yagona yetakchisiz. Do'stlaringiz ro'yxatdan o'tgach, ular ham ushbu ro'yxatda paydo bo'ladi.
                </p>
              )}
            </div>
          )}

          {/* Leaderboard Table List (Ranks 4+) */}
          {rest.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-2 sm:space-y-3">
              <h3 className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest px-2 mb-3">
                Keyingi O'rinlar
              </h3>
              {rest.map((user, idx) => {
                const isMe = user.id === currentUser.id;
                return (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-3 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all ${
                      isMe 
                        ? 'bg-blue-50/80 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className="w-5 sm:w-6 text-center font-black text-slate-400 text-xs">
                        {idx + 4}
                      </span>
                      <img
                        src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80'}
                        alt={user.displayName}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <h5 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{user.displayName}</span>
                          {isMe && (
                            <span className="text-[9px] bg-blue-500 text-white font-black px-1.5 py-0.5 rounded-md">
                              SIZ
                            </span>
                          )}
                        </h5>
                        <span className="text-[10px] text-slate-400 font-bold">
                          @{user.username}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block">
                          {user.score || 0} ball
                        </span>
                        <span className="text-[9px] text-amber-500 font-bold flex items-center gap-1 justify-end">
                          <i className="fas fa-star text-[8px]"></i> {user.stars || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

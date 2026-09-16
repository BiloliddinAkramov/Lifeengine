import React from 'react';
import { User, GlobalSettings } from '../types';
import { t } from '../services/translations';

interface PremiumTabProps {
  user: User;
  lang: 'uz' | 'ru' | 'en';
  theme: 'dark' | 'light';
  onUpdateUser: (user: User) => void;
  globalSettings: GlobalSettings;
}

export const PremiumTab: React.FC<PremiumTabProps> = ({
  user,
  lang,
  theme,
  onUpdateUser,
  globalSettings
}) => {
  const packages = [
    {
      id: 'p1',
      title: 'Starter',
      stars: 30,
      price: '19,000 UZS',
      popular: false,
      period: '1 oy',
      desc: '1 oylik to\'liq faollik uchun',
      features: [
        '30 kunlik tizimdan to\'liq foydalanish',
        'Barcha chellenj va odatlar ochiq',
        'Bulutli avtomatik sinxronizatsiya'
      ]
    },
    {
      id: 'p2',
      title: 'Pro Intizom',
      stars: 100,
      price: '49,000 UZS',
      popular: true,
      period: '3 oy',
      desc: '3 oylik uzluksiz intizom va natija',
      features: [
        '100 kunlik uzluksiz rejim',
        'AI Planner va shaxsiy chellenjlar',
        'Ustuvor bulutli zaxiralash',
        'Tejamkorlik (19,000 so\'m tejash)'
      ]
    },
    {
      id: 'p3',
      title: 'VIP Lifetime',
      stars: 999,
      price: '129,000 UZS',
      popular: false,
      period: 'Doimiy',
      desc: 'Cheksiz imkoniyatlar bir umrga',
      features: [
        '999+ yulduz (deyarli 3 yil)',
        'VIP status va maxsus nishon',
        'Barcha kelgusi yangilanishlar bepul',
        'Shaxsiy admin yordami'
      ]
    }
  ];

  const handleBuy = (pkg: typeof packages[0]) => {
    const text = encodeURIComponent(
      `Salom! Men Life Engine Pro do'konidan "${pkg.title}" (${pkg.price} - ${pkg.stars} yulduz) paketini sotib olmoqchiman.\n\nFoydalanuvchi: ${user.displayName || user.username}\nID: ${user.id}`
    );
    window.open(`https://t.me/uniworldowner?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto animate-slide-up space-y-5 sm:space-y-6 pb-12">
      {/* Sleek Minimal Header for Mobile & Desktop - No oversized banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm">
              <i className="fas fa-crown"></i>
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Yulduzlar Do'koni
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Ilovadan foydalanish uchun yulduzlar to'plami
          </p>
        </div>

        {/* User Balance Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 px-3.5 py-2 rounded-2xl shadow-sm">
          <i className="fas fa-star text-amber-500 text-sm animate-pulse"></i>
          <span className="text-xs font-black text-amber-900 dark:text-amber-200">
            Hisobingiz: <strong className="text-amber-600 dark:text-amber-400 font-black text-sm">{user.stars}</strong> ta yulduz
          </span>
        </div>
      </div>

      {/* Slim Info Strip */}
      <div className="bg-slate-100/80 dark:bg-slate-850 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 px-4 py-3 rounded-2xl flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
        <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs shrink-0 font-black">
          i
        </span>
        <p className="text-[11px] sm:text-xs leading-relaxed">
          Ilovaga har kuni kirganingizda hisobingizdan <strong>1 ta yulduz</strong> yechiladi va barcha ma'lumotlaringiz bulutda saqlanadi.
        </p>
      </div>

      {/* Mobile-Friendly Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {packages.map(pkg => (
          <div
            key={pkg.id}
            className={`bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border flex flex-col justify-between transition-all relative ${
              pkg.popular
                ? 'border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/20'
                : 'border-slate-200/90 dark:border-slate-800 shadow-md hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-md">
                Eng ommabop
              </div>
            )}

            <div>
              {/* Package Title & Period */}
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {pkg.title}
                </h4>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  {pkg.period}
                </span>
              </div>

              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mb-4 min-h-[32px]">
                {pkg.desc}
              </p>

              {/* Price Display */}
              <div className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {pkg.price}
                  </span>
                </div>

                {/* Stars amount badge */}
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black">
                  <i className="fas fa-star text-[11px]"></i>
                  <span>+{pkg.stars} Yulduz</span>
                </div>
              </div>

              {/* Feature List */}
              <ul className="space-y-2 mb-6 text-xs text-slate-600 dark:text-slate-300">
                {pkg.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[11px] sm:text-xs">
                    <i className="fas fa-check text-emerald-500 text-[10px] mt-0.5 shrink-0"></i>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mobile Touch Action Button */}
            <button
              onClick={() => handleBuy(pkg)}
              className={`w-full min-h-[46px] py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 ${
                pkg.popular
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
              }`}
            >
              <i className="fab fa-telegram-plane text-sm"></i>
              <span>Sotib Olish</span>
            </button>
          </div>
        ))}
      </div>

      {/* Slim Mobile-Friendly Telegram Support Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shrink-0">
            <i className="fab fa-telegram-plane"></i>
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              Maxsus to'lov yoki savollar bormi?
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              To'g'ridan-to'g'ri adminga yozishingiz mumkin: @uniworldowner
            </p>
          </div>
        </div>

        <a
          href="https://t.me/uniworldowner"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-5 py-2.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 active:scale-95 transition-all rounded-xl font-black text-xs uppercase tracking-wider border border-blue-200/50 dark:border-blue-800/50 flex items-center justify-center gap-2 shrink-0 min-h-[42px]"
        >
          <i className="fab fa-telegram-plane text-xs"></i>
          <span>@uniworldowner ga yozish</span>
        </a>
      </div>
    </div>
  );
};

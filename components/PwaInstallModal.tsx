import React, { useState, useEffect } from 'react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstalled?: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstalled
}) => {
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isInIframe, setIsInIframe] = useState<boolean>(false);

  useEffect(() => {
    // Check if running inside iframe
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }

    // Check iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIosDevice);

    // Check standalone
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult?.outcome === 'accepted') {
          setIsInstalled(true);
          onInstalled?.();
          onClose();
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    } else if (isInIframe) {
      // In iframe preview, open in standalone window for 1-click install
      window.open(window.location.href, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center transition-all"
        >
          <i className="fas fa-times text-sm"></i>
        </button>

        {/* Icon & App Info */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-xl shadow-slate-200/60 border border-slate-100 flex items-center justify-center p-2 mb-3">
            <img src="/logo.png" alt="Life Engine" className="w-full h-full object-contain" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Life Engine
          </h3>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            HAYOTINGIZNI BIZ BILAN TARTIBLANG
          </p>
        </div>

        {/* Action content based on browser/device */}
        {isInstalled ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center mb-6">
            <i className="fas fa-check-circle text-emerald-500 text-2xl mb-2"></i>
            <p className="text-xs font-black text-emerald-700 dark:text-emerald-300">
              Life Engine qurilmangizga muvaffaqiyatli o'rnatilgan!
            </p>
          </div>
        ) : deferredPrompt ? (
          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-center">
              <p className="text-xs text-blue-800 dark:text-blue-300 font-bold leading-relaxed">
                Tugmani bosing va Life Engine miyya logosi bilan telefoningizning bosh ekraniga ilova sifatida o'rnatiladi.
              </p>
            </div>
            <button
              onClick={handleInstallClick}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <i className="fas fa-download text-base"></i>
              <span>1 Bosishda O'rnatish</span>
            </button>
          </div>
        ) : isInIframe ? (
          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-center">
              <p className="text-xs text-blue-800 dark:text-blue-300 font-bold leading-relaxed">
                Brauzer cheklovlarisiz to'g'ridan-to'g'ri o'rnatish uchun ilovani alohida oynada oching va darhol o'rnatish buyrug'i chiqadi.
              </p>
            </div>
            <button
              onClick={handleInstallClick}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <i className="fas fa-external-link-alt text-base"></i>
              <span>1 Bosishda O'rnatish (Alohida Oynada)</span>
            </button>
          </div>
        ) : isIOS ? (
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 mb-6 text-left">
            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <i className="fab fa-apple text-sm text-blue-500"></i>
              iPhone / iPad uchun o'rnatish:
            </h4>
            <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 font-medium">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">1</span>
                Safari brauzerida pastdagi <strong className="text-blue-500 flex items-center gap-1"><i className="fas fa-share-square"></i> Ulashish (Share)</strong> tugmasini bosing.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">2</span>
                Menyuni pastga surib, <strong className="text-slate-900 dark:text-white">"Bosh ekranga qo'shish" (Add to Home Screen)</strong> ni tanlang.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">3</span>
                O'ng yuqoridagi <strong>"Qo'shish" (Add)</strong> tugmasini bosing.
              </li>
            </ol>
          </div>
        ) : (
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 mb-6 text-left">
            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <i className="fab fa-android text-sm text-emerald-500"></i>
              Brauzerdan o'rnatish:
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Brauzeringizning o'ng yuqori qismidagi <strong>3 nuqta (⋮)</strong> menyusini oching va <strong>"Ilovani o'rnatish"</strong> yoki <strong>"Bosh ekranga qo'shish"</strong> tugmasini tanlang.
            </p>
          </div>
        )}

        {/* Benefits list */}
        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="p-2">
            <i className="fas fa-bolt text-amber-500 text-sm mb-1 block"></i>
            <span className="text-[9px] font-bold text-slate-400 uppercase">Tezkor</span>
          </div>
          <div className="p-2">
            <i className="fas fa-wifi text-blue-500 text-sm mb-1 block"></i>
            <span className="text-[9px] font-bold text-slate-400 uppercase">Oflayn rejim</span>
          </div>
          <div className="p-2">
            <i className="fas fa-mobile-alt text-purple-500 text-sm mb-1 block"></i>
            <span className="text-[9px] font-bold text-slate-400 uppercase">To'liq ekran</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
        >
          Yopish
        </button>
      </div>
    </div>
  );
};

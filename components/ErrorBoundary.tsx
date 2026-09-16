import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Life Engine:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('life_engine_state_v7');
      localStorage.removeItem('life_engine_user_v7');
      localStorage.removeItem('admin_unlocked');
    } catch (e) {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 flex items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-6 text-2xl shadow-inner">
              <i className="fas fa-rotate-right animate-spin"></i>
            </div>
            
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Life Engine Pro
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium leading-relaxed">
              Ilovani yuklashda vaqtinchalik xatolik yuz berdi. Iltimos, ma'lumotlarni yangilab qayta ishga tushiring.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
              >
                Sahifani Yangilash
              </button>
              
              <button
                onClick={this.handleReset}
                className="w-full py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Xotirani tozalash & Qayta boshlash
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

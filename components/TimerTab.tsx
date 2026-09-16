import React, { useState, useEffect, useRef } from 'react';
import { t } from '../services/translations';

interface TimerTabProps {
  lang: 'uz' | 'ru' | 'en';
  theme: 'dark' | 'light';
  onCompleteSession: (minutes: number) => void;
}

export const TimerTab: React.FC<TimerTabProps> = ({
  lang,
  theme,
  onCompleteSession
}) => {
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [totalSessions, setTotalSessions] = useState<number>(0);
  const timerRef = useRef<any>(null);

  const initialTimes = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  };

  const handleModeChange = (newMode: 'work' | 'shortBreak' | 'longBreak') => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(initialTimes[newMode]);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            if (mode === 'work') {
              setTotalSessions(s => s + 1);
              onCompleteSession(25);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, mode, onCompleteSession]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(initialTimes[mode]);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const totalDuration = initialTimes[mode];
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div className="max-w-xl mx-auto animate-slide-up">
      {/* Mode Selector */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-8 border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => handleModeChange('work')}
          className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-all ${
            mode === 'work' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white'
          }`}
        >
          Pomodoro (25m)
        </button>
        <button
          onClick={() => handleModeChange('shortBreak')}
          className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-all ${
            mode === 'shortBreak' 
              ? 'bg-emerald-600 text-white shadow-lg' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white'
          }`}
        >
          Qisqa (5m)
        </button>
        <button
          onClick={() => handleModeChange('longBreak')}
          className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-all ${
            mode === 'longBreak' 
              ? 'bg-indigo-600 text-white shadow-lg' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white'
          }`}
        >
          Katta (15m)
        </button>
      </div>

      {/* Circular Timer Display */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl text-center relative overflow-hidden mb-8">
        <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="110"
              stroke="currentColor"
              strokeWidth="12"
              className="text-slate-100 dark:text-slate-800"
              fill="transparent"
            />
            <circle
              cx="128"
              cy="128"
              r="110"
              stroke="currentColor"
              strokeWidth="12"
              className={mode === 'work' ? 'text-blue-600' : mode === 'shortBreak' ? 'text-emerald-500' : 'text-indigo-500'}
              strokeDasharray={691}
              strokeDashoffset={691 - (691 * progress) / 100}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
              {formattedTime}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
              {isRunning ? (mode === 'work' ? 'Fokus vaqti' : 'Tanaffus') : 'Tayyor'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={toggleTimer}
            className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-xl active:scale-95 transition-all ${
              isRunning ? 'bg-rose-500 hover:bg-rose-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <i className={`fas ${isRunning ? 'fa-pause' : 'fa-play'} mr-2`}></i>
            {isRunning ? t(lang, 'pause') : t(lang, 'start')}
          </button>
          <button
            onClick={resetTimer}
            className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
            title={t(lang, 'reset')}
          >
            <i className="fas fa-rotate-right text-sm"></i>
          </button>
        </div>
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-md text-center">
          <span className="text-2xl md:text-3xl font-black text-blue-600 block mb-1">
            {totalSessions}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Bajarilgan seanslar
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-md text-center">
          <span className="text-2xl md:text-3xl font-black text-emerald-500 block mb-1">
            {totalSessions * 25} daqiqa
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Fokus umumiy vaqti
          </span>
        </div>
      </div>
    </div>
  );
};

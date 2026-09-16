import React, { useState } from 'react';
import { AppState } from '../types';
import { t } from '../services/translations';

interface FitnessTabProps {
  data: AppState;
  updateData: (updater: (prev: AppState) => AppState) => void;
  range: 7 | 15 | 30;
  lang: 'uz' | 'ru' | 'en';
}

export const FitnessTab: React.FC<FitnessTabProps> = ({
  data,
  updateData,
  range,
  lang
}) => {
  const [activeDay, setActiveDay] = useState<number>(0);
  const stepsList = Array.isArray(data?.steps) ? data.steps : [];
  const waterList = Array.isArray(data?.water) ? data.water : [];
  const weightList = Array.isArray(data?.weight) ? data.weight : [];
  const moodsListState = Array.isArray(data?.moods) ? data.moods : [];

  const currentSteps = stepsList[activeDay] || 0;
  const currentWater = waterList[activeDay] || 0;
  const currentWeight = weightList[activeDay] || 70;
  const currentMood = moodsListState[activeDay] || 'good';

  const handleStepChange = (val: number) => {
    updateData(prev => {
      const nextSteps = [...(Array.isArray(prev?.steps) ? prev.steps : Array(30).fill(7000))];
      nextSteps[activeDay] = Math.max(0, val);
      return { ...prev, steps: nextSteps };
    });
  };

  const handleWaterAdd = (amount: number) => {
    updateData(prev => {
      const nextWater = [...(Array.isArray(prev?.water) ? prev.water : Array(30).fill(1800))];
      nextWater[activeDay] = Math.max(0, (nextWater[activeDay] || 0) + amount);
      return { ...prev, water: nextWater };
    });
  };

  const handleWeightChange = (val: number) => {
    updateData(prev => {
      const nextWeight = [...(Array.isArray(prev?.weight) ? prev.weight : Array(30).fill(72.0))];
      nextWeight[activeDay] = val;
      return { ...prev, weight: nextWeight };
    });
  };

  const handleMoodSelect = (mood: string) => {
    updateData(prev => {
      const nextMoods = [...(Array.isArray(prev?.moods) ? prev.moods : Array(30).fill('good'))];
      nextMoods[activeDay] = mood;
      return { ...prev, moods: nextMoods };
    });
  };

  const moodsList = [
    { id: 'great', emoji: '🔥', label: 'Ajoyib' },
    { id: 'good', emoji: '😊', label: 'Yaxshi' },
    { id: 'neutral', emoji: '😐', label: 'O\'rtacha' },
    { id: 'tired', emoji: '🥱', label: 'Charchoq' },
    { id: 'bad', emoji: '🌧️', label: 'Tushkun' }
  ];

  const days = Array.from({ length: range }, (_, i) => i);

  return (
    <div className="max-w-4xl mx-auto animate-slide-up space-y-8">
      {/* Fitness Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-80">
            Salomatlik va Fitnes
          </h3>
          <span className="text-[10px] bg-white/20 px-3 py-1.5 rounded-xl font-black uppercase tracking-widest">
            {range} kunlik rejim
          </span>
        </div>
        <h2 className="text-2xl md:text-4xl font-black">
          Jismoniy va Ruhiy Tetiklik
        </h2>
      </div>

      {/* Day Selector Pill Grid */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-md">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 pl-2">
          Kunni tanlang
        </span>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {days.map(d => (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={`w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl shrink-0 flex flex-col items-center justify-center text-[10px] md:text-xs font-black transition-all ${
                activeDay === d
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              <span className="text-[7px] md:text-[8px] opacity-70 uppercase">Kun</span>
              <span>{d + 1}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Health Trackers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Steps Tracker */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                <i className="fas fa-running text-lg"></i>
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Qadamlar
              </h4>
            </div>
            <span className="text-xs font-black text-orange-500">
              Maqsad: {data.stepGoal}
            </span>
          </div>

          <div className="text-3xl font-black text-slate-900 dark:text-white mb-4">
            {currentSteps.toLocaleString()} <span className="text-xs text-slate-400 font-bold">qadam</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mb-6">
            <div
              className="bg-orange-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (currentSteps / data.stepGoal) * 100)}%` }}
            ></div>
          </div>

          {/* Quick Buttons */}
          <div className="flex gap-2">
            {[1000, 2500, 5000].map(step => (
              <button
                key={step}
                onClick={() => handleStepChange(currentSteps + step)}
                className="flex-1 py-2 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 text-xs font-black uppercase hover:bg-orange-100 active:scale-95 transition-all"
              >
                +{step}
              </button>
            ))}
          </div>
        </div>

        {/* Water Tracker */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                <i className="fas fa-droplet text-lg"></i>
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Suv Me'yori
              </h4>
            </div>
            <span className="text-xs font-black text-cyan-500">
              Maqsad: {data.waterGoal} ml
            </span>
          </div>

          <div className="text-3xl font-black text-slate-900 dark:text-white mb-4">
            {currentWater} <span className="text-xs text-slate-400 font-bold">ml</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mb-6">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (currentWater / data.waterGoal) * 100)}%` }}
            ></div>
          </div>

          {/* Quick Buttons */}
          <div className="flex gap-2">
            {[250, 500, 1000].map(amt => (
              <button
                key={amt}
                onClick={() => handleWaterAdd(amt)}
                className="flex-1 py-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 text-xs font-black uppercase hover:bg-cyan-100 active:scale-95 transition-all"
              >
                +{amt} ml
              </button>
            ))}
          </div>
        </div>

        {/* Weight & Mood Tracker */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <i className="fas fa-weight-scale text-lg"></i>
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Tana Vazni
            </h4>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {currentWeight} <span className="text-xs text-slate-400 font-bold">kg</span>
            </span>
            <span className="text-xs font-bold text-slate-400">
              Maqsad: {data.weightGoal} kg
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleWeightChange(parseFloat((currentWeight - 0.5).toFixed(1)))}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center active:scale-95 font-black text-lg"
            >
              -
            </button>
            <input
              type="number"
              step="0.1"
              value={currentWeight}
              onChange={(e) => handleWeightChange(parseFloat(e.target.value) || 70)}
              className="flex-1 text-center font-bold bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
            />
            <button
              onClick={() => handleWeightChange(parseFloat((currentWeight + 0.5).toFixed(1)))}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center active:scale-95 font-black text-lg"
            >
              +
            </button>
          </div>
        </div>

        {/* Mood Selector */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <i className="fas fa-smile text-lg"></i>
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Kunlik Kayfiyat
            </h4>
          </div>

          <div className="grid grid-cols-5 gap-2 mt-4">
            {moodsList.map(m => (
              <button
                key={m.id}
                onClick={() => handleMoodSelect(m.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${
                  currentMood === m.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span className="text-xl">{m.emoji}</span>
                <span className="text-[8px] font-black uppercase">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

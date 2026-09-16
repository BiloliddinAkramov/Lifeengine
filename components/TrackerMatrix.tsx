import React, { useState, useMemo } from 'react';
import { MatrixItem } from '../types';
import { t } from '../services/translations';

interface TrackerMatrixProps {
  items: MatrixItem[];
  type: 'tasks' | 'habits' | 'sleep';
  onToggle: (itemId: string, dayIndex: number) => void;
  onDelete: (itemId: string) => void;
  onRename: (itemId: string, newName: string) => void;
  color: 'blue' | 'emerald' | 'indigo' | 'orange';
  lang: 'uz' | 'ru' | 'en';
  theme: 'dark' | 'light';
  range: 7 | 15 | 30;
}

export const TrackerMatrix: React.FC<TrackerMatrixProps> = ({
  items,
  type,
  onToggle,
  onDelete,
  onRename,
  color = 'blue',
  lang,
  range
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');

  const isEmerald = color === 'emerald';

  const handleStartEdit = (item: MatrixItem) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const handleSaveEdit = (itemId: string) => {
    if (editName.trim()) {
      onRename(itemId, editName.trim());
    }
    setEditingId(null);
  };

  // Generate calendar days for columns matching the reference screenshot
  // e.g. YAK 16, DUSH 17, SESH 18, CHOR 19, PAY 20, JUM 21, SHAN 22...
  const dayColumns = useMemo(() => {
    const uzDays = ['YAK', 'DUSH', 'SESH', 'CHOR', 'PAY', 'JUM', 'SHAN'];
    const now = new Date();
    
    // We calculate dates ending on today or aligned cleanly
    const cols = [];
    for (let i = 0; i < range; i++) {
      const d = new Date(now);
      // Offset so the sequence ends around today or starts from the beginning of current range
      d.setDate(now.getDate() - (range - 1 - i));
      const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      cols.push({
        idx: i,
        dayName: uzDays[dayOfWeek],
        dayNumber: d.getDate(),
        isWeekend
      });
    }
    return cols;
  }, [range]);

  if (!items || items.length === 0) {
    return (
      <div className="p-12 text-center rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-xl">
        <i className="fas fa-clipboard-list text-3xl text-slate-300 dark:text-slate-600 mb-3 block"></i>
        <p className="text-sm font-bold text-slate-400">
          {type === 'tasks' ? 'Hozircha vazifalar mavjud emas' : 'Hozircha odatlar mavjud emas'}
        </p>
      </div>
    );
  }

  const tableHeaderTitle = type === 'tasks' ? 'VAZIFALAR' : type === 'habits' ? 'ODATLAR' : 'UYQU';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-[2rem] p-2.5 sm:p-4 md:p-8 border border-slate-100 dark:border-slate-800 shadow-lg overflow-hidden transition-colors">
      {/* Scrollable container with fixed min-width, scrollbar hidden cleanly */}
      <div className="overflow-x-auto pb-1 md:pb-2 hide-scrollbar no-scrollbar">
        <div className="min-w-max">
          {/* Header Row */}
          <div className="flex items-center pb-3 md:pb-4 mb-2 md:mb-3 border-b border-slate-100 dark:border-slate-800/80 select-none">
            {/* Title column */}
            <div className="w-28 sm:w-36 md:w-64 shrink-0 pl-1 md:pl-2">
              <span className="text-[10px] sm:text-xs font-black tracking-wider text-slate-800 dark:text-slate-200 uppercase">
                {tableHeaderTitle}
              </span>
            </div>

            {/* Days columns with 2-row dayName and dayNumber */}
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 px-1 md:px-2">
              {dayColumns.map(({ idx, dayName, dayNumber, isWeekend }) => (
                <div
                  key={idx}
                  className="w-7 sm:w-8 md:w-10 min-w-[28px] sm:min-w-[32px] md:min-w-[40px] flex flex-col items-center justify-center text-center"
                >
                  <span
                    className={`text-[7px] sm:text-[8px] md:text-[10px] font-black uppercase tracking-tight ${
                      isWeekend ? 'text-rose-500' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {dayName}
                  </span>
                  <span
                    className={`text-[10px] sm:text-xs md:text-sm font-black leading-tight ${
                      isWeekend ? 'text-rose-500' : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {dayNumber}
                  </span>
                </div>
              ))}
            </div>

            {/* Efficiency column */}
            <div className="w-14 sm:w-16 md:w-20 shrink-0 text-center pr-1 md:pr-2">
              <span className="text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-wider text-slate-400">
                {t(lang, 'efficiency')}
              </span>
            </div>
          </div>

          {/* Item Rows */}
          <div className="space-y-2 md:space-y-3 pt-1">
            {items.map((item) => {
              const itemData = Array.isArray(item?.data) ? item.data : Array(30).fill(false);
              const activeCount = itemData.slice(0, range).filter(Boolean).length;
              const percentage = Math.round((activeCount / (range || 1)) * 100);

              return (
                <div
                  key={item.id}
                  className="flex items-center p-1.5 md:p-2 rounded-xl md:rounded-2xl hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all group"
                >
                  {/* Name and Rename / Delete */}
                  <div className="w-28 sm:w-36 md:w-64 shrink-0 pr-2 md:pr-4 flex items-center justify-between gap-1.5">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-1 w-full">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(item.id)}
                          className={`w-full text-[11px] md:text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg md:rounded-xl outline-none text-slate-900 dark:text-white ${
                            isEmerald ? 'focus:border-emerald-500' : 'focus:border-blue-500'
                          }`}
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(item.id)}
                          className="text-emerald-500 hover:text-emerald-600 p-1 shrink-0"
                          title="Saqlash"
                        >
                          <i className="fas fa-check text-xs"></i>
                        </button>
                      </div>
                    ) : (
                      <>
                        <span
                          onClick={() => handleStartEdit(item)}
                          className={`text-[11px] sm:text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 truncate cursor-pointer transition-colors ${
                            isEmerald ? 'hover:text-emerald-600 dark:hover:text-emerald-400' : 'hover:text-blue-600 dark:hover:text-blue-400'
                          }`}
                          title="Tahrirlash uchun bosing"
                        >
                          {item.name || 'Nomsiz'}
                        </span>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 p-1 transition-all shrink-0"
                          title={t(lang, 'delete')}
                        >
                          <i className="fas fa-trash-alt text-[10px] md:text-[11px]"></i>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Day Checkboxes (Katakchalar) - Compact on mobile, clean square on desktop */}
                  <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 px-1 md:px-2">
                    {dayColumns.map(({ idx }) => {
                      const isDone = Boolean(itemData[idx]);

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onToggle(item.id, idx)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 min-w-[28px] min-h-[28px] sm:min-w-[32px] sm:min-h-[32px] md:min-w-[40px] md:min-h-[40px] rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-150 select-none ${
                            isDone
                              ? isEmerald
                                ? 'bg-white dark:bg-slate-800 border-[1.5px] md:border-[2px] border-emerald-600 dark:border-emerald-400 shadow-sm active:scale-90'
                                : 'bg-white dark:bg-slate-800 border-[1.5px] md:border-[2px] border-slate-900 dark:border-white shadow-sm active:scale-90'
                              : isEmerald
                                ? 'bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-slate-100/80 active:scale-90'
                                : 'bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-100/80 active:scale-90'
                          }`}
                          title={`${idx + 1}-kun`}
                        >
                          {isDone && (
                            <svg
                              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 stroke-[3.5] ${
                                isEmerald ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Efficiency percentage badge at the right */}
                  <div className="w-14 sm:w-16 md:w-20 shrink-0 text-center pr-1 md:pr-2 flex justify-center">
                    <span className={`px-1.5 py-0.5 md:px-3 md:py-1 rounded-md md:rounded-xl text-[10px] md:text-xs font-black border ${
                      isEmerald
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/80'
                        : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800/80'
                    }`}>
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

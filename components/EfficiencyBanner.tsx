import React from 'react';

interface EfficiencyBannerProps {
  efficiency: number;
  range: 7 | 15 | 30;
  type: 'tasks' | 'habits';
  title?: string;
  dailyCounts: number[];
  color?: 'blue' | 'emerald';
}

export const EfficiencyBanner: React.FC<EfficiencyBannerProps> = ({
  efficiency,
  range,
  type,
  title,
  dailyCounts,
  color = 'blue'
}) => {
  const rangeLabel = range === 7 ? '1 HAFTA' : range === 15 ? '15 KUN' : '30 KUN';
  const isEmerald = color === 'emerald' || type === 'habits';
  const bannerTitle = title || (type === 'tasks' ? 'SAMARADORLIK' : 'ODATLAR SAMARADORLIGI');

  // Generate 8-12 visual bars for the left side of the banner
  const barsCount = 10;
  const recentDays = dailyCounts.slice(0, barsCount);
  while (recentDays.length < barsCount) recentDays.push(0);

  // SVG Circular progress math
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (efficiency / 100) * circumference;

  return (
    <div className={`${
      isEmerald 
        ? 'bg-[#059669] shadow-emerald-600/25' 
        : 'bg-[#1b61f2] shadow-blue-600/25'
    } rounded-2xl sm:rounded-[2.2rem] p-3.5 sm:p-5 md:p-8 text-white shadow-xl relative overflow-hidden select-none transition-colors duration-300`}>
      {/* Top row: Title and Range pill */}
      <div className="flex justify-between items-center mb-2.5 sm:mb-4 md:mb-6">
        <h3 className="text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white/90">
          {bannerTitle}
        </h3>
        <span className="bg-white/20 backdrop-blur-md px-2.5 sm:px-4 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-black uppercase tracking-wider text-white shadow-inner">
          {rangeLabel}
        </span>
      </div>

      {/* Visual content row: Left bars, Center circle, Right wave */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 md:gap-6 items-center">
        {/* Left: Dynamic White Bar Chart */}
        <div className="hidden md:flex items-end justify-center gap-2 h-28 px-4">
          {recentDays.map((cnt, idx) => {
            // Give varied heights with a prominent spike like in the reference image
            const baseH = idx === 6 ? 90 : (cnt > 0 ? Math.min(85, Math.max(25, cnt * 28)) : (idx % 2 === 0 ? 38 : 48));
            return (
              <div
                key={idx}
                className="w-1.5 md:w-2 bg-white rounded-full transition-all duration-500 ease-out opacity-90 hover:opacity-100"
                style={{ height: `${baseH}%` }}
                title={`${idx + 1}-kun: ${cnt} ta`}
              />
            );
          })}
        </div>

        {/* Center: Radial Circular Gauge */}
        <div className="flex items-center justify-center py-0 sm:py-1 md:py-0">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 flex items-center justify-center">
            <svg className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 transform -rotate-90">
              {/* Background Track Mobile */}
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="5"
                fill="none"
                className="sm:hidden"
              />
              {/* Background Track Tablet */}
              <circle
                cx="48"
                cy="48"
                r="38"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="5.5"
                fill="none"
                className="hidden sm:block md:hidden"
              />
              {/* Background Track Desktop */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="7"
                fill="none"
                className="hidden md:block"
              />
              {/* Active Progress Mobile */}
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#ffffff"
                strokeWidth="5"
                fill="none"
                strokeDasharray={2 * Math.PI * 32}
                strokeDashoffset={2 * Math.PI * 32 - (efficiency / 100) * (2 * Math.PI * 32)}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out sm:hidden"
              />
              {/* Active Progress Tablet */}
              <circle
                cx="48"
                cy="48"
                r="38"
                stroke="#ffffff"
                strokeWidth="5.5"
                fill="none"
                strokeDasharray={2 * Math.PI * 38}
                strokeDashoffset={2 * Math.PI * 38 - (efficiency / 100) * (2 * Math.PI * 38)}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out hidden sm:block md:hidden"
              />
              {/* Active Progress Desktop */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="#ffffff"
                strokeWidth="7"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out hidden md:block"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                {efficiency}%
              </span>
            </div>
          </div>
        </div>

        {/* Right: Soundwave / Frequency Curve matching the screenshot */}
        <div className="hidden md:flex items-center justify-center h-28 px-2">
          <svg
            className="w-full max-w-[220px] h-20 overflow-visible"
            viewBox="0 0 200 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Smooth pulse wave */}
            <path
              d="M 5 45 L 60 45 L 68 70 L 76 45 L 84 72 L 92 45 L 100 10 L 106 72 L 112 45 L 120 72 L 128 72 L 195 72"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

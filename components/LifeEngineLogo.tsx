import React from 'react';

interface LifeEngineLogoProps {
  className?: string;
  showText?: boolean;
  size?: number | string;
  textColor?: string;
}

export const LifeEngineLogo: React.FC<LifeEngineLogoProps> = ({
  className = "w-12 h-12",
  showText = false,
  textColor
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 512 512"
        className="w-full h-full shrink-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoBlueGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0066ee" />
            <stop offset="50%" stopColor="#0088ff" />
            <stop offset="100%" stopColor="#26c2ff" />
          </linearGradient>
        </defs>

        {/* LEFT PILLAR OF 'H' */}
        <path 
          d="M 164 136 
             L 204 136 
             L 204 200 
             L 190 200 
             L 190 152 
             L 178 152 
             L 178 240 
             L 164 240 
             Z" 
          fill="#0c2038" 
        />
        <path 
          d="M 164 240
             L 178 240
             L 178 288
             L 190 288
             L 190 248
             L 204 248
             L 204 300
             L 164 300
             Z"
          fill="#0c2038"
        />

        {/* RIGHT PILLAR OF 'H' */}
        <path 
          d="M 308 136 
             L 348 136 
             L 348 300 
             L 308 300 
             L 308 230 
             L 322 230 
             L 322 286 
             L 334 286 
             L 334 150 
             L 322 150 
             L 322 178 
             L 308 184 
             Z" 
          fill="#0c2038" 
        />

        {/* LOWER SWOOSH: Navy curved wave flowing from bottom-left */}
        <path 
          d="M 164 300 
             C 164 250, 180 216, 216 204
             C 252 192, 290 196, 348 226
             C 310 216, 260 210, 222 222
             C 186 234, 178 266, 178 300
             Z" 
          fill="#0c2038" 
        />

        {/* UPPER DYNAMIC SWOOSH: Electric Blue / Cyan wave */}
        <path 
          d="M 204 206 
             C 240 188, 276 182, 320 162
             C 346 150, 370 134, 388 138
             C 378 152, 356 182, 326 196
             C 284 216, 244 212, 204 206
             Z" 
          fill="url(#logoBlueGrad)" 
        />

        {/* Highlight accent on swoosh */}
        <path 
          d="M 204 206 
             C 244 196, 280 192, 330 188
             C 358 174, 374 158, 388 138
             C 372 150, 350 170, 324 180
             C 280 196, 240 200, 204 206
             Z"
          fill="#40c4ff"
          opacity="0.8"
        />

        {showText && (
          <text 
            x="256" 
            y="370" 
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Montserrat', sans-serif" 
            fontSize="44" 
            fontWeight="900" 
            letterSpacing="5" 
            textAnchor="middle" 
            fill={textColor || "#0c2038"}
          >
            LIFEENGINE
          </text>
        )}
      </svg>
    </div>
  );
};

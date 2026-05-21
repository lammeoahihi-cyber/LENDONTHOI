import React from 'react';

// Decorative Components
export const Sparkle: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 0C50 0 55 40 100 50C100 50 55 60 50 100C50 100 45 60 0 50C0 50 45 40 50 0Z" fill="url(#sparkle-grad)"/>
    <defs>
      <radialGradient id="sparkle-grad" cx="50" cy="50" r="50" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE047" />
        <stop offset="0.5" stopColor="#F59E0B" />
        <stop offset="1" stopColor="#D97706" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

export const Star: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 10L61 39H92L67 58L76 87L50 70L24 87L33 58L8 39H39L50 10Z" fill="url(#star-grad)"/>
    <defs>
      <linearGradient id="star-grad" x1="50" y1="10" x2="50" y2="87" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FEF08A" />
        <stop offset="1" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
  </svg>
);

export const FallingSparkles = () => {
  const sparkles = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDuration: `${5 + Math.random() * 8}s`,
    animationDelay: `${Math.random() * 5}s`,
    type: Math.random() > 0.5 ? 'sparkle' : 'star',
    size: Math.random() * 15 + 10 // 10px to 25px
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {sparkles.map(p => (
        <div 
          key={p.id}
          className="absolute -top-10 opacity-60 mix-blend-screen animate-fall"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animation: `fall ${p.animationDuration} linear infinite`,
            animationDelay: p.animationDelay
          }}
        >
          {p.type === 'sparkle' ? <Sparkle className="w-full h-full animate-pulse" /> : <Star className="w-full h-full animate-spin-slow" />}
        </div>
      ))}
    </div>
  );
};

export const BubbleSVG: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="2" fill="rgba(14, 165, 233, 0.08)" />
    <circle cx="35" cy="35" r="10" fill="#ffffff" opacity="0.4" />
    <circle cx="32" cy="32" r="5" fill="#ffffff" opacity="0.6" />
  </svg>
);

export const StarfishSVG: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 10L61 39H92L67 58L76 87L50 70L24 87L33 58L8 39H39L50 10Z" fill="url(#starfish-grad)"/>
    <defs>
      <linearGradient id="starfish-grad" x1="50" y1="10" x2="50" y2="87" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ff4757" />
        <stop offset="1" stopColor="#ff6b81" />
      </linearGradient>
    </defs>
  </svg>
);

export const JellyfishSVG: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 50 C20 15, 80 15, 80 50 C80 53, 20 53, 20 50 Z" fill="url(#jelly-grad)" opacity="0.7" />
    <path d="M20 50 Q30 54 40 50 Q50 54 60 50 Q70 54 80 50" stroke="rgba(147, 197, 253, 0.5)" strokeWidth="2" />
    <path d="M30 52 Q 25 70, 35 90 T 30 115" stroke="rgba(147, 197, 253, 0.3)" strokeWidth="2" fill="none" />
    <path d="M45 52 Q 50 75, 40 95 T 48 118" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1.5" fill="none" />
    <path d="M55 52 Q 50 75, 60 95 T 52 118" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1.5" fill="none" />
    <path d="M70 52 Q 75 70, 65 90 T 70 115" stroke="rgba(147, 197, 253, 0.3)" strokeWidth="2" fill="none" />
    <defs>
      <linearGradient id="jelly-grad" x1="50" y1="20" x2="50" y2="55" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38bdf8" />
        <stop offset="1" stopColor="#818cf8" />
      </linearGradient>
    </defs>
  </svg>
);

export const FishSVG: React.FC<{ className?: string; color1?: string; color2?: string }> = ({ className, color1 = "#38bdf8", color2 = "#0369a1" }) => (
  <svg className={className} viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 25 C 35 10, 75 10, 95 25 C 75 40, 35 40, 15 25 Z" fill={`url(#fish-grad-${color1.replace('#', '')}-${color2.replace('#', '')})`} />
    <path d="M15 25 L 0 13 L 6 25 L 0 37 Z" fill={color2} />
    <path d="M50 17 C 55 8, 65 8, 68 17 Z" fill={color2} />
    <path d="M52 33 C 58 41, 65 41, 68 33 Z" fill={color2} />
    <circle cx="82" cy="22" r="3.5" fill="#ffffff" />
    <circle cx="83.5" cy="22" r="1.5" fill="#000000" />
    <defs>
      <linearGradient id={`fish-grad-${color1.replace('#', '')}-${color2.replace('#', '')}`} x1="0" y1="25" x2="100" y2="25" gradientUnits="userSpaceOnUse">
        <stop stopColor={color1} />
        <stop offset="1" stopColor={color2} />
      </linearGradient>
    </defs>
  </svg>
);

export const RisingBubbles = () => {
  const bubbles = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDuration: `${7 + Math.random() * 12}s`,
    animationDelay: `${Math.random() * 8}s`,
    size: Math.random() * 16 + 8 // 8px to 24px
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {bubbles.map(b => (
        <div 
          key={b.id}
          className="absolute opacity-40 pointer-events-none"
          style={{
            left: b.left,
            bottom: '-40px',
            width: b.size,
            height: b.size,
            animation: `rise ${b.animationDuration} linear infinite`,
            animationDelay: b.animationDelay
          }}
        >
          <BubbleSVG className="w-full h-full animate-pulse" />
        </div>
      ))}
    </div>
  );
};

interface FishConfig {
  id: number;
  direction: 'left-to-right' | 'right-to-left';
  top: string;
  size: number;
  speed: string;
  delay: string;
  color1: string;
  color2: string;
}

export const SwimmingFish = () => {
  const fishList: FishConfig[] = [
    { id: 1, direction: 'left-to-right', top: '22vh', size: 60, speed: '22s', delay: '0s', color1: '#f97316', color2: '#ea580c' },
    { id: 2, direction: 'right-to-left', top: '38vh', size: 70, speed: '26s', delay: '3s', color1: '#06b6d4', color2: '#0891b2' },
    { id: 3, direction: 'left-to-right', top: '58vh', size: 50, speed: '18s', delay: '6s', color1: '#facc15', color2: '#eab308' },
    { id: 4, direction: 'right-to-left', top: '78vh', size: 80, speed: '30s', delay: '1s', color1: '#ec4899', color2: '#db2777' },
    { id: 5, direction: 'left-to-right', top: '30vh', size: 55, speed: '20s', delay: '10s', color1: '#10b981', color2: '#059669' },
    { id: 6, direction: 'right-to-left', top: '68vh', size: 52, speed: '24s', delay: '8s', color1: '#a855f7', color2: '#7c3aed' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {fishList.map(fish => {
        const isLeftToRight = fish.direction === 'left-to-right';
        return (
          <div
            key={fish.id}
            className="absolute opacity-70 hover:opacity-100 transition-opacity duration-300"
            style={{
              top: fish.top,
              width: fish.size,
              height: fish.size * 0.5,
              animation: `${isLeftToRight ? 'swimLTR' : 'swimRTL'} ${fish.speed} linear infinite`,
              animationDelay: fish.delay,
              left: isLeftToRight ? '-150px' : 'auto',
              right: isLeftToRight ? 'auto' : '-150px'
            }}
          >
            <div
              style={{ transform: isLeftToRight ? 'none' : 'scaleX(-1)' }}
              className="w-full h-full"
            >
              <div
                style={{
                  animation: 'fishWiggle 3.5s ease-in-out infinite',
                  animationDelay: `${fish.id * 0.4}s`
                }}
                className="w-full h-full"
              >
                <FishSVG color1={fish.color1} color2={fish.color2} className="w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)]" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const Couplet: React.FC<{ text: string; position: 'left' | 'right'; theme: 'ocean' | 'tet' }> = ({ text, position, theme }) => {
  const words = text.split(' ');
  const isOcean = theme === 'ocean';

  if (isOcean) {
    return (
      <div className={`fixed top-1/2 -translate-y-1/2 ${position === 'left' ? 'left-4 lg:left-8' : 'right-4 lg:right-8'} hidden xl:flex flex-col items-center z-20 animate-float`} style={{ animationDelay: position === 'left' ? '0s' : '1.5s' }}>
        <div className="bg-gradient-to-b from-cyan-950/80 via-slate-900/80 to-blue-950/80 text-cyan-300 py-10 px-4 rounded-[40px] border-4 border-cyan-400/60 shadow-[0_0_35px_rgba(34,211,238,0.3)] flex flex-col gap-5 items-center justify-center relative overflow-hidden backdrop-blur-md">
          <div className="absolute inset-2 border-2 border-dashed border-cyan-400/20 rounded-[32px] pointer-events-none"></div>
          <div className="absolute top-2 opacity-30 text-xs">🫧</div>
          {words.map((word, i) => (
            <span key={i} className="font-sans font-black text-2xl lg:text-3xl uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-br from-cyan-200 to-teal-400 drop-shadow-[0_2px_8px_rgba(6,182,212,0.4)] relative z-10" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              {word}
            </span>
          ))}
          <div className="absolute bottom-2 opacity-30 text-xs">🫧</div>
        </div>
      </div>
    );
  } else {
    return (
      <div className={`fixed top-1/2 -translate-y-1/2 ${position === 'left' ? 'left-4 lg:left-8' : 'right-4 lg:right-8'} hidden xl:flex flex-col items-center z-20 animate-float`} style={{ animationDelay: position === 'left' ? '0s' : '1.5s' }}>
        <div className="bg-gradient-to-b from-red-700 via-red-600 to-red-800 text-yellow-300 py-10 px-4 rounded-[40px] border-4 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.5)] flex flex-col gap-5 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-2 border-2 border-dashed border-yellow-300/40 rounded-[32px] pointer-events-none"></div>
          {words.map((word, i) => (
            <span key={i} className="font-tet-title text-2xl lg:text-3xl font-black uppercase drop-shadow-lg relative z-10" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}>
              {word}
            </span>
          ))}
        </div>
      </div>
    );
  }
};

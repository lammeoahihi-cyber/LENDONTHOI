
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  theme: 'ocean' | 'tet';
  toggleTheme: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, theme, toggleTheme }) => {
  const isOcean = theme === 'ocean';

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden transition-all duration-500">
      {/* Decorative Top Border */}
      <div className={`h-2 transition-all duration-500 ${isOcean ? 'bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500' : 'bg-gradient-to-r from-red-500 via-yellow-400 to-red-600'}`}></div>
      
      <header className={`transition-all duration-500 border-b-4 shadow-xl sticky top-0 z-50 backdrop-blur-md ${isOcean ? 'bg-slate-900/95 border-cyan-800 shadow-cyan-950/10' : 'bg-yellow-50/95 border-yellow-400 shadow-yellow-250/20'}`}>
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Theme Toggle Pill Switch - Corner Left! */}
            <div className={`p-1 rounded-full flex items-center gap-1 border transition-all duration-500 ${isOcean ? 'bg-slate-950/80 border-cyan-500/30' : 'bg-yellow-105 border-yellow-300 shadow-inner shadow-yellow-100/10'}`}>
              <button
                onClick={() => theme !== 'tet' && toggleTheme()}
                className={`px-3 py-1.5 rounded-full text-[11px] md:text-xs font-black flex items-center gap-1 transition-all duration-300 active:scale-95 ${
                  !isOcean
                    ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-md'
                    : 'text-cyan-400/70 hover:text-cyan-300'
                }`}
              >
                <span>🧧</span> Cũ
              </button>
              <button
                onClick={() => theme !== 'ocean' && toggleTheme()}
                className={`px-3 py-1.5 rounded-full text-[11px] md:text-xs font-black flex items-center gap-1 transition-all duration-300 active:scale-95 ${
                  isOcean
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'text-amber-805/70 hover:text-amber-700'
                }`}
              >
                <span>🌊</span> Mới
              </button>
            </div>

            {/* Separator */}
            <div className={`h-8 w-[2px] transition-all duration-500 ${isOcean ? 'bg-cyan-500/20' : 'bg-yellow-300/40'}`}></div>

            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl border-2 transition-all duration-500 hidden sm:block ${isOcean ? 'bg-slate-800 border-cyan-500/40' : 'bg-red-650 border-yellow-300'}`}>
                <svg className={`w-5 h-5 animate-pulse transition-all duration-500 ${isOcean ? 'text-cyan-400' : 'text-yellow-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <span className={`text-xl md:text-2xl font-black tracking-tight font-tet-title drop-shadow-md transition-all duration-500 ${isOcean ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-teal-300' : 'text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-amber-600'}`}>
                  LÊN ĐƠN THÔI
                </span>
                <p className={`text-[9px] md:text-[10px] uppercase tracking-widest font-mono font-bold opacity-90 transition-all duration-500 ${isOcean ? 'text-cyan-400' : 'text-red-600'}`}>
                  {isOcean ? 'Đáy biển vượt trùng khơi' : 'Bản Tết Cực Hanh Thông'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <nav className={`flex gap-6 text-sm font-bold transition-all duration-500 ${isOcean ? 'text-cyan-200' : 'text-amber-900'}`}>
              <a href="#" className={`hover:opacity-85 transition-colors flex items-center gap-1.5 group ${isOcean ? 'hover:text-cyan-400' : 'hover:text-red-600'}`}>
                <span className={`w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all ${isOcean ? 'bg-cyan-400' : 'bg-red-500'}`}></span>
                Công cụ
              </a>
              <a href="#" className={`hover:opacity-85 transition-colors flex items-center gap-1.5 group ${isOcean ? 'hover:text-cyan-400' : 'hover:text-red-600'}`}>
                <span className={`w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all ${isOcean ? 'bg-cyan-400' : 'bg-red-500'}`}></span>
                Hướng dẫn
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full relative z-10">
        {children}
      </main>

      <footer className={`pt-10 pb-8 mt-10 relative overflow-hidden transition-all duration-500 border-t-4 ${isOcean ? 'bg-slate-950 border-cyan-800' : 'bg-yellow-50 border-yellow-400'}`}>
        {/* Abstract pattern overlays */}
        {isOcean ? (
          <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(#22d3ee 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
        ) : (
          <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(#d97706 1px, transparent 1px)', backgroundSize: '24px 24px'}}></div>
        )}
        
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <p className={`font-tet-title text-lg mb-2 tracking-wide font-black transition-all duration-500 ${isOcean ? 'text-cyan-400' : 'text-red-600'}`}>
            {isOcean ? '⚓ THUẬN BUỒM XUÔI GIÓ ⚓' : '🧧 TẤN TÀI TẤN LỘC - VẠN SỰ HANH THÔNG 🧧'}
          </p>
          <p className={`text-sm font-bold opacity-80 transition-all duration-500 ${isOcean ? 'text-cyan-200' : 'text-amber-900'}`}>
            &copy; {new Date().getFullYear()} LÊN ĐƠN THÔI. {isOcean ? 'Vượt trùng khơi - Thu hoạch ngập tràn.' : 'Phiên bản Cổ Truyền - Xuân Phú Quý, Tết An Khang.'}
          </p>
          <p className={`text-xs font-mono tracking-widest uppercase mt-4 opacity-75 transition-all duration-500 ${isOcean ? 'text-cyan-400' : 'text-red-600'}`}>
            Made By LÂM
          </p>
        </div>
      </footer>
    </div>
  );
};

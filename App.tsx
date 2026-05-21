import React, { useState, useRef, useEffect } from 'react';
import { Layout } from './components/Layout';
import { processExcelFiles } from './services/excelService';
import { ProcessingState, HistoryItem, Platform } from './types';
import { ACCEPTED_FILE_TYPES } from './constants';

const MAX_FILES = 5;
const STORAGE_KEY = 'len_don_cung_lam_history_v2';

// Decorative Components
const Sparkle: React.FC<{ className?: string }> = ({ className }) => (
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

const Star: React.FC<{ className?: string }> = ({ className }) => (
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

const FallingSparkles = () => {
  const sparkles = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDuration: `${5 + Math.random() * 8}s`,
    animationDelay: `${Math.random() * 5}s`,
    type: Math.random() > 0.5 ? 'sparkle' : 'star',
    size: Math.random() * 15 + 10
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {sparkles.map(p => (
        <div 
          key={p.id}
          className="absolute -top-10 opacity-60 mix-blend-screen"
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

const Couplet: React.FC<{ text: string, position: 'left' | 'right' }> = ({ text, position }) => {
  const words = text.split(' ');
  return (
    <div 
      className={`cau-doi-anim fixed top-20 hidden xl:flex flex-col items-center z-20 ${position === 'left' ? 'left-10' : 'right-10'}`} 
      style={{ animationDelay: position === 'left' ? '0s' : '0.5s' }}
    >
      <div className="bg-gradient-to-b from-red-700 via-red-600 to-red-800 text-yellow-300 py-10 px-4 rounded-[40px] border-4 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.4)] flex flex-col gap-5 items-center">
        <div className="absolute inset-2 border-2 border-dashed border-yellow-300/40 rounded-[32px] pointer-events-none"></div>
        {words.map((word, i) => (
          <span key={i} className="font-tet-title text-2xl lg:text-3xl font-black uppercase drop-shadow-lg relative z-10" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}>
            {word}
          </span>
        ))}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState<Platform>('shopee');
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessingState>({ status: 'idle', message: '' });
  const [processedFileUrl, setProcessedFileUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const addToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    setHistory(prev => [newItem, ...prev].slice(0, 50));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles: File[] = Array.from(event.target.files || []);
    if (files.length + selectedFiles.length > MAX_FILES) {
      setState({ status: 'error', message: `Tối đa ${MAX_FILES} file mỗi lần.` });
      return;
    }
    const validFiles = selectedFiles.filter(f => ACCEPTED_FILE_TYPES.includes(f.type));
    if (validFiles.length !== selectedFiles.length) {
      setState({ status: 'error', message: 'Chỉ chấp nhận file Excel (.xlsx, .xls).' });
    } else {
      setState({ status: 'idle', message: '' });
      validFiles.forEach(f => {
        addToHistory({ type: 'upload', filename: f.name, size: f.size, platform: activePlatform });
      });
    }
    setFiles(prev => [...prev, ...validFiles]);
    setProcessedFileUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (files.length <= 1) {
      setProcessedFileUrl(null);
      setState({ status: 'idle', message: '' });
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setState({ status: 'processing', message: `Đang xử lý đơn ${activePlatform.toUpperCase()}...` });
    try {
      const blob = await processExcelFiles(files, activePlatform);
      const url = URL.createObjectURL(blob);
      setProcessedFileUrl(url);
      setState({ status: 'success', message: `Gộp đơn ${activePlatform.toUpperCase()} thành công!` });
      addToHistory({ 
        type: 'download', 
        filename: `KET_QUA_${activePlatform.toUpperCase()}_${new Date().getTime()}.xlsx`, 
        count: files.length,
        platform: activePlatform
      });
    } catch (error: any) {
      setState({ status: 'error', message: error.message || 'Lỗi xử lý file.' });
    }
  };

  const reset = () => {
    setFiles([]);
    setState({ status: 'idle', message: '' });
    setProcessedFileUrl(null);
  };

  const clearHistory = () => {
    if (confirm('Xóa toàn bộ lịch sử?')) setHistory([]);
  };

  return (
    <Layout>
      <FallingSparkles />
      <Couplet text="Đơn thưa, lòng không nản" position="left" />
      <Couplet text="Chí vững, lộc ắt về" position="right" />
      
      {/* Background Decorations */}
      <div className="fixed top-20 left-4 w-32 h-32 opacity-40 pointer-events-none hidden lg:block animate-pulse mix-blend-screen">
        <Sparkle className="w-full h-full drop-shadow-2xl text-yellow-300" />
      </div>
      <div className="fixed top-24 right-10 w-24 h-24 opacity-50 pointer-events-none hidden lg:block animate-pulse mix-blend-screen" style={{ animationDelay: '1s' }}>
        <Star className="w-full h-full drop-shadow-2xl" />
      </div>
      <div className="fixed bottom-10 left-10 w-40 h-40 opacity-30 pointer-events-none z-0 animate-float mix-blend-screen">
         <Sparkle className="w-full h-full" />
      </div>
      <div className="fixed bottom-20 right-5 w-28 h-28 opacity-40 pointer-events-none z-0 animate-float mix-blend-screen" style={{ animationDelay: '1.5s' }}>
         <Star className="w-full h-full" />
      </div>

      <div className="flex flex-col gap-10 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 px-6 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase border border-yellow-300 shadow-md shadow-yellow-200/50 animate-bounce-slow">
            <span className="text-yellow-600 animate-pulse">✨</span> Phiên Bản CÓ ĐƠN <span className="text-yellow-600 animate-pulse">✨</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none font-tet-title mt-4 text-transparent bg-clip-text bg-gradient-to-br from-yellow-500 via-yellow-300 to-amber-600 animate-shimmer drop-shadow-lg" style={{textShadow: '0 4px 20px rgba(251, 191, 36, 0.4)'}}>
            LÊN ĐƠN THÔI
          </h1>
        </div>

        {/* Platform Tabs */}
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-2 rounded-2xl border-2 border-yellow-300 shadow-inner flex gap-2">
            <button 
              onClick={() => { setActivePlatform('shopee'); reset(); }}
              className={`px-8 py-3 rounded-xl font-bold text-lg transition-all border-2 duration-300 ${
                activePlatform === 'shopee' 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-400 shadow-lg shadow-orange-300/50 scale-105' 
                  : 'bg-white text-orange-800 border-transparent hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600'
              }`}
            >
              SHOPEE
            </button>
            <button 
              onClick={() => { setActivePlatform('tiktok'); reset(); }}
              className={`px-8 py-3 rounded-xl font-bold text-lg transition-all border-2 duration-300 ${
                activePlatform === 'tiktok' 
                  ? 'bg-gradient-to-r from-slate-900 to-black text-white border-slate-700 shadow-lg shadow-slate-400/50 scale-105' 
                  : 'bg-white text-slate-800 border-transparent hover:bg-slate-50 hover:border-slate-200 hover:text-black'
              }`}
            >
              TIKTOK
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-6 order-2 lg:order-1 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {/* History Card */}
            <div className="bg-white p-7 rounded-3xl border-2 border-yellow-200 shadow-xl shadow-yellow-100/50 space-y-4 transition-transform hover:-translate-y-1 duration-300">
              <div className="flex items-center justify-between border-b border-yellow-100 pb-3">
                <h2 className="text-lg font-bold text-yellow-800 font-tet-title">Nhật ký</h2>
                {history.length > 0 && <button onClick={clearHistory} className="text-xs font-bold text-yellow-600 hover:text-yellow-800 uppercase tracking-wider">Xóa</button>}
              </div>
              <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl opacity-30 animate-pulse">✨</span>
                    <p className="text-yellow-600 text-xs mt-2 font-medium">Chưa có lịch sử</p>
                  </div>
                ) : (
                  history.map(item => (
                    <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-yellow-50 to-white border border-yellow-200 hover:border-yellow-400 hover:shadow-md transition-all">
                      <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border shadow-sm ${
                        item.platform === 'shopee' 
                          ? 'bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 border-orange-300' 
                          : 'bg-gradient-to-br from-slate-700 to-slate-900 text-white border-slate-600'
                      }`}>
                        {item.platform === 'shopee' ? 'S' : 'T'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-yellow-900 truncate text-sm">{item.filename}</p>
                        <div className="flex justify-between items-center mt-1 text-yellow-600 text-xs font-medium">
                          <span>{item.type === 'upload' ? 'Tải lên' : 'Kết quả'}</span>
                          <span>{new Date(item.timestamp).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6 order-1 lg:order-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white/90 backdrop-blur-sm p-2 rounded-[2.5rem] border-4 border-yellow-300 shadow-2xl shadow-yellow-200/50 overflow-hidden relative">
              {/* Corner Decorations */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-yellow-400 to-transparent opacity-20 rounded-br-full mix-blend-multiply"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-amber-400 to-transparent opacity-20 rounded-tl-full mix-blend-multiply"></div>

              <div className="p-8 relative z-10">
                {files.length < MAX_FILES && !processedFileUrl && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`dropzone-breathing border-2 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center cursor-pointer transition-all mb-8 group relative overflow-hidden ${
                      activePlatform === 'shopee' 
                        ? 'border-orange-300 bg-orange-50/50 hover:bg-orange-100 hover:border-orange-500 hover:shadow-inner' 
                        : 'border-slate-300 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-500 hover:shadow-inner'
                    }`}
                  >
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-5 transition-transform group-hover:scale-110 group-hover:rotate-12 duration-300 shadow-xl ${
                      activePlatform === 'shopee' 
                        ? 'bg-gradient-to-br from-white to-orange-50 text-orange-500 shadow-orange-200/50' 
                        : 'bg-gradient-to-br from-white to-slate-100 text-slate-800 shadow-slate-200/50'
                    }`}>
                       {activePlatform === 'shopee' ? <Sparkle className="w-12 h-12 animate-pulse" /> : <svg className="w-10 h-10 animate-bounce-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>}
                    </div>
                    <p className="text-2xl font-black text-yellow-900 text-center font-tet-title group-hover:scale-105 transition-transform">
                      Thả file {activePlatform === 'shopee' ? 'Shopee' : 'Tiktok'} vào đây
                    </p>
                    <p className="mt-2 text-yellow-600 font-medium">hoặc nhấn để chọn file</p>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls" multiple onChange={handleFileChange} />
                  </div>
                )}

                {files.length > 0 && (
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between border-b border-red-100 pb-2">
                      <h3 className="text-xs font-black text-red-400 uppercase tracking-widest">Danh sách ({files.length})</h3>
                      {!processedFileUrl && <button onClick={reset} className="text-xs text-red-600 font-bold hover:bg-red-50 px-3 py-1 rounded-full transition-colors">Hủy bỏ</button>}
                    </div>
                    {files.map((f, index) => (
                      <div key={index} className="flex items-center justify-between bg-orange-50 p-4 rounded-xl border border-orange-100 group hover:border-yellow-300 transition-colors animate-fade-in">
                        <div className="flex items-center gap-3">
                           <div className="bg-white p-2 rounded-lg text-red-500 shadow-sm">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                           </div>
                           <span className="text-sm font-bold text-red-900 truncate max-w-[200px]">{f.name}</span>
                        </div>
                        {!processedFileUrl && <button onClick={() => removeFile(index)} className="text-red-300 hover:text-red-600 p-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-4">
                 {state.status === 'idle' && files.length > 0 && (
                    <button 
                      onClick={(e) => {
                        (window as any).confetti({
                          particleCount: 150,
                          spread:

import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';

// Cấu hình kiểu dữ liệu
type Platform = 'shopee' | 'tiktok';
interface ProcessingState {
  status: 'idle' | 'processing' | 'success' | 'error';
  message: string;
}
interface HistoryItem {
  id: string;
  type: 'upload' | 'download';
  filename: string;
  timestamp: number;
  platform: Platform;
}
interface NoticeItem {
  id: number;
  date: string;
  title: string;
  desc: string;
}
interface FeedbackItem {
  id: string;
  name: string;
  content: string;
  timestamp: number;
}

const MAX_FILES = 5;
const STORAGE_KEY = 'len_don_cung_lam_history_v2';

// ==========================================
// ĐIỀN THÔNG TIN API TRÊN SUPABASE CỦA BẠN VÀO ĐÂY
// ==========================================
const SUPABASE_URL = "https://pfwcfbsobsitfocjcfxg.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmd2NmaHNvYnNqdGZwY2pjZnhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5OTI2MjcsImV4cCI6MjA5NjU2ODYyN30.aYskBWpE7ZxwoujAjEMfbUN1X1EQP1DK9QuhjW1zIyQ";

// Hàm fetch tự chế để đọc dữ liệu từ Supabase không cần thư viện ngoài
const sFetchGet = async () => {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/feedbacks?select=*&order=timestamp.desc`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error(e);
    return [];
  }
};

// Hàm fetch tự chế để gửi dữ liệu lên Supabase
const sFetchPost = async (payload: any) => {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/feedbacks`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (e) {
    console.error(e);
    return false;
  }
};

const DEFAULT_NOTICES: NoticeItem[] = [
  { id: 1, date: "25/05", title: "Gom đơn Shopee Sale", desc: "Chốt danh sách và gộp file đối soát đợt 1." },
  { id: 2, date: "28/05", title: "Thanh toán công nợ", desc: "Kiểm tra ví và thanh toán cho bên nhà cung cấp." },
  { id: 3, date: "01/06", title: "Nhập kho hàng hè mới", desc: "Kiểm đếm số lượng áo thun và váy hoa nhí vừa về." },
];

// Các component đồ họa tích hợp sẵn
const BubbleSVG = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="4" fill="rgba(255,255,255,0.1)" />
    <circle cx="35" cy="35" r="10" fill="rgba(255,255,255,0.4)" />
  </svg>
);

const RisingBubbles = () => {
  const items = Array.from({ length: 15 }).map((_, i) => ({
    id: i, left: `${Math.random() * 100}%`, size: Math.random() * 15 + 5, delay: `${Math.random() * 4}s`, duration: `${6 + Math.random() * 4}s`
  }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {items.map(b => (
        <div key={b.id} className="absolute bottom-[-20px] rounded-full bg-cyan-400/10 border border-cyan-300/30 animate-[rise_10s_infinite_linear]" style={{ left: b.left, width: b.size, height: b.size, animationDelay: b.delay, animationDuration: b.duration }} />
      ))}
    </div>
  );
};

const Couplet = ({ text, position, theme }: { text: string; position: 'left' | 'right'; theme: string }) => (
  <div className={`fixed top-1/4 ${position === 'left' ? 'left-4' : 'right-4'} z-20 hidden xl:block w-12 p-3 text-center font-black rounded-full border-2 border-dashed ${theme === 'ocean' ? 'bg-slate-950/40 border-cyan-500/30 text-cyan-200' : 'bg-white border-yellow-400 text-amber-900'}`}>
    {text.split('').map((char, i) => <div key={i} className="my-1 text-base">{char}</div>)}
  </div>
);

const BioluminescenceSpores = () => {
  const spores = Array.from({ length: 25 }).map((_, i) => ({
    id: i, left: `${Math.random() * 100}%`, bottom: `${Math.random() * 100}%`,
    size: Math.random() * 5 + 3, duration: `${3 + Math.random() * 4}s`, delay: `${Math.random() * 3}s`,
    color: Math.random() > 0.5 ? '#22d3ee' : '#c026d3',
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mix-blend-screen">
      {spores.map(c => (
        <div key={c.id} className="absolute rounded-full" style={{ left: c.left, bottom: c.bottom, width: c.size, height: c.size, backgroundColor: c.color, boxShadow: `0 0 ${c.size * 3}px ${c.size}px ${c.color}`, animation: `float-glow ${c.duration} ease-in-out infinite alternate, pulseBreath 2s ease-in-out infinite alternate`, animationDelay: c.delay }} />
      ))}
    </div>
  );
};

const WaterDistortionOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-[1] mix-blend-overlay" style={{ animation: 'water-wave 8s ease-in-out infinite alternate', background: 'linear-gradient(180deg, rgba(34,211,238,0.03) 0%, rgba(30,58,138,0.03) 100%)' }} />
);

const BioluminescentFlowersTet = () => {
  const flowers = Array.from({ length: 20 }).map((_, i) => ({
    id: i, left: `${Math.random() * 100}%`, animationDuration: `${8 + Math.random() * 5}s`, animationDelay: `${Math.random() * 4}s`, color: Math.random() > 0.5 ? '#FDE047' : '#FBCFE8', size: Math.random() * 15 + 15
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {flowers.map(f => (
        <div key={f.id} className="absolute -top-10 opacity-80" style={{ left: f.left, width: f.size, height: f.size, animation: `fall ${f.animationDuration} linear infinite`, animationDelay: f.animationDelay }}>
          <svg className="w-full h-full animate-spin-slow" viewBox="0 0 100 100" fill={f.color}><circle cx="50" cy="50" r="30" /></svg>
        </div>
      ))}
    </div>
  );
};

const ClickBubbleBurst = () => {
  const [bursts, setBursts] = useState<Array<{ id: number, x: number, y: number }>>([]);
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const id = Date.now() + Math.random();
      setBursts(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setBursts(prev => prev.filter(b => b.id !== id)), 900);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {bursts.map(b => (
        <div key={b.id} className="absolute" style={{ left: b.x, top: b.y }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white/20 border border-white/60 animate-ping" style={{ width: '10px', height: '10px', left: `${(Math.random() - 0.5) * 30}px`, top: `${(Math.random() - 0.5) * 30}px` }} />
          ))}
        </div>
      ))}
    </div>
  );
};

const SuccessBubbleBlast: React.FC<{ trigger: boolean }> = ({ trigger }) => {
  const [particles, setParticles] = useState<Array<{ id: number, left: string, size: number, delay: string, duration: string }>>([]);
  useEffect(() => {
    if (trigger) {
      const newParticles = Array.from({ length: 40 }).map((_, i) => ({
        id: Date.now() + i, left: `${10 + Math.random() * 80}%`, size: Math.random() * 20 + 5, delay: `${Math.random() * 0.8}s`, duration: `${1.5 + Math.random() * 1.5}s`
      }));
      setParticles(newParticles);
      const timer = setTimeout(() => setParticles([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);
  return (
    <div className="fixed inset-0 pointer-events-none z-[999] overflow-hidden">
      {particles.map(p => (
        <div key={p.id} className="absolute bottom-[-50px] rounded-full bg-cyan-200/20 border border-white/40" style={{ left: p.left, width: p.size, height: p.size, animation: `rise ${p.duration} linear forwards`, animationDelay: p.delay }} />
      ))}
    </div>
  );
};

const InteractiveSwimmingFish = () => {
  const [fishes] = useState(() => 
    Array.from({ length: 5 }).map((_, i) => ({
      id: i, top: `${25 + Math.random() * 50}%`, size: Math.random() * 20 + 40, duration: `${15 + Math.random() * 8}s`, delay: `${Math.random() * 4}s`, direction: Math.random() > 0.5 ? 'swimLTR' : 'swimRTL'
    }))
  );
  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {fishes.map(f => (
        <div key={f.id} className="absolute opacity-40" style={{ top: f.top, width: f.size, height: f.size / 2, animationName: f.direction, animationDuration: f.duration, animationDelay: f.delay, animationTimingFunction: 'linear', animationIterationCount: 'infinite' }}>
          <svg viewBox="0 0 100 50" fill="currentColor" className="w-full h-full text-cyan-500"><path d="M10,25 C30,10 70,10 90,25 C70,40 30,40 10,25 M90,25 L100,15 L95,25 L100,35 Z" /></svg>
        </div>
      ))}
    </div>
  );
};

const dummyProcessExcelFiles = async (files: File[], platform: Platform): Promise<Blob> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = [["Hệ thống", "Đơn hàng gộp mẫu"], ["Đơn đối soát", platform.toUpperCase()]];
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "KetQua");
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      resolve(new Blob([wbout], { type: "application/octet-stream" }));
    }, 1500);
  });
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<'ocean' | 'tet'>(() => {
    const saved = localStorage.getItem('theme_preference');
    return (saved === 'tet' || saved === 'ocean') ? saved : 'ocean';
  });

  const toggleTheme = () => { setTheme(prev => prev === 'ocean' ? 'tet' : 'ocean'); };

  useEffect(() => {
    localStorage.setItem('theme_preference', theme);
    document.body.className = `theme-${theme}`;
  }, [theme]);

  const [activePlatform, setActivePlatform] = useState<Platform>('shopee');
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessingState>({ status: 'idle', message: '' });
  const [processedFileUrl, setProcessedFileUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCelebrationBubbles, setShowCelebrationBubbles] = useState(false);

  const [productList, setProductList] = useState<string[]>([]);
  const [randomProduct, setRandomProduct] = useState<string>('');
  const [notices, setNotices] = useState<NoticeItem[]>(DEFAULT_NOTICES);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [fbName, setFbName] = useState('');
  const [fbContent, setFbContent] = useState('');

  const refreshFeedbacks = async () => {
    const data = await sFetchGet();
    if (data && data.length > 0) {
      setFeedbacks(data);
    }
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) { console.error(e); }
    }
    refreshFeedbacks();

    // Thiết lập tự động làm mới hòm thư góp ý sau mỗi 10 giây để thay thế Realtime không cần thư viện ngoài
    const interval = setInterval(refreshFeedbacks, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadDefaultFiles = async () => {
      try {
        const resN = await fetch('/notices.txt');
        if (resN.ok) {
          const text = await resN.text();
          const parsed: NoticeItem[] = [];
          text.split('\n').forEach((line, idx) => {
            if (!line.includes('|')) return;
            const pts = line.split('|');
            parsed.push({ id: idx, date: pts[0]?.trim(), title: pts[1]?.trim(), desc: pts[2]?.trim() });
          });
          if (parsed.length > 0) setNotices(parsed);
        }

        const resP = await fetch('/products.xlsx');
        if (resP.ok) {
          const ab = await resP.arrayBuffer();
          const workbook = XLSX.read(new Uint8Array(ab), { type: 'array' });
          const json: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
          let pCol = -1;
          if (json.length > 0) {
            for (let r = 0; r < Math.min(json.length, 5); r++) {
              pCol = (json[r] || []).findIndex((c: any) => typeof c === 'string' && c.toLowerCase().includes('tên sản phẩm'));
              if (pCol !== -1) {
                const names: string[] = [];
                for (let i = r + 1; i < json.length; i++) {
                  if (json[i]?.[pCol]) names.push(String(json[i][pCol]).trim());
                }
                setProductList(Array.from(new Set(names)));
                break;
              }
            }
          }
        }
      } catch (e) { console.error(e); }
    };
    loadDefaultFiles();
  }, []);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); }, [history]);

  const addToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() };
    setHistory(prev => [newItem, ...prev].slice(0, 50));
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbName.trim() || !fbContent.trim()) return;

    const payload = {
      name: fbName.trim(),
      content: fbContent.trim(),
      timestamp: Date.now()
    };

    const success = await sFetchPost(payload);
    if (success) {
      setFbContent('');
      refreshFeedbacks();
    } else {
      // Dự phòng bộ nhớ máy nếu API lỗi
      const localItem: FeedbackItem = { id: Math.random().toString(), ...payload };
      setFeedbacks(prev => [localItem, ...prev]);
      setFbContent('');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles: File[] = Array.from(event.target.value ? event.target.files || [] : []);
    if (files.length + selectedFiles.length > MAX_FILES) {
      setState({ status: 'error', message: `Tối đa ${MAX_FILES} file mỗi lần.` });
      return;
    }
    setState({ status: 'idle', message: '' });
    selectedFiles.forEach(f => addToHistory({ type: 'upload', filename: f.name, platform: activePlatform }));
    setFiles(prev => [...prev, ...selectedFiles]);
    setProcessedFileUrl(null);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (files.length <= 1) { setProcessedFileUrl(null); setState({ status: 'idle', message: '' }); }
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setState({ status: 'processing', message: `Đang xử lý đơn ${activePlatform.toUpperCase()}...` });
    setShowCelebrationBubbles(false);
    try {
      const blob = await dummyProcessExcelFiles(files, activePlatform);
      setProcessedFileUrl(URL.createObjectURL(blob));
      setState({ status: 'success', message: `Gộp đơn ${activePlatform.toUpperCase()} thành công!` });
      setShowCelebrationBubbles(true);
      addToHistory({ type: 'download', filename: `Kết Quả_${activePlatform.toUpperCase()}_${Date.now()}.xlsx`, platform: activePlatform });
    } catch (error: any) { setState({ status: 'error', message: error.message || 'Lỗi xử lý file.' }); }
  };

  const handlePickRandomProduct = () => {
    if (productList.length === 0) return;
    setRandomProduct(productList[Math.floor(Math.random() * productList.length)]);
  };

  const reset = () => { setFiles([]); setState({ status: 'idle', message: '' }); setProcessedFileUrl(null); setShowCelebrationBubbles(false); };
  const clearHistory = () => { if (confirm('Xóa toàn bộ lịch sử?')) setHistory([]); };

  const isOcean = theme === 'ocean';

  return (
    <div className="w-full relative min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white overflow-x-hidden">
      
      {/* THÔNG BÁO QUAN TRỌNG ABSOLUTE SÁT ĐỈNH */}
      {notices.length > 0 && (
        <div className="absolute top-0 right-0 z-[999] hidden md:block">
          <div className={`pb-5 px-5 pt-0 rounded-bl-3xl border-b-2 border-l-2 border-t-0 shadow-2xl w-[320px] lg:w-[355px] space-y-4 ${isOcean ? 'bg-slate-950/95 border-cyan-500/40 text-cyan-100 backdrop-blur-md' : 'bg-white border-yellow-300 text-amber-900'}`}>
            <div className={`flex items-center gap-2 border-b pb-3 pt-3.5 -mx-5 px-5 ${isOcean ? 'border-cyan-500/30 bg-slate-900' : 'border-yellow-200 bg-yellow-50/60'}`}>
              <span className="text-sm animate-pulse">{isOcean ? '📟' : '📢'}</span>
              <h2 className="text-xs font-black tracking-wider uppercase">Thông báo quan trọng</h2>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {notices.map(notice => (
                <div key={notice.id} className={`p-3 rounded-xl border flex gap-3 ${isOcean ? 'bg-slate-900/60 border-cyan-500/10' : 'bg-amber-50/50 border-red-100'}`}>
                  <div className={`w-11 h-11 flex-shrink-0 rounded-xl flex flex-col items-center justify-center font-mono font-black text-xs ${isOcean ? 'bg-cyan-950 text-cyan-300' : 'bg-red-600 text-white'}`}>{notice.date}</div>
                  <div className="min-w-0 flex-1"><p className="text-xs font-black truncate">{notice.title}</p><p className="text-[11px] opacity-85 mt-1 line-clamp-3 text-justify">{notice.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-6 pt-12">
        <ClickBubbleBurst /><SuccessBubbleBlast trigger={showCelebrationBubbles} />
        {isOcean ? ( <> <RisingBubbles /> <InteractiveSwimmingFish /> <BioluminescenceSpores /> <WaterDistortionOverlay /> </> ) : ( <BioluminescentFlowersTet /> )}
        
        <Couplet text="Đơn thưa, lòng không nản" position="left" theme={theme} />
        <Couplet text="Chí vững, lộc ắt về" position="right" theme={theme} />

        <div className="flex flex-col gap-10 relative z-10 max-w-6xl mx-auto">
          <div className="text-center space-y-2 flex flex-col items-center">
            <button onClick={toggleTheme} className={`mb-4 px-5 py-2 rounded-full font-bold text-xs border shadow-md ${isOcean ? 'bg-slate-900 text-cyan-300 border-cyan-500/30' : 'bg-yellow-100 text-yellow-800 border-yellow-300'}`}>
              {isOcean ? '☀️ CHUYỂN SANG CHẾ ĐỘ TẾT' : '🌊 CHUYỂN SANG CHẾ ĐỘ BIỂN'}
            </button>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mt-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-teal-400">LÊN ĐƠN THÔI</h1>
          </div>

          {/* Platform Tabs */}
          <div className="flex justify-center">
            <div className="p-2 rounded-2xl flex gap-2 border bg-slate-900/60 border-cyan-500/40 shadow-xl">
              <button onClick={() => { setActivePlatform('shopee'); reset(); }} className={`px-8 py-3 rounded-xl font-bold text-lg transition-all border ${activePlatform === 'shopee' ? 'bg-orange-600 text-white border-orange-400 shadow-md' : 'text-cyan-200 border-transparent'}`}>SHOPEE</button>
              <button onClick={() => { setActivePlatform('tiktok'); reset(); }} className={`px-8 py-3 rounded-xl font-bold text-lg transition-all border ${activePlatform === 'tiktok' ? 'bg-cyan-600 text-white border-cyan-400 shadow-md' : 'text-cyan-200 border-transparent'}`}>TIKTOK</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
            {/* NHẬT KÝ */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-3xl border border-cyan-500/20 bg-slate-950/50 space-y-4">
                <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
                  <h2 className="text-lg font-bold text-cyan-300">Nhật ký</h2>
                  {history.length > 0 && <button onClick={clearHistory} className="text-xs text-cyan-400 uppercase font-bold">Xóa</button>}
                </div>
                <div className="max-h-[280px] overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                  {history.length === 0 ? ( <p className="text-center text-xs opacity-40 py-6">Chưa có lịch sử</p> ) : (
                    history.map(item => (
                      <div key={item.id} className="p-3 rounded-xl border border-cyan-500/10 bg-slate-900/50 text-xs">
                        <span className="font-bold block truncate">{item.filename}</span>
                        <span className="opacity-60 block mt-1">{item.type === 'upload' ? 'Tải lên' : 'Kết quả'} • {new Date(item.timestamp).toLocaleTimeString('vi-VN')}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* HÒM THẢ FILE */}
            <div className="lg:col-span-8">
              <div className="p-6 rounded-[2rem] border-2 border-cyan-500/20 bg-slate-950/40 space-y-6">
                {!processedFileUrl && (
                  <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-cyan-500/30 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-cyan-950/10 transition-colors">
                    <BubbleSVG className="w-12 h-12 text-cyan-400 mb-4" />
                    <p className="text-xl font-bold">Thả file {activePlatform.toUpperCase()} vào đây</p>
                    <p className="text-xs text-cyan-400/70 mt-1">hoặc click để chọn file từ máy</p>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls" multiple onChange={handleFileChange} />
                  </div>
                )}

                {files.length > 0 && !processedFileUrl && (
                  <div className="space-y-2">
                    {files.map((f, i) => (
                      <div key={i} className="p-3 rounded-lg border border-cyan-500/20 bg-slate-900/50 flex justify-between text-sm">
                        <span className="truncate max-w-xs font-medium">{f.name}</span>
                        <button onClick={() => removeFile(i)} className="text-red-400 font-bold px-2">Xóa</button>
                      </div>
                    ))}
                    <button onClick={handleProcess} className="w-full mt-4 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold uppercase tracking-wider">Xử lý gộp đơn ngay</button>
                  </div>
                )}

                {productList.length > 0 && !processedFileUrl && (
                  <div className="p-4 rounded-2xl border border-cyan-500/20 bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">🎲 Gợi ý mặt hàng hôm nay ({productList.length}):</p>
                      <div className={`text-sm font-bold mt-1.5 truncate p-2.5 rounded-xl border border-dashed min-h-[44px] flex items-center justify-center sm:justify-start ${randomProduct ? 'bg-cyan-950/40 border-cyan-500/30 text-white' : 'opacity-40 italic text-xs'}`}>{randomProduct || "Đang chờ quay số..."}</div>
                    </div>
                    <button onClick={handlePickRandomProduct} className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white border border-cyan-400 rounded-xl font-bold text-xs tracking-wider uppercase flex-shrink-0">Hôm nay bán gì?</button>
                  </div>
                )}

                {state.status === 'processing' && <p className="text-center py-6 text-cyan-400 animate-pulse">{state.message}</p>}
                {state.status === 'success' && processedFileUrl && (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl text-sm text-center">Gộp file thành công hoàn tất tốt đẹp!</div>
                    <a href={processedFileUrl} download={`Kết Quả_${activePlatform.toUpperCase()}_${Date.now()}.xlsx`} className="block text-center py-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl font-black text-lg">TẢI FILE KẾT QUẢ ĐÃ GỘP</a>
                    <button onClick={reset} className="w-full text-center text-xs opacity-60 font-bold py-2">Làm lượt mới</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* KHU VỰC GÓP Ý DƯỚI CÙNG */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full border-t border-cyan-500/10 pt-8 mt-4">
            <div className="lg:col-span-5">
              <form onSubmit={handleSendFeedback} className="p-6 rounded-3xl border border-cyan-500/20 bg-slate-950/40 space-y-4">
                <h3 className="text-base font-black uppercase text-cyan-300 tracking-wider">Gửi góp ý của bạn</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold block mb-1 uppercase tracking-wider opacity-70">Tên của bạn:</label>
                    <input type="text" required value={fbName} onChange={(e) => setFbName(e.target.value)} placeholder="Nhập tên..." className="w-full px-4 py-2.5 rounded-xl border border-cyan-500/20 bg-slate-900/80 outline-none focus:border-cyan-400 text-sm font-bold text-white" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold block mb-1 uppercase tracking-wider opacity-70">Nội dung góp ý:</label>
                    <textarea required rows={3} value={fbContent} onChange={(e) => setFbContent(e.target.value)} placeholder="Góp ý tính năng cải tiến..." className="w-full px-4 py-3 rounded-xl border border-cyan-500/20 bg-slate-900/80 outline-none focus:border-cyan-400 text-sm resize-none text-white" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-xs tracking-widest uppercase">Gửi ý kiến ngay</button>
                </div>
              </form>
            </div>

            <div className="lg:col-span-7">
              <div className="p-6 rounded-3xl border border-cyan-500/20 bg-slate-950/40 flex flex-col h-[302px]">
                <h3 className="text-base font-black uppercase text-cyan-300 tracking-wider border-b border-cyan-500/20 pb-3 mb-3">Hòm thư góp ý công khai ({feedbacks.length})</h3>
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                  {feedbacks.length === 0 ? (
                    <p className="text-center py-12 opacity-40 italic text-sm">Chưa có bài góp ý nào.</p>
                  ) : (
                    feedbacks.map(fb => (
                      <div key={fb.id} className="p-3.5 rounded-2xl border border-cyan-500/10 bg-slate-900/40 text-xs animate-fade-in">
                        <div className="flex justify-between border-b border-dashed border-cyan-500/20 pb-1 mb-2 opacity-80 font-bold">
                          <span className="text-cyan-300">👤 {fb.name}</span>
                          <span className="opacity-50">{new Date(fb.timestamp).toLocaleDateString('vi-VN')} {new Date(fb.timestamp).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap text-left">{fb.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar{width:4px;}
        .custom-scrollbar::-webkit-scrollbar-track{background:transparent;}
        .custom-scrollbar::-webkit-scrollbar-thumb{background:#22d3ee;border-radius:10px;}
        .animate-spin-slow { animation: spin 12s linear infinite; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes rise { 0% { transform: translateY(0) scale(0.8); opacity: 0; } 10% { opacity: 0.8; } 100% { transform: translateY(-105vh) scale(1.2); opacity: 0; } }
        @keyframes fall { 0% { transform: translateY(-5vh) rotate(0deg); opacity: 0; } 10% { opacity: 0.7; } 100% { transform: translateY(105vh) rotate(360deg); opacity: 0; } }
        @keyframes float-glow { 0% { transform: translateY(0); } 100% { transform: translateY(-30px); } }
        @keyframes pulseBreath { 0% { opacity: 0.3; } 100% { opacity: 0.8; } }
        @keyframes swimLTR { 0% { left: -100px; } 100% { left: 100%; } }
        @keyframes swimRTL { 0% { right: -100px; transform: scaleX(-1); } 100% { right: 100%; transform: scaleX(-1); } }
      `}</style>
    </div>
  );
};

export default App;

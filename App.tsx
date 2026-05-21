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
    const selectedFiles: File[] = Array.from(

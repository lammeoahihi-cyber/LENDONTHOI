import React, { useState } from 'react';

interface AiWriterProps {
  onBack: () => void;
  theme: 'ocean' | 'tet';
}

export const AiWriter: React.FC<AiWriterProps> = ({ onBack, theme }) => {
  const [productName, setProductName] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOcean = theme === 'ocean';

  const handleGenerate = async () => {
    if (!productName.trim()) return;
    setLoading(true);
    setResult('');
    setCopied(false);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        setResult('🚨 LỖI: Không tìm thấy VITE_GEMINI_API_KEY trên Vercel.');
        setLoading(false);
        return;
      }

      const prompt = `Bạn là một chuyên gia viết nội dung bán hàng xuất sắc. Hãy viết một bài mô tả sản phẩm chuẩn SEO để đăng lên Shopee cho sản phẩm có tên là: "${productName}".
      Yêu cầu bắt buộc:
      1. Tiêu đề hấp dẫn, viết hoa những từ quan trọng.
      2. Nêu bật công dụng, thành phần hoặc thông số kỹ thuật và đặc điểm nổi bật.
      3. Cấu trúc rõ ràng, sử dụng các icon (emoji) sinh động ở đầu các dòng để thu hút.
      4. Có phần hướng dẫn sử dụng và chính sách bảo hành/đổi trả cơ bản.
      5. Kết thúc bài bằng 10-15 hashtag liên quan mật thiết đến sản phẩm (VD: #shopee #tensanpham...).
      Hãy viết thông tin thật chi tiết, lôi cuốn và tự nhiên nhất.`;

      // Gọi trực tiếp qua API chuẩn của Google Gemini (Không qua thư viện trung gian, chống lỗi build 100%)
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }]
              }
            ]
          }),
        }
      );

      const data = await response.json();

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        setResult(data.candidates[0].content.parts[0].text);
      } else {
        setResult(`❌ Lỗi từ Google API: ${JSON.stringify(data)}`);
      }
    } catch (error: any) {
      console.error("Chi tiết lỗi:", error);
      setResult(`❌ Đã xảy ra lỗi kết nối: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh] gap-6 relative z-10 animate-fade-in">
      <button 
        onClick={onBack}
        className={`absolute top-0 left-0 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
          isOcean 
            ? 'bg-slate-900 text-cyan-400 hover:bg-slate-800 border border-cyan-500/30' 
            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-300'
        }`}
      >
        🔙 Quay lại
      </button>

      <h2 className={`text-4xl font-black mb-4 font-tet-title ${isOcean ? 'text-cyan-300' : 'text-amber-600'}`}>
        ✨ TRỢ LÝ VIẾT MÔ TẢ TỰ ĐỘNG
      </h2>

      <div className={`w-full max-w-2xl p-6 rounded-3xl border-2 shadow-2xl flex flex-col gap-4 ${
        isOcean ? 'bg-slate-900/80 border-cyan-500/40' : 'bg-white/90 border-yellow-400'
      }`}>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Nhập tên sản phẩm vào đây (VD: Áo thun nam cotton form rộng...)"
          className={`w-full px-6 py-4 rounded-2xl text-lg font-medium border focus:outline-none focus:ring-2 ${
            isOcean 
              ? 'bg-slate-800 border-cyan-500/50 text-white placeholder-cyan-500/50 focus:ring-cyan-500' 
              : 'bg-gray-50 border-yellow-300 text-gray-900 placeholder-gray-400 focus:ring-yellow-400'
          }`}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        />
        <button 
          onClick={handleGenerate}
          disabled={loading || !productName}
          className={`w-full py-4 rounded-2xl font-bold text-xl transition-all shadow-lg flex justify-center items-center gap-2 ${
            loading || !productName ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'
          } ${
            isOcean 
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white' 
              : 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white'
          }`}
        >
          {loading ? '⏳ AI ĐANG SOẠN THẢO...' : '🚀 VIẾT MÔ TẢ NGAY'}
        </button>
      </div>

      {result && (
        <div className={`w-full max-w-3xl mt-6 rounded-3xl border-2 overflow-hidden shadow-2xl transition-all duration-500 ${
          isOcean ? 'bg-slate-900/90 border-cyan-500/50 text-cyan-50' : 'bg-white border-yellow-400 text-gray-800'
        }`}>
          <div className={`flex justify-between items-center p-4 border-b ${
            isOcean ? 'border-cyan-500/30 bg-slate-950/50' : 'border-yellow-200 bg-yellow-50'
          }`}>
            <span className="font-bold">📝 Kết quả mô tả:</span>
            <button 
              onClick={handleCopy}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-md ${
                copied 
                  ? 'bg-green-500 text-white' 
                  : (isOcean ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 'bg-amber-500 hover:bg-amber-400 text-white')
              }`}
            >
              {copied ? '✅ Đã Copy' : '📋 Copy bài viết'}
            </button>
          </div>
          <div className="p-6 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto custom-scrollbar text-justify">
            {result}
          </div>
        </div>
      )}
    </div>
  );
};

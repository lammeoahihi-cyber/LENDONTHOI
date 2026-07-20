import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Khởi tạo Gemini AI (Nhớ thêm VITE_GEMINI_API_KEY vào biến môi trường trên Vercel)
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

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
      // Dùng model gemini-1.5-flash tốc độ cao và miễn phí
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Lệnh (Prompt) được thiết kế chuyên sâu cho Shopee
      const prompt = `Bạn là một chuyên gia viết nội dung bán hàng xuất sắc. Hãy viết một bài mô tả sản phẩm chuẩn SEO để đăng lên Shopee cho sản phẩm có tên là: "${productName}".
      Yêu cầu bắt buộc:
      1. Tiêu đề hấp dẫn, viết hoa những từ quan trọng.
      2. Nêu bật công dụng, thành phần (hoặc thông số kỹ thuật) và đặc điểm nổi bật.
      3. Cấu trúc rõ ràng, sử dụng các icon (emoji) sinh động ở đầu các dòng để thu hút.
      4. Có phần hướng dẫn sử dụng và chính sách bảo hành/đổi trả cơ bản.
      5. Kết thúc bài bằng 10-15 hashtag liên quan mật thiết đến sản phẩm (VD: #shopee #tensanpham...).
      Dựa trên kho kiến thức rộng lớn của bạn về các mặt hàng, hãy viết thông tin thật chính xác, lôi cuốn và tự nhiên nhất.`;

      const aiResult = await model.generateContent(prompt);
      const response = await aiResult.response;
      setResult(response.text());
    } catch (error) {
      console.error(error);
      setResult('Đã xảy ra lỗi khi kết nối với AI. Vui lòng kiểm tra lại kết nối hoặc API Key.');
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
      {/* Nút quay lại */}
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

      {/* Ô nhập liệu trung tâm */}
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

      {/* Khu vực hiển thị kết quả */}
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

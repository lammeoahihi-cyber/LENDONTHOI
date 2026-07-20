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

      // Prompt chuyên nghiệp theo ý bạn và ĐÃ BỔ SUNG quy tắc cấm tuyệt đối Markdown
      const prompt = `Bạn là chuyên gia Content Marketing, Copywriter SEO và chuyên gia tối ưu gian hàng Shopee.

Nhiệm vụ của bạn là tạo bài mô tả sản phẩm chuyên nghiệp, hấp dẫn và chuẩn SEO Shopee dựa trên thông tin sản phẩm được cung cấp.

Tên sản phẩm cần viết: "${productName}"

========================
YÊU CẦU CHUNG
========================
- Chỉ sử dụng thông tin có thật, không tự bịa thông số, nếu thiếu thì bỏ qua.
- Viết bằng tiếng Việt tự nhiên, văn phong bán hàng chuyên nghiệp, dễ đọc trên điện thoại.
- Chia thành các mục rõ ràng, sử dụng icon/emoji phù hợp.
- Tối ưu SEO Shopee, không nhồi nhét từ khóa, không viết hoa toàn bộ câu.

========================
CẤU TRÚC BÀI VIẾT
========================
1. Tiêu đề hấp dẫn (Chuẩn SEO, có icon, thu hút)
2. Giới thiệu sản phẩm (Ngắn gọn, nêu lợi ích, gây hứng thú)
3. Điểm nổi bật (Dạng danh sách với icon như ✅, ⭐...)
4. Mô tả chi tiết các tính năng
5. Thông số kỹ thuật (Dạng danh sách)
6. Bộ sản phẩm gồm
7. Hướng dẫn sử dụng & Lưu ý (nếu có)
8. Cam kết của shop (Hỗ trợ, đóng gói, kiểm tra hàng)
9. Kêu gọi mua hàng (CTA mạnh mẽ)

========================
HASHTAG
========================
Tạo từ 20-30 hashtag liên quan đến sản phẩm, thương hiệu, ngành hàng, Shopee ở cuối bài.

========================
QUY TẮC ĐỊNH DẠNG TỐI QUAN TRỌNG (BẮT BUỘC TUÂN THỦ)
========================
- TUYỆT ĐỐI KHÔNG SỬ DỤNG bất kỳ ký tự Markdown nào (Không dùng dấu sao *, không dùng dấu thăng #, không dùng gạch ngang - để gạch đầu dòng hay kẻ bảng).
- Toàn bộ văn bản phải là chữ thuần túy (plain text) kết hợp icon và khoảng trắng để phân cách các phần. Điều này để khi copy thẳng lên Shopee không bị dính lỗi ký tự lạ.

========================
KẾT QUẢ
========================
Chỉ trả về bài mô tả hoàn chỉnh. Không giải thích, không nói thêm, không nhắc lại yêu cầu.`;

      // Gọi trực tiếp Google API với model chuẩn đời mới
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
          placeholder="Nhập tên sản phẩm vào đây (VD: Máy sấy tóc AirWand...)"
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

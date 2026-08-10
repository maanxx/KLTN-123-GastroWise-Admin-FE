import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle, MessageSquareHeart, ChevronRight, Zap } from 'lucide-react';

export default function AiInsightsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <Sparkles className="w-48 h-48 animate-pulse" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-semibold mb-4 border border-white/20">
            <Zap className="w-4 h-4 text-yellow-300" /> Powered by GastroWise AI
          </div>
          <h1 className="font-heading text-4xl font-bold mb-3">AI Merchant Assistant</h1>
          <p className="text-indigo-50 text-lg">
            Chào Admin, hệ thống AI đã phân tích 1,450 đánh giá và 320 lượt đặt bàn trong tháng này. 
            Dưới đây là các khuyến nghị chiến lược để tối ưu doanh thu của bạn.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Analysis */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-rose-100 p-2.5 rounded-xl">
                <MessageSquareHeart className="w-6 h-6 text-rose-600" />
              </div>
              <h2 className="font-heading text-xl font-bold text-slate-900">Phân tích Phản hồi (Reviews)</h2>
            </div>
            <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">Cập nhật: 1 giờ trước</span>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 flex gap-4">
              <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0" />
              <div>
                <h4 className="font-bold text-rose-900">Cảnh báo: Tốc độ phục vụ (Thứ 7)</h4>
                <p className="text-sm text-rose-700 mt-1">
                  AI phát hiện có <strong>12 đánh giá tiêu cực</strong> liên quan đến việc "chờ món quá lâu" trong khung giờ 19:00 - 21:00 thứ Bảy tuần trước.
                </p>
                <button className="text-rose-600 text-sm font-bold mt-2 flex items-center hover:underline">
                  Xem chi tiết đánh giá <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 flex gap-4">
              <Sparkles className="w-6 h-6 text-emerald-500 shrink-0" />
              <div>
                <h4 className="font-bold text-emerald-900">Điểm sáng: Món mới được yêu thích</h4>
                <p className="text-sm text-emerald-700 mt-1">
                  Món <strong>"Lẩu Thái Tomyum"</strong> nhận được 95% phản hồi Tích cực (Từ khóa: "ngon", "đậm đà"). AI đề xuất đưa món này lên trang chủ Menu.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Optimization */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary-100 p-2.5 rounded-xl">
                <TrendingUp className="w-6 h-6 text-primary-600" />
              </div>
              <h2 className="font-heading text-xl font-bold text-slate-900">Chiến lược Doanh thu</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 flex gap-4 relative overflow-hidden group hover:bg-indigo-50 transition-colors cursor-pointer">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-indigo-900">Đề xuất giảm giá giờ thấp điểm</h4>
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded">Tỉ lệ thành công: Cao</span>
                </div>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Dữ liệu đặt bàn cho thấy khung giờ <strong>14:00 - 16:00</strong> thường xuyên trống 80% số bàn. 
                  Hệ thống AI đề xuất chạy chương trình <strong>"Flash Sale 20%"</strong> nhắm tới người dùng đang tìm kiếm nhà hàng lân cận trên bản đồ GastroWise.
                </p>
                <div className="mt-3">
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-indigo-700 transition-colors">
                    Áp dụng ngay (Tự động thiết lập)
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between opacity-70">
              <div>
                <h4 className="font-bold text-slate-700">Tối ưu hóa Hàng tồn kho</h4>
                <p className="text-sm text-slate-500 mt-1">Sắp tới mùa mưa, nhu cầu các món Lẩu tăng 35%.</p>
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

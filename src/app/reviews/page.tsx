'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, MessageSquare, Star, Trash2, Eye, Sparkles, CheckCircle2, AlertTriangle, Frown, Smile, Meh, Loader2, X, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { apiClient } from '@/shared/lib/axios';

interface ReviewItem {
  _id: string;
  restaurantId?: {
    _id: string;
    tenQuan: string;
    diaChi: string;
  } | string;
  tenNguoiDung?: string;
  userAvatar?: string;
  soSao?: number;
  rating?: number;
  noiDung: string;
  hinhAnh?: string[];
  aiSentimentLabel?: string;
  aiSentimentScore?: number;
  hashtags?: string[];
  createdAt?: string;
  status?: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('all');

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  // Detail Modal State
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  // Fetch Reviews from Backend
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/reviews/all', {
        params: { page, limit, search: searchQuery, sentiment: sentimentFilter }
      });
      const data = res.data?.data || res.data || [];
      setReviews(Array.isArray(data) ? data : []);
      setTotalPages(res.data?.totalPages || 1);
      setTotalReviews(res.data?.total || data.length || 0);
    } catch (error) {
      console.error('Lỗi khi tải danh sách đánh giá:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchQuery, sentimentFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchReviews();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, sentimentFilter, page, limit]);

  // Delete / Moderation Action
  const handleDeleteReview = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn ẩn/xóa đánh giá này khỏi hệ thống?')) return;
    try {
      await apiClient.delete(`/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (error) {
      console.error('Lỗi khi xóa đánh giá:', error);
    }
  };

  // Run AI Sentiment Migration
  const handleMigrateSentiment = async () => {
    try {
      setIsMigrating(true);
      const res = await apiClient.post('/reviews/migrate-sentiment');
      alert(`Đã hoàn tất phân tích AI Sentiment! ${res.data?.updated || 0} review được cập nhật.`);
      await fetchReviews();
    } catch (error) {
      console.error('Lỗi khi chạy AI Sentiment Migration:', error);
    } finally {
      setIsMigrating(false);
    }
  };

  // Sentiment Helper
  const getSentimentBadge = (label?: string, score?: number) => {
    const normalizedLabel = (label || '').toUpperCase();
    const isPos = normalizedLabel.includes('POS') || normalizedLabel === 'LABEL_2' || normalizedLabel === 'POSITIVE';
    const isNeg = normalizedLabel.includes('NEG') || normalizedLabel === 'LABEL_0' || normalizedLabel === 'NEGATIVE';

    if (isPos) {
      return (
        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold">
          <Smile className="w-3.5 h-3.5 text-emerald-600" /> Tích cực {score ? `(${Math.round(score * 100)}%)` : ''}
        </span>
      );
    }
    if (isNeg) {
      return (
        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full text-xs font-bold">
          <Frown className="w-3.5 h-3.5 text-rose-600" /> Tiêu cực {score ? `(${Math.round(score * 100)}%)` : ''}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full text-xs font-medium">
        <Meh className="w-3.5 h-3.5 text-slate-500" /> Trung tính
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary-600" /> CRM Kiểm Duyệt Đánh Giá & AI Sentiment
          </h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý nhận xét của người dùng, duyệt ẩn đánh giá vi phạm và phân tích cảm xúc AI real-time.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleMigrateSentiment}
            disabled={isMigrating}
            variant="ghost"
            className="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
            icon={<Sparkles className="w-4 h-4 text-purple-600" />}
          >
            {isMigrating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : 'Chạy AI Sentiment Re-Scan'}
          </Button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo nội dung đánh giá, người viết..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="all">Tất cả Cảm xúc AI</option>
            <option value="POS">😊 Tích cực (Positive)</option>
            <option value="NEU">😐 Trung tính (Neutral)</option>
            <option value="NEG">😡 Tiêu cực (Negative)</option>
          </select>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-2" />
            <p className="text-sm font-medium text-slate-500">Đang tải danh sách Đánh giá & AI Sentiment từ MongoDB...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Chưa có đánh giá nào</h3>
            <p className="text-xs text-slate-500 mt-1">Hệ thống chưa ghi nhận nhận xét khớp với bộ lọc.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Người đánh giá</th>
                  <th className="px-6 py-4">Nhà hàng & Số sao</th>
                  <th className="px-6 py-4 max-w-md">Nội dung nhận xét</th>
                  <th className="px-6 py-4">Cảm xúc AI</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviews.map((row) => {
                  const restName = typeof row.restaurantId === 'object' ? row.restaurantId?.tenQuan : 'Nhà hàng GastroWise';
                  const stars = row.soSao || row.rating || 5;

                  return (
                    <tr key={row._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-extrabold flex items-center justify-center text-xs">
                            {(row.tenNguoiDung || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{row.tenNguoiDung || 'Khách hàng ẩn danh'}</div>
                            <div className="text-[11px] text-slate-400">
                              {row.createdAt ? new Date(row.createdAt).toLocaleDateString('vi-VN') : 'Mới đây'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 truncate max-w-xs" title={restName}>
                          🏠 {restName}
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${i < stars ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                            />
                          ))}
                          <span className="text-xs font-bold text-slate-700 ml-1">{stars}.0</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 max-w-md">
                        <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                          "{row.noiDung}"
                        </p>
                        {row.hinhAnh && row.hinhAnh.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            {row.hinhAnh.slice(0, 3).map((img, idx) => (
                              <img key={idx} src={img} alt="" className="w-8 h-8 rounded-md object-cover border border-slate-200" />
                            ))}
                            {row.hinhAnh.length > 3 && (
                              <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-1 rounded">
                                +{row.hinhAnh.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        {row.hashtags && row.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {row.hashtags.map((tag, idx) => (
                              <span key={idx} className="text-[10px] font-medium text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {getSentimentBadge(row.aiSentimentLabel, row.aiSentimentScore)}
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => { setSelectedReview(row); setShowDetailModal(true); }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteReview(row._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Ẩn / Xóa đánh giá"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && reviews.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
            <div className="text-sm text-slate-500">
              Hiển thị <span className="font-semibold text-slate-700">{reviews.length}</span> trong số <span className="font-semibold text-slate-700">{totalReviews}</span> đánh giá
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Trang trước
              </Button>
              <div className="text-sm font-medium text-slate-700 px-2">
                {page} / {totalPages}
              </div>
              <Button 
                variant="outline" 
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Trang sau
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      {showDetailModal && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <h2 className="font-bold text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-400" /> Chi tiết Đánh Giá & AI Sentiment
              </h2>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-slate-700">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-500 text-white font-extrabold flex items-center justify-center text-sm">
                    {(selectedReview.tenNguoiDung || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{selectedReview.tenNguoiDung || 'Khách hàng'}</h4>
                    <p className="text-xs text-slate-400">
                      {selectedReview.createdAt ? new Date(selectedReview.createdAt).toLocaleString('vi-VN') : ''}
                    </p>
                  </div>
                </div>
                {getSentimentBadge(selectedReview.aiSentimentLabel, selectedReview.aiSentimentScore)}
              </div>

              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Nhà hàng</span>
                <p className="font-semibold text-slate-900 mt-0.5">
                  🏠 {typeof selectedReview.restaurantId === 'object' ? selectedReview.restaurantId?.tenQuan : 'Nhà hàng GastroWise'}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Đánh giá số sao</span>
                <div className="flex items-center gap-1 text-amber-500 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < (selectedReview.soSao || selectedReview.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                    />
                  ))}
                  <span className="text-sm font-bold text-slate-800 ml-1">
                    {(selectedReview.soSao || selectedReview.rating || 5)}.0 / 5.0
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Nội dung nhận xét</span>
                <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm text-slate-800 mt-1 leading-relaxed">
                  "{selectedReview.noiDung}"
                </p>
              </div>

              {selectedReview.hinhAnh && selectedReview.hinhAnh.length > 0 && (
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">Hình ảnh đính kèm ({selectedReview.hinhAnh.length})</span>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {selectedReview.hinhAnh.map((img, i) => (
                      <img key={i} src={img} alt="" className="w-full h-20 rounded-xl object-cover border border-slate-200" />
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDetailModal(false)}>Đóng</Button>
                <Button 
                  onClick={() => { handleDeleteReview(selectedReview._id); setShowDetailModal(false); }}
                  className="bg-rose-600 hover:bg-rose-700"
                >
                  Xóa nhận xét này
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

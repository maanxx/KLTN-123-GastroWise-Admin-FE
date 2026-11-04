'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Star, 
  Trash2, 
  Eye, 
  EyeOff,
  Pin, 
  Sparkles, 
  CheckCircle2, 
  Frown, 
  Smile, 
  Meh, 
  Loader2, 
  X, 
  Download,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { apiClient } from '@/shared/lib/axios';

interface ReviewItem {
  _id: string;
  restaurantId?: {
    _id: string;
    tenQuan: string;
    diaChi: string;
  } | string;
  tenNguoiDung?: string;
  userName?: string;
  userAvatar?: string;
  soSao?: number;
  rating?: number;
  diemReview?: number;
  noiDung?: string;
  comment?: string;
  hinhAnh?: string[];
  images?: string[];
  aiSentimentLabel?: string;
  aiSentimentScore?: number;
  hashtags?: string[];
  createdAt?: string;
  status?: string;
  isFeatured?: boolean;
  pinnedAt?: string | null;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  // Detail Modal State
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Helpers to unify schema field discrepancies
  const getReviewerName = (row?: ReviewItem | null) => 
    row?.tenNguoiDung || row?.userName || 'Khách hàng ẩn danh';
  const getReviewContent = (row?: ReviewItem | null) => 
    row?.noiDung || row?.comment || '';
  const getReviewStars = (row?: ReviewItem | null) => 
    row?.soSao || row?.rating || row?.diemReview || 5;
  const getReviewImages = (row?: ReviewItem | null) => 
    row?.hinhAnh || row?.images || [];

  // Fetch Reviews from Backend
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params: any = { 
        page, 
        limit, 
        search: searchQuery, 
        sentiment: sentimentFilter 
      };

      if (statusFilter === 'featured') {
        params.isFeatured = 'true';
      } else if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const res = await apiClient.get('/reviews/all', { params });
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
  }, [searchQuery, sentimentFilter, statusFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchReviews();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, sentimentFilter, statusFilter, page, limit]);

  // Toggle Hide / Display (Moderation)
  const handleToggleStatus = async (review: ReviewItem) => {
    const isCurrentlyHidden = review.status === 'hidden';
    const nextStatus = isCurrentlyHidden ? 'active' : 'hidden';
    
    try {
      setActionLoadingId(review._id);
      await apiClient.patch(`/reviews/${review._id}`, { status: nextStatus });
      
      setReviews((prev) =>
        prev.map((r) => (r._id === review._id ? { ...r, status: nextStatus } : r))
      );
      if (selectedReview && selectedReview._id === review._id) {
        setSelectedReview((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái kiểm duyệt:', error);
      alert('Không thể cập nhật trạng thái bài đánh giá. Vui lòng thử lại.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle Pin / Featured
  const handleToggleFeatured = async (review: ReviewItem) => {
    const nextFeatured = !review.isFeatured;
    const nextPinnedAt = nextFeatured ? new Date().toISOString() : null;

    try {
      setActionLoadingId(review._id);
      await apiClient.patch(`/reviews/${review._id}`, {
        isFeatured: nextFeatured,
        pinnedAt: nextPinnedAt,
      });

      setReviews((prev) =>
        prev.map((r) =>
          r._id === review._id
            ? { ...r, isFeatured: nextFeatured, pinnedAt: nextPinnedAt }
            : r
        )
      );
      if (selectedReview && selectedReview._id === review._id) {
        setSelectedReview((prev) =>
          prev ? { ...prev, isFeatured: nextFeatured, pinnedAt: nextPinnedAt } : null
        );
      }
    } catch (error) {
      console.error('Lỗi khi ghim đánh giá:', error);
      alert('Không thể ghim bài đánh giá. Vui lòng thử lại.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete / Hard Remove Action
  const handleDeleteReview = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa vĩnh viễn bài đánh giá này khỏi cơ sở dữ liệu?')) return;
    try {
      setActionLoadingId(id);
      await apiClient.delete(`/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      if (selectedReview && selectedReview._id === id) {
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Lỗi khi xóa đánh giá:', error);
      alert('Không thể xóa bài đánh giá. Vui lòng kiểm tra lại quyền truy cập.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Export CSV with UTF-8 BOM
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const res = await apiClient.get('/reviews/all', {
        params: {
          page: 1,
          limit: 300,
          search: searchQuery,
          sentiment: sentimentFilter,
          status: statusFilter !== 'all' && statusFilter !== 'featured' ? statusFilter : undefined,
          isFeatured: statusFilter === 'featured' ? 'true' : undefined,
        },
      });

      const list: ReviewItem[] = res.data?.data || res.data || reviews;
      if (!list || list.length === 0) {
        alert('Không có dữ liệu đánh giá nào để xuất file.');
        return;
      }

      const headers = [
        'Mã Review',
        'Người Đánh Giá',
        'Tên Nhà Hàng',
        'Số Sao',
        'Trạng Thái',
        'Nổi Bật / Ghim',
        'Cảm Xúc AI',
        'Độ Tin Cậy AI (%)',
        'Hashtags AI',
        'Nội Dung Nhận Xét',
        'Ngày Đăng',
      ];

      const csvRows = [headers.join(',')];

      list.forEach((item) => {
        const restName =
          typeof item.restaurantId === 'object'
            ? item.restaurantId?.tenQuan
            : 'Nhà hàng GastroWise';
        const stars = getReviewStars(item);
        const reviewer = getReviewerName(item);
        const content = getReviewContent(item);
        const statusText =
          item.status === 'hidden'
            ? 'Đã ẩn (Vi phạm)'
            : item.status === 'pending'
            ? 'Chờ duyệt'
            : 'Đang hiển thị';
        const featuredText = item.isFeatured ? 'Đã ghim nổi bật' : 'Bình thường';
        const sentimentText = item.aiSentimentLabel || 'NEUTRAL';
        const scorePercent = item.aiSentimentScore
          ? Math.round(item.aiSentimentScore * 100) + '%'
          : 'N/A';
        const tags = (item.hashtags || []).join(' ');
        const cleanContent = content.replace(/"/g, '""').replace(/(\r\n|\n|\r)/gm, ' ');
        const createdDate = item.createdAt
          ? new Date(item.createdAt).toLocaleString('vi-VN')
          : '';

        const row = [
          `"${item._id}"`,
          `"${reviewer.replace(/"/g, '""')}"`,
          `"${(restName || '').replace(/"/g, '""')}"`,
          stars,
          `"${statusText}"`,
          `"${featuredText}"`,
          `"${sentimentText}"`,
          `"${scorePercent}"`,
          `"${tags.replace(/"/g, '""')}"`,
          `"${cleanContent}"`,
          `"${createdDate}"`,
        ];

        csvRows.push(row.join(','));
      });

      // Thêm BOM \uFEFF để Excel mở hiển thị đúng tiếng Việt có dấu
      const csvString = '\uFEFF' + csvRows.join('\r\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `gastrowise_reviews_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Lỗi xuất file CSV:', error);
      alert('Không thể xuất file CSV đánh giá.');
    } finally {
      setIsExporting(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary-600" /> CRM Kiểm Duyệt Đánh Giá & AI Sentiment
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kiểm duyệt ẩn/hiển thị nhận xét, ghim bài đánh giá chất lượng cao lên đầu trang và trích xuất báo cáo CSV.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={handleExportCSV}
            disabled={isExporting}
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-100"
            icon={isExporting ? <Loader2 className="w-4 h-4 animate-spin text-slate-600" /> : <Download className="w-4 h-4 text-emerald-600" />}
          >
            {isExporting ? 'Đang xuất CSV...' : 'Xuất CSV Đánh Giá'}
          </Button>

          <Button
            onClick={handleMigrateSentiment}
            disabled={isMigrating}
            variant="ghost"
            className="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
            icon={isMigrating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 text-purple-600" />}
          >
            Chạy AI Re-Scan
          </Button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo nội dung đánh giá, người viết..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="all">Tất cả Trạng thái</option>
              <option value="active">🟢 Đang hiển thị</option>
              <option value="hidden">🚫 Đã ẩn (Vi phạm)</option>
              <option value="featured">⭐ Đã ghim nổi bật</option>
            </select>
          </div>

          {/* Sentiment Filter */}
          <div className="flex items-center gap-2">
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
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-2" />
            <p className="text-sm font-medium text-slate-500">Đang tải danh sách Đánh giá & AI Sentiment...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Chưa có đánh giá nào</h3>
            <p className="text-xs text-slate-500 mt-1">Hệ thống chưa ghi nhận nhận xét khớp với bộ lọc tìm kiếm.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Người đánh giá</th>
                  <th className="px-6 py-4">Nhà hàng & Số sao</th>
                  <th className="px-6 py-4 max-w-md">Nội dung & Nhãn</th>
                  <th className="px-6 py-4">Cảm xúc AI</th>
                  <th className="px-6 py-4 text-right">Kiểm duyệt & Ghim</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviews.map((row) => {
                  const restName = typeof row.restaurantId === 'object' ? row.restaurantId?.tenQuan : 'Nhà hàng GastroWise';
                  const stars = getReviewStars(row);
                  const reviewerName = getReviewerName(row);
                  const content = getReviewContent(row);
                  const images = getReviewImages(row);
                  const isHidden = row.status === 'hidden';
                  const isPinned = Boolean(row.isFeatured);
                  const isActionLoading = actionLoadingId === row._id;

                  return (
                    <tr 
                      key={row._id} 
                      className={`transition-colors ${
                        isPinned 
                          ? 'bg-amber-50/40 hover:bg-amber-50/60' 
                          : isHidden 
                          ? 'bg-rose-50/20 hover:bg-rose-50/30 opacity-75' 
                          : 'hover:bg-slate-50/60'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-full font-extrabold flex items-center justify-center text-xs ${
                            isPinned ? 'bg-amber-500 text-white shadow-sm' : 'bg-primary-100 text-primary-700'
                          }`}>
                            {reviewerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              {reviewerName}
                            </div>
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
                        {/* Status & Featured Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          {isPinned && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full shadow-2xs">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Ghim nổi bật
                            </span>
                          )}
                          {isHidden ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                              <EyeOff className="w-3 h-3 text-rose-600" /> Đã ẩn (Vi phạm)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đang hiển thị
                            </span>
                          )}
                        </div>

                        <p className={`text-xs line-clamp-2 leading-relaxed ${isHidden ? 'text-slate-400 italic line-through' : 'text-slate-700'}`}>
                          "{content}"
                        </p>

                        {/* Images preview */}
                        {images.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2">
                            {images.slice(0, 3).map((img, idx) => (
                              <img key={idx} src={img} alt="" className="w-8 h-8 rounded-md object-cover border border-slate-200" />
                            ))}
                            {images.length > 3 && (
                              <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-1 rounded">
                                +{images.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Hashtags */}
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
                          {/* Pin Toggle Button */}
                          <button
                            onClick={() => handleToggleFeatured(row)}
                            disabled={isActionLoading}
                            className={`p-2 rounded-lg border transition-all ${
                              isPinned
                                ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200'
                            }`}
                            title={isPinned ? 'Bỏ ghim đánh giá nổi bật' : 'Ghim đánh giá lên đầu'}
                          >
                            <Pin className={`h-4 w-4 ${isPinned ? 'fill-amber-600 text-amber-600 rotate-45' : ''}`} />
                          </button>

                          {/* Hide / Display Toggle Button */}
                          <button
                            onClick={() => handleToggleStatus(row)}
                            disabled={isActionLoading}
                            className={`p-2 rounded-lg border transition-all ${
                              isHidden
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200'
                            }`}
                            title={isHidden ? 'Bỏ ẩn (Cho phép hiển thị lại)' : 'Ẩn bài đánh giá do vi phạm'}
                          >
                            {isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>

                          {/* Detail View */}
                          <button 
                            onClick={() => { setSelectedReview(row); setShowDetailModal(true); }}
                            className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                            title="Xem chi tiết nhận xét & AI analysis"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Hard Delete */}
                          <button 
                            onClick={() => handleDeleteReview(row._id)}
                            disabled={isActionLoading}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors"
                            title="Xóa vĩnh viễn"
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
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 bg-white px-6 py-4 gap-3">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <h2 className="font-bold text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-400" /> Chi tiết Đánh Giá & Kiểm Duyệt AI
              </h2>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-slate-700 max-h-[80vh] overflow-y-auto">
              {/* User Header & Sentiment */}
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                    {getReviewerName(selectedReview).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{getReviewerName(selectedReview)}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedReview.createdAt ? new Date(selectedReview.createdAt).toLocaleString('vi-VN') : 'Mới đây'}
                    </p>
                  </div>
                </div>
                {getSentimentBadge(selectedReview.aiSentimentLabel, selectedReview.aiSentimentScore)}
              </div>

              {/* Status & Featured Control Strip */}
              <div className="flex items-center justify-between p-3.5 bg-slate-100/70 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Trạng thái:</span>
                  {selectedReview.status === 'hidden' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                      🚫 Đã ẩn
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      🟢 Đang hiển thị
                    </span>
                  )}
                  {selectedReview.isFeatured && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                      ⭐ Nổi bật
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleFeatured(selectedReview)}
                    className="text-xs"
                    icon={<Pin className="w-3.5 h-3.5 text-amber-500" />}
                  >
                    {selectedReview.isFeatured ? 'Bỏ ghim' : 'Ghim bài này'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(selectedReview)}
                    className={`text-xs ${selectedReview.status === 'hidden' ? 'text-emerald-700 border-emerald-300' : 'text-rose-700 border-rose-300'}`}
                    icon={selectedReview.status === 'hidden' ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-rose-600" />}
                  >
                    {selectedReview.status === 'hidden' ? 'Hiện lại' : 'Ẩn đánh giá'}
                  </Button>
                </div>
              </div>

              {/* Restaurant Info */}
              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Nhà hàng liên kết</span>
                <p className="font-semibold text-slate-900 mt-0.5">
                  🏠 {typeof selectedReview.restaurantId === 'object' ? selectedReview.restaurantId?.tenQuan : 'Nhà hàng GastroWise'}
                </p>
                {typeof selectedReview.restaurantId === 'object' && selectedReview.restaurantId?.diaChi && (
                  <p className="text-xs text-slate-500 mt-0.5">{selectedReview.restaurantId.diaChi}</p>
                )}
              </div>

              {/* Stars */}
              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Đánh giá số sao</span>
                <div className="flex items-center gap-1 text-amber-500 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < getReviewStars(selectedReview) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                    />
                  ))}
                  <span className="text-sm font-bold text-slate-800 ml-1">
                    {getReviewStars(selectedReview)}.0 / 5.0
                  </span>
                </div>
              </div>

              {/* Comment Content */}
              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Nội dung nhận xét</span>
                <p className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-sm text-slate-800 mt-1 leading-relaxed">
                  "{getReviewContent(selectedReview)}"
                </p>
              </div>

              {/* Hashtags */}
              {selectedReview.hashtags && selectedReview.hashtags.length > 0 && (
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">Từ khóa trích xuất AI</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {selectedReview.hashtags.map((tag, i) => (
                      <span key={i} className="text-xs font-medium text-primary-700 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos */}
              {getReviewImages(selectedReview).length > 0 && (
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">
                    Hình ảnh đính kèm ({getReviewImages(selectedReview).length})
                  </span>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {getReviewImages(selectedReview).map((img, i) => (
                      <img key={i} src={img} alt="" className="w-full h-20 rounded-xl object-cover border border-slate-200" />
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Button 
                  onClick={() => handleDeleteReview(selectedReview._id)}
                  variant="outline"
                  className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  icon={<Trash2 className="w-4 h-4 text-rose-500" />}
                >
                  Xóa vĩnh viễn
                </Button>

                <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                  Đóng cửa sổ
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

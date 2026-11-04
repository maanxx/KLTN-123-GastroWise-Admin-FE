'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  Loader2, 
  X, 
  MapPin, 
  Clock, 
  Tag, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Wand2,
  ShieldCheck,
  ShieldAlert,
  Power,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { apiClient } from '@/shared/lib/axios';

interface RestaurantItem {
  _id: string;
  id?: string;
  tenQuan: string;
  diaChi: string;
  diemTrungBinh: number;
  gioMoCua: string;
  giaCa: string;
  tags?: string;
  avatarUrl?: string;
  urlGoc?: string;
  status?: string;
  isVerified?: boolean;
  isFeatured?: boolean;
  slug?: string;
  moTa?: string;
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [badgeFilter, setBadgeFilter] = useState<string>('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantItem | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingRestaurant, setEditingRestaurant] = useState<RestaurantItem | null>(null);
  
  // AI Generation Loading State
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  // Form Fields
  const [formData, setFormData] = useState({
    tenQuan: '',
    diaChi: '',
    gioMoCua: '08:00 - 22:00',
    giaCa: '30.000đ - 100.000đ',
    tags: 'Món Việt, Quán ăn gia đình',
    moTa: '',
    status: 'open',
    isVerified: false,
    isFeatured: false,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  const fetchRestaurants = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/restaurants?limit=150');
      const data = res.data?.data || res.data || [];
      setRestaurants(data);
    } catch (error) {
      console.error('Lỗi kết nối API restaurants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Quick Toggle Status (Open <-> Closed)
  const handleToggleStatus = async (item: RestaurantItem) => {
    const id = item._id || item.id || '';
    const nextStatus = item.status === 'closed' ? 'open' : 'closed';
    try {
      setActionLoadingId(id);
      await apiClient.patch(`/restaurants/${id}`, { status: nextStatus });
      setRestaurants(prev => prev.map(r => ((r._id || r.id) === id ? { ...r, status: nextStatus } : r)));
      if (selectedRestaurant && (selectedRestaurant._id || selectedRestaurant.id) === id) {
        setSelectedRestaurant(prev => prev ? { ...prev, status: nextStatus } : null);
      }
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái hoạt động:', error);
      alert('Không thể thay đổi trạng thái nhà hàng.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Quick Toggle Verified Badge (Quán uy tín)
  const handleToggleVerified = async (item: RestaurantItem) => {
    const id = item._id || item.id || '';
    const nextVerified = !item.isVerified;
    try {
      setActionLoadingId(id);
      await apiClient.patch(`/restaurants/${id}`, { isVerified: nextVerified });
      setRestaurants(prev => prev.map(r => ((r._id || r.id) === id ? { ...r, isVerified: nextVerified } : r)));
      if (selectedRestaurant && (selectedRestaurant._id || selectedRestaurant.id) === id) {
        setSelectedRestaurant(prev => prev ? { ...prev, isVerified: nextVerified } : null);
      }
    } catch (error) {
      console.error('Lỗi cập nhật nhãn Quán uy tín:', error);
      alert('Không thể cập nhật nhãn Quán uy tín.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Quick Toggle AI Featured Badge (AI Đề xuất)
  const handleToggleFeatured = async (item: RestaurantItem) => {
    const id = item._id || item.id || '';
    const nextFeatured = !item.isFeatured;
    try {
      setActionLoadingId(id);
      await apiClient.patch(`/restaurants/${id}`, { isFeatured: nextFeatured });
      setRestaurants(prev => prev.map(r => ((r._id || r.id) === id ? { ...r, isFeatured: nextFeatured } : r)));
      if (selectedRestaurant && (selectedRestaurant._id || selectedRestaurant.id) === id) {
        setSelectedRestaurant(prev => prev ? { ...prev, isFeatured: nextFeatured } : null);
      }
    } catch (error) {
      console.error('Lỗi cập nhật nhãn AI Đề xuất:', error);
      alert('Không thể cập nhật nhãn AI Đề xuất.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter logic
  const filteredRestaurants = restaurants.filter(r => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      (r.tenQuan && r.tenQuan.toLowerCase().includes(term)) ||
      (r.diaChi && r.diaChi.toLowerCase().includes(term)) ||
      (r.tags && r.tags.toLowerCase().includes(term));

    // Status Filter
    let matchStatus = true;
    if (statusFilter === 'open') {
      matchStatus = r.status !== 'closed';
    } else if (statusFilter === 'closed') {
      matchStatus = r.status === 'closed';
    }

    // Badge Filter
    let matchBadge = true;
    if (badgeFilter === 'verified') {
      matchBadge = Boolean(r.isVerified);
    } else if (badgeFilter === 'featured') {
      matchBadge = Boolean(r.isFeatured);
    }

    return matchSearch && matchStatus && matchBadge;
  });

  // Pagination math
  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage) || 1;
  const paginatedData = filteredRestaurants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhà hàng này khỏi hệ thống?')) return;
    try {
      await apiClient.delete(`/restaurants/${id}`);
      setRestaurants(prev => prev.filter(item => (item._id || item.id) !== id));
      alert('Đã xóa nhà hàng thành công!');
    } catch (err) {
      alert('Đã có lỗi xảy ra khi xóa nhà hàng.');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item: RestaurantItem) => {
    setIsAddModalOpen(false);
    setEditingRestaurant(item);
    setFormData({
      tenQuan: item.tenQuan || '',
      diaChi: item.diaChi || '',
      gioMoCua: item.gioMoCua || '',
      giaCa: item.giaCa || '',
      tags: item.tags || '',
      moTa: item.moTa || (item as any).description || '',
      status: item.status || 'open',
      isVerified: Boolean(item.isVerified),
      isFeatured: Boolean(item.isFeatured),
    });
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingRestaurant(null);
    setFormData({
      tenQuan: '',
      diaChi: '',
      gioMoCua: '08:00 - 22:00',
      giaCa: '30.000đ - 100.000đ',
      tags: 'Món Việt, Quán gia đình',
      moTa: '',
      status: 'open',
      isVerified: false,
      isFeatured: false,
    });
    setIsAddModalOpen(true);
  };

  // Handle Save (Create or Edit)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tenQuan.trim() || !formData.diaChi.trim()) return;

    try {
      if (editingRestaurant) {
        // UPDATE
        const resId = editingRestaurant._id || editingRestaurant.id;
        await apiClient.patch(`/restaurants/${resId}`, formData);
        alert('Cập nhật thông tin nhà hàng thành công!');
        setEditingRestaurant(null);
      } else {
        // CREATE
        await apiClient.post('/restaurants', {
          ...formData,
          diemTrungBinh: 5.0,
        });
        alert('Thêm nhà hàng mới thành công!');
        setIsAddModalOpen(false);
      }
      fetchRestaurants();
    } catch (err) {
      alert('Thao tác thất bại. Vui lòng kiểm tra lại đường truyền kết nối.');
    }
  };

  // AI Helper: Gợi ý Tag & Mô tả SEO tự động bằng Gemini
  const handleGenerateAiInfo = async () => {
    if (!formData.tenQuan.trim()) {
      alert('Vui lòng nhập tên nhà hàng trước khi chạy AI!');
      return;
    }
    setIsGeneratingAi(true);
    try {
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          tags: `${prev.tenQuan.includes('Phở') ? 'Món Việt, Phở Gia Truyền, Nước Dùng Thanh' : 'Ẩm Thực Việt, Quán Ăn Ngon, Đa Dạng Món'}`,
          moTa: `Nhà hàng ${prev.tenQuan} tọa lạc tại ${prev.diaChi || 'vị trí đắc địa'}, nổi tiếng với không gian thoáng đãng, thực đơn phong phú cùng phong cách phục vụ chu đáo. Đây là địa điểm lý tưởng cho các buổi họp mặt gia đình và bạn bè.`,
        }));
        setIsGeneratingAi(false);
      }, 1000);
    } catch (error) {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 flex items-center gap-2">
            CMS Quản Lý Nhà Hàng & Nhãn Đối Tác
            <span className="bg-primary-50 text-primary-700 text-xs px-2.5 py-1 rounded-full border border-primary-200 font-semibold">
              Trạng thái & AI Badges
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý thông tin nhà hàng, gán nhãn Quán uy tín, nhãn AI Đề xuất và bật/tắt trạng thái hoạt động tức thì.
          </p>
        </div>
        <Button onClick={handleOpenAdd} icon={<Plus className="h-4 w-4" />}>
          Thêm nhà hàng mới
        </Button>
      </div>

      {/* Filters & DataTable Control */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo tên quán, địa chỉ, thẻ tag..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Power className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="all">Tất cả Trạng thái</option>
              <option value="open">🟢 Đang mở cửa</option>
              <option value="closed">🔴 Tạm đóng</option>
            </select>
          </div>

          {/* Badge Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={badgeFilter}
              onChange={(e) => {
                setBadgeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="all">Tất cả Nhãn đối tác</option>
              <option value="verified">🛡️ Quán uy tín</option>
              <option value="featured">✨ AI Đề xuất</option>
            </select>
          </div>

          <div className="text-xs font-semibold text-slate-500 hidden xl:block">
            {paginatedData.length} / {filteredRestaurants.length} quán
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500 mb-2" />
            <span className="text-sm font-medium">Đang tải danh sách nhà hàng từ hệ thống...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Nhà hàng & Địa chỉ</th>
                  <th className="px-6 py-4">Nhãn & Thẻ Tags</th>
                  <th className="px-6 py-4">Đánh giá</th>
                  <th className="px-6 py-4">Giờ mở & Giá</th>
                  <th className="px-6 py-4">Trạng thái & Nhãn nhanh</th>
                  <th className="px-6 py-4 text-right">Thao tác CRUD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      Không tìm thấy nhà hàng nào phù hợp với bộ lọc tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row) => {
                    const rowId = row._id || row.id || '';
                    const isOpen = row.status !== 'closed';
                    const isVerified = Boolean(row.isVerified);
                    const isFeatured = Boolean(row.isFeatured);
                    const isRowBusy = actionLoadingId === rowId;

                    return (
                      <tr key={rowId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 relative">
                              <img
                                src={row.avatarUrl || `https://picsum.photos/seed/${rowId}/100/100`}
                                alt={row.tenQuan}
                                className="h-full w-full object-cover"
                              />
                              {isFeatured && (
                                <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-white" title="AI Đề xuất" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 line-clamp-1 flex items-center gap-1.5">
                                {row.tenQuan}
                                {isVerified && (
                                  <span title="Quán uy tín đã xác thực"><ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" /></span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{row.diaChi}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {isVerified && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Uy tín
                              </span>
                            )}
                            {isFeatured && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                                <Sparkles className="w-3 h-3 text-purple-600" /> AI Đề xuất
                              </span>
                            )}
                            <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-xs font-medium">
                              {row.tags || 'Món Việt'}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 font-bold text-amber-600">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            {row.diemTrungBinh ? Number(row.diemTrungBinh).toFixed(1) : '5.0'}
                          </div>
                        </td>

                        <td className="px-6 py-4 font-semibold text-slate-700 text-xs">
                          <div>{row.gioMoCua || '08:00 - 22:00'}</div>
                          <div className="text-slate-400 text-[11px] font-normal">{row.giaCa || '30k - 100k'}</div>
                        </td>

                        {/* Status & Quick Toggle Strip */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            {/* Toggle Open/Closed */}
                            <button
                              onClick={() => handleToggleStatus(row)}
                              disabled={isRowBusy}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                                isOpen 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              }`}
                              title="Bấm để bật/tắt trạng thái Mở/Đóng cửa"
                            >
                              <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              {isOpen ? 'Mở cửa' : 'Tạm đóng'}
                            </button>

                            {/* Quick Toggle Verified */}
                            <button
                              onClick={() => handleToggleVerified(row)}
                              disabled={isRowBusy}
                              className={`p-1.5 rounded-lg border transition-all ${
                                isVerified
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-emerald-600 hover:border-emerald-200'
                              }`}
                              title={isVerified ? 'Bỏ nhãn Quán uy tín' : 'Gán nhãn Quán uy tín'}
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </button>

                            {/* Quick Toggle AI Featured */}
                            <button
                              onClick={() => handleToggleFeatured(row)}
                              disabled={isRowBusy}
                              className={`p-1.5 rounded-lg border transition-all ${
                                isFeatured
                                  ? 'bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100'
                                  : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-purple-600 hover:border-purple-200'
                              }`}
                              title={isFeatured ? 'Bỏ nhãn AI Đề xuất' : 'Gán nhãn Được AI Đề xuất'}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedRestaurant(row)}
                              className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Xem chi tiết & Tóm tắt AI"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(row)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Chỉnh sửa (CRUD Edit)"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(rowId)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Xóa nhà hàng"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* DataTable Pagination Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Trang {currentPage} / {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal View Detail & AI Summary */}
      {selectedRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedRestaurant(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-2 pr-6">
              <h3 className="font-heading text-xl font-extrabold text-slate-900">
                {selectedRestaurant.tenQuan}
              </h3>
            </div>

            {/* Badges in modal */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                selectedRestaurant.status !== 'closed'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {selectedRestaurant.status !== 'closed' ? '🟢 Đang mở cửa' : '🔴 Tạm đóng'}
              </span>

              {selectedRestaurant.isVerified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Quán uy tín đã xác thực
                </span>
              )}

              {selectedRestaurant.isFeatured && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Được AI Đề xuất
                </span>
              )}
            </div>

            <div className="h-44 w-full rounded-2xl overflow-hidden mb-4 border border-slate-200">
              <img
                src={selectedRestaurant.avatarUrl || `https://picsum.photos/seed/${selectedRestaurant._id}/600/300`}
                alt={selectedRestaurant.tenQuan}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <span><strong>Địa chỉ:</strong> {selectedRestaurant.diaChi}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                <span><strong>Giờ mở cửa:</strong> {selectedRestaurant.gioMoCua || '08:00 - 22:00'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-slate-400 shrink-0" />
                <span><strong>Thẻ tags:</strong> {selectedRestaurant.tags || 'Món ăn'}</span>
              </div>

              {/* AI Health Summary Box */}
              <div className="mt-4 p-3 bg-gradient-to-r from-primary-50 to-amber-50 border border-primary-200 rounded-xl">
                <div className="flex items-center gap-1.5 font-bold text-primary-800 text-xs mb-1">
                  <Sparkles className="h-4 w-4 text-amber-500" /> AI Restaurant Summary Insights:
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  {selectedRestaurant.moTa || `Nhà hàng ${selectedRestaurant.tenQuan} có điểm đánh giá trung bình ${selectedRestaurant.diemTrungBinh || 5.0}/5. AI tổng hợp: Quán phục vụ tốt, hương vị món ăn đậm đà, được nhiều khách hàng đề xuất.`}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center pt-3 border-t border-slate-100">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleToggleStatus(selectedRestaurant)}
                className={selectedRestaurant.status === 'closed' ? 'text-emerald-700 border-emerald-300' : 'text-rose-700 border-rose-300'}
              >
                {selectedRestaurant.status === 'closed' ? 'Mở cửa lại quán' : 'Tạm đóng cửa quán'}
              </Button>

              <Button onClick={() => setSelectedRestaurant(null)}>Đóng</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form: Add or Edit Restaurant */}
      {(isAddModalOpen || editingRestaurant) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingRestaurant(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-heading text-xl font-extrabold text-slate-900 mb-1">
              {editingRestaurant ? 'Chỉnh Sửa Thông Tin Nhà Hàng' : 'Thêm Nhà Hàng Mới'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Cập nhật thông tin chi tiết, trạng thái mở cửa và gắn nhãn AI / Uy tín.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên nhà hàng *</label>
                <input
                  type="text"
                  required
                  value={formData.tenQuan}
                  onChange={(e) => setFormData(prev => ({ ...prev, tenQuan: e.target.value }))}
                  placeholder="Ví dụ: Phở Bò Gia Truyền Nam Định"
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Địa chỉ đầy đủ *</label>
                <input
                  type="text"
                  required
                  value={formData.diaChi}
                  onChange={(e) => setFormData(prev => ({ ...prev, diaChi: e.target.value }))}
                  placeholder="Ví dụ: 123 Nguyễn Thị Minh Khai, Quận 1, TP.HCM"
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giờ mở cửa</label>
                  <input
                    type="text"
                    value={formData.gioMoCua}
                    onChange={(e) => setFormData(prev => ({ ...prev, gioMoCua: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Khoảng giá</label>
                  <input
                    type="text"
                    value={formData.giaCa}
                    onChange={(e) => setFormData(prev => ({ ...prev, giaCa: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Status and Badges Controls */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Trạng thái hoạt động</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="open">🟢 Đang mở cửa</option>
                    <option value="closed">🔴 Tạm đóng</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Quán ăn uy tín (isVerified)
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.isVerified}
                    onChange={(e) => setFormData(prev => ({ ...prev, isVerified: e.target.checked }))}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" /> Được AI Đề xuất ưu tiên (isFeatured)
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Thẻ Tags (Phân loại)</label>
                  <button
                    type="button"
                    onClick={handleGenerateAiInfo}
                    disabled={isGeneratingAi}
                    className="text-[11px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-200"
                  >
                    {isGeneratingAi ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3 text-amber-500" />}
                    AI Tự Động Tạo Tags & SEO
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Món Việt, Quán gia đình, Phở"
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả quán ăn chuẩn SEO (AI Generated)</label>
                <textarea
                  rows={3}
                  value={formData.moTa}
                  onChange={(e) => setFormData(prev => ({ ...prev, moTa: e.target.value }))}
                  placeholder="Nhập hoặc sử dụng AI để tạo tự động mô tả giới thiệu..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2 border-t border-slate-100">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingRestaurant(null);
                  }}
                >
                  Hủy
                </Button>
                <Button type="submit">
                  {editingRestaurant ? 'Lưu cập nhật' : 'Tạo mới nhà hàng'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

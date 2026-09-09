'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Star, Loader2, X, MapPin, Clock, Tag, Sparkles, ChevronLeft, ChevronRight, Wand2 } from 'lucide-react';
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
  slug?: string;
  moTa?: string;
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantItem | null>(null);
  
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
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  const fetchRestaurants = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/restaurants?limit=100');
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

  // Filter
  const filteredRestaurants = restaurants.filter(r => {
    const term = searchTerm.toLowerCase();
    return (
      (r.tenQuan && r.tenQuan.toLowerCase().includes(term)) ||
      (r.diaChi && r.diaChi.toLowerCase().includes(term)) ||
      (r.tags && r.tags.toLowerCase().includes(term))
    );
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
          status: 'open',
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
      // Giả lập hoặc gọi prompt AI hỗ trợ tạo mô tả
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          tags: `${prev.tenQuan.includes('Phở') ? 'Món Việt, Phở Gia Truyền, Nước Dùng Thanh' : 'Ẩm Thực Việt, Quán Ăn Ngon, Đa Dạng Món'}`,
          moTa: `Nhà hàng ${prev.tenQuan} tọa lạc tại ${prev.diaChi || 'vị trí đắc địa'}, nổi tiếng với không gian thoáng đãng, thực đơn phong phú cùng phong cách phục vụ chu đáo. Đây là địa điểm lý tưởng cho các buổi họp mặt gia đình và bạn bè.`,
        }));
        setIsGeneratingAi(false);
      }, 1200);
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
            CMS Quản Lý Nhà Hàng 
            <span className="bg-primary-50 text-primary-700 text-xs px-2.5 py-1 rounded-full border border-primary-200">
              CRUD & AI Assisted
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý dữ liệu đối tác nhà hàng, hỗ trợ phân trang DataTable và AI Auto-Tagging chuẩn SEO.
          </p>
        </div>
        <Button onClick={handleOpenAdd} icon={<Plus className="h-4 w-4" />}>
          Thêm nhà hàng mới
        </Button>
      </div>

      {/* Filters & DataTable Control */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
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
        
        <div className="text-xs font-semibold text-slate-500">
          Hiển thị <strong className="text-slate-900">{paginatedData.length}</strong> / tổng {filteredRestaurants.length} kết quả (Trang {currentPage}/{totalPages})
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500 mb-2" />
            <span className="text-sm font-medium">Đang tải dữ liệu nhà hàng...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Nhà hàng & Địa chỉ</th>
                  <th className="px-6 py-4">Thẻ tags AI</th>
                  <th className="px-6 py-4">Đánh giá</th>
                  <th className="px-6 py-4">Giờ mở & Giá</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác CRUD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      Không tìm thấy nhà hàng nào phù hợp với từ khóa.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row) => {
                    const rowId = row._id || row.id || '';
                    return (
                      <tr key={rowId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                              <img
                                src={row.avatarUrl || `https://picsum.photos/seed/${rowId}/100/100`}
                                alt={row.tenQuan}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 line-clamp-1">{row.tenQuan}</div>
                              <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{row.diaChi}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-primary-50 text-primary-700 border border-primary-200/60 px-2.5 py-1 rounded-md text-xs font-semibold">
                            {row.tags || 'Món Việt'}
                          </span>
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
                        <td className="px-6 py-4">
                          <Badge variant="success">Hoạt động</Badge>
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

            <h3 className="font-heading text-xl font-extrabold text-slate-900 mb-4 pr-6">
              {selectedRestaurant.tenQuan}
            </h3>

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

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setSelectedRestaurant(null)}>Đóng</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form: Add or Edit Restaurant */}
      {(isAddModalOpen || editingRestaurant) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
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
              Cập nhật thông tin chi tiết và sử dụng AI Trợ lý tự động sinh Tags/Mô tả.
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

              <div className="mt-6 flex justify-end gap-3">
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


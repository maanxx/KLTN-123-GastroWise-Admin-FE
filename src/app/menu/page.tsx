'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Sparkles, X, Camera, Scan, CheckCircle2, Loader2, Utensils, DollarSign, Tag, Leaf } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { apiClient } from '@/shared/lib/axios';

interface MenuItem {
  _id: string;
  restaurantId?: {
    _id: string;
    tenQuan: string;
    diaChi: string;
  } | string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isVegetarian?: boolean;
  calories?: number;
  tags?: string[];
  status?: string;
}

interface RestaurantOption {
  _id: string;
  tenQuan: string;
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRestaurantFilter, setSelectedRestaurantFilter] = useState('all');

  // AI Generator Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [aiSelectedRestId, setAiSelectedRestId] = useState('');

  // Add Manual Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    restaurantId: '',
    name: '',
    description: '',
    price: '',
    isVegetarian: false,
    image: '',
    tags: '',
  });

  // Fetch Menu Items & Restaurants
  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuRes, restRes] = await Promise.all([
        apiClient.get('/restaurants/menu/all'),
        apiClient.get('/restaurants?limit=100')
      ]);

      const items = Array.isArray(menuRes.data) ? menuRes.data : menuRes.data.data || [];
      const restData = restRes.data?.data || restRes.data || [];

      setMenuItems(items);
      setRestaurants(restData);
      if (restData.length > 0) {
        setFormData((prev) => ({ ...prev, restaurantId: restData[0]._id }));
        setAiSelectedRestId(restData[0]._id);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách menu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Menu Items
  const filteredMenu = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesRest = true;
    if (selectedRestaurantFilter !== 'all') {
      const restId = typeof item.restaurantId === 'object' ? item.restaurantId?._id : item.restaurantId;
      matchesRest = restId === selectedRestaurantFilter;
    }

    return matchesSearch && matchesRest;
  });

  // Handle Simulate AI Scan
  const handleSimulateScan = () => {
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        name: 'Sườn nướng tảng xốt BBQ',
        description: 'Miếng sườn heo nguyên tảng được tẩm ướp xốt BBQ độc quyền 12 tiếng, nướng than hoa mềm mọng bên trong, cháy xém bên ngoài.',
        suggestedPrice: '185000',
        category: 'Món chính',
        isVegetarian: false,
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
      });
    }, 2000);
  };

  // Save AI Generated Menu Item
  const handleSaveAiItem = async () => {
    if (!aiSelectedRestId || !scanResult) return;
    try {
      setIsSubmitting(true);
      await apiClient.post(`/restaurants/${aiSelectedRestId}/menu`, {
        name: scanResult.name,
        description: scanResult.description,
        price: Number(scanResult.suggestedPrice),
        image: scanResult.image,
        isVegetarian: scanResult.isVegetarian,
        tags: [scanResult.category || 'Special']
      });
      setShowAiModal(false);
      setScanResult(null);
      await fetchData();
    } catch (error) {
      console.error('Lỗi khi lưu món AI:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Open Edit Modal
  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    const restId = typeof item.restaurantId === 'object' ? item.restaurantId?._id : item.restaurantId;
    setFormData({
      restaurantId: restId || restaurants[0]?._id || '',
      name: item.name || '',
      description: item.description || '',
      price: String(item.price || ''),
      isVegetarian: !!item.isVegetarian,
      image: item.image || '',
      tags: item.tags ? item.tags.join(', ') : '',
    });
    setShowAddModal(true);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      restaurantId: restaurants[0]?._id || '',
      name: '',
      description: '',
      price: '',
      isVegetarian: false,
      image: '',
      tags: '',
    });
    setShowAddModal(true);
  };

  // Submit Manual Form (Create or Edit)
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert('Vui lòng điền đầy đủ Tên món và Giá tiền!');
      return;
    }
    try {
      setIsSubmitting(true);
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        isVegetarian: formData.isVegetarian,
        image: formData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : ['Hot']
      };

      if (editingItem) {
        // UPDATE (PATCH /restaurants/menu/:menuId)
        await apiClient.patch(`/restaurants/menu/${editingItem._id}`, payload);
        alert('Cập nhật món ăn thành công!');
      } else {
        // CREATE (POST /restaurants/:id/menu)
        if (!formData.restaurantId) {
          alert('Vui lòng chọn nhà hàng!');
          return;
        }
        await apiClient.post(`/restaurants/${formData.restaurantId}/menu`, payload);
        alert('Thêm mới món ăn thành công!');
      }

      setShowAddModal(false);
      setEditingItem(null);
      await fetchData();
    } catch (error) {
      console.error('Lỗi khi lưu món ăn:', error);
      alert('Thao tác thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Menu Item
  const handleDeleteItem = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa món ăn này khỏi thực đơn?')) return;
    try {
      await apiClient.delete(`/restaurants/menu/${id}`);
      setMenuItems((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error('Lỗi khi xóa món:', error);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Utensils className="w-6 h-6 text-primary-600" /> Quản lý Thực đơn (CMS)
          </h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý danh sách món ăn, cập nhật giá cả, gán nhãn Món chay/Hot và khởi tạo bằng AI.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setShowAiModal(true)}
            variant="ghost" 
            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200" 
            icon={<Sparkles className="w-4 h-4 text-indigo-500" />}
          >
            Tạo món bằng AI
          </Button>
          <Button onClick={handleOpenAddModal} icon={<Plus className="h-4 w-4" />}>
            Thêm món thủ công
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
            placeholder="Tìm theo tên món ăn hoặc mô tả..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={selectedRestaurantFilter}
            onChange={(e) => setSelectedRestaurantFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="all">Tất cả Nhà hàng ({restaurants.length})</option>
            {restaurants.map((r) => (
              <option key={r._id} value={r._id}>{r.tenQuan}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-2" />
          <p className="text-sm font-medium text-slate-500">Đang tải danh sách món ăn từ MongoDB...</p>
        </div>
      ) : filteredMenu.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Chưa có món ăn nào</h3>
          <p className="text-xs text-slate-500 mt-1">Hãy nhấn "Thêm món thủ công" hoặc "Tạo món bằng AI" để bổ sung món mới.</p>
        </div>
      ) : (
        /* Grid Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMenu.map((item) => {
            const restName = typeof item.restaurantId === 'object' ? item.restaurantId?.tenQuan : 'Nhà hàng GastroWise';
            return (
              <div key={item._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  {/* Image Container */}
                  <div className="h-44 bg-slate-100 relative overflow-hidden">
                    <img 
                      src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {item.isVegetarian && (
                      <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <Leaf className="w-3 h-3" /> Món chay
                      </div>
                    )}

                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenEdit(item)}
                        className="bg-white/90 p-1.5 rounded-lg shadow text-slate-500 hover:text-amber-600 hover:bg-white transition-colors"
                        title="Chỉnh sửa món"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item._id)}
                        className="bg-white/90 p-1.5 rounded-lg shadow text-slate-500 hover:text-rose-600 hover:bg-white transition-colors"
                        title="Xóa món"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="text-xs text-slate-400 font-medium truncate mb-1" title={restName}>
                      🏠 {restName}
                    </div>
                    <h3 className="font-bold text-slate-900 line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 min-h-[2.25rem]">
                      {item.description || 'Chưa có mô tả món ăn...'}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-heading font-extrabold text-secondary-600 text-base">
                        {Number(item.price).toLocaleString('vi-VN')} đ
                      </span>
                      
                      {item.tags && item.tags.length > 0 && (
                        <Badge variant="default" className="text-[10px] bg-slate-50 text-slate-600 border-slate-200">
                          {item.tags[0]}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Trạng thái</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                    ● Đang bán
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Add Menu Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary-400" /> Thêm Món Ăn Mới
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Chọn Nhà Hàng</label>
                <select
                  value={formData.restaurantId}
                  onChange={(e) => setFormData({ ...formData, restaurantId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  {restaurants.map((r) => (
                    <option key={r._id} value={r._id}>{r.tenQuan}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Tên món ăn (*)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Phở bò đặc biệt"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Giá bán (VNĐ) (*)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="75000"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Nhãn / Tag</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Ví dụ: Món hot, Đặc sản"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Mô tả món ăn</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Nhập mô tả nguyên liệu, hương vị..."
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isVeg"
                  checked={formData.isVegetarian}
                  onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="isVeg" className="text-sm font-medium text-slate-700 cursor-pointer flex items-center gap-1">
                  <Leaf className="w-4 h-4 text-emerald-500" /> Đây là món ăn chay
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Hủy</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lưu món ăn'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Generator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white flex justify-between items-start shrink-0 relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10">
                <Sparkles className="w-48 h-48 animate-pulse" />
              </div>
              <div className="relative z-10">
                <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="w-6 h-6" /> AI Menu Generator
                </h2>
                <p className="text-indigo-100 mt-1">Tải ảnh lên, AI sẽ tự động viết mô tả và gợi ý giá bán cạnh tranh.</p>
              </div>
              <button onClick={() => setShowAiModal(false)} className="relative z-10 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Áp dụng cho Nhà hàng</label>
                <select
                  value={aiSelectedRestId}
                  onChange={(e) => setAiSelectedRestId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
                >
                  {restaurants.map((r) => (
                    <option key={r._id} value={r._id}>{r.tenQuan}</option>
                  ))}
                </select>
              </div>

              {!scanResult ? (
                <div className="space-y-6 pt-2">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/50 p-10 flex flex-col items-center justify-center text-center hover:bg-indigo-50 transition-colors cursor-pointer relative overflow-hidden">
                    {isScanning && (
                      <div className="absolute inset-0 bg-indigo-500/10 z-10">
                        <div className="w-full h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] absolute top-0 animate-[scan_2s_ease-in-out_infinite]" />
                      </div>
                    )}
                    
                    <div className={`p-4 bg-white rounded-full shadow-sm mb-4 relative z-20 ${isScanning ? 'animate-pulse text-indigo-500' : 'text-slate-400'}`}>
                      {isScanning ? <Scan className="w-10 h-10" /> : <Camera className="w-10 h-10" />}
                    </div>
                    <h3 className="font-bold text-slate-900 z-20">{isScanning ? 'AI Đang phân tích hình ảnh...' : 'Tải hình ảnh món ăn lên'}</h3>
                    <p className="text-sm text-slate-500 mt-1 z-20">Hỗ trợ JPG, PNG (Tối đa 5MB)</p>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button onClick={handleSimulateScan} disabled={isScanning} className="bg-indigo-600 hover:bg-indigo-700">
                      {isScanning ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Đang xử lý...</> : 'Upload & Chạy AI'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in pt-2">
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg font-medium text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    AI đã phân tích thành công hình ảnh của bạn!
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Tên món ăn (AI Gợi ý)</label>
                        <input 
                          type="text" 
                          value={scanResult.name} 
                          onChange={(e) => setScanResult({ ...scanResult, name: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Mức giá đề xuất (VNĐ)</label>
                        <input 
                          type="number" 
                          value={scanResult.suggestedPrice} 
                          onChange={(e) => setScanResult({ ...scanResult, suggestedPrice: e.target.value })}
                          className="w-full px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg font-heading font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors" 
                        />
                        <p className="text-xs text-slate-500">Dựa trên giá trung bình món nướng tương đương khu vực.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Mô tả hấp dẫn (AI Copywriting)</label>
                      <textarea 
                        value={scanResult.description}
                        onChange={(e) => setScanResult({ ...scanResult, description: e.target.value })}
                        rows={5}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {scanResult && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 shrink-0">
                <Button variant="outline" onClick={() => setScanResult(null)}>Quét lại ảnh khác</Button>
                <Button onClick={handleSaveAiItem} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lưu vào Thực đơn'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

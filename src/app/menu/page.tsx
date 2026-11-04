'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Sparkles, 
  X, 
  Camera, 
  Scan, 
  CheckCircle2, 
  Loader2, 
  Utensils, 
  DollarSign, 
  Tag, 
  Leaf,
  Download,
  Star,
  Power
} from 'lucide-react';
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
  isAvailable?: boolean;
  isFeatured?: boolean;
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [dietFilter, setDietFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // AI Generator Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [aiSelectedRestId, setAiSelectedRestId] = useState('');

  // Add / Edit Manual Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    restaurantId: '',
    name: '',
    description: '',
    price: '',
    isVegetarian: false,
    isAvailable: true,
    isFeatured: false,
    image: '',
    tags: '',
  });

  // Fetch Menu Items & Restaurants
  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuRes, restRes] = await Promise.all([
        apiClient.get('/restaurants/menu/all'),
        apiClient.get('/restaurants?limit=150')
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

  // Quick Toggle Availability (Còn món / Tạm hết)
  const handleToggleAvailability = async (item: MenuItem) => {
    const nextAvailable = item.isAvailable === false ? true : false;
    try {
      setActionLoadingId(item._id);
      await apiClient.patch(`/restaurants/menu/${item._id}`, { isAvailable: nextAvailable });
      setMenuItems((prev) =>
        prev.map((m) => (m._id === item._id ? { ...m, isAvailable: nextAvailable } : m))
      );
    } catch (error) {
      console.error('Lỗi cập nhật tình trạng món ăn:', error);
      alert('Không thể thay đổi tình trạng món ăn.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Quick Toggle Featured (Món đặc trưng của quán)
  const handleToggleFeatured = async (item: MenuItem) => {
    const nextFeatured = !item.isFeatured;
    try {
      setActionLoadingId(item._id);
      await apiClient.patch(`/restaurants/menu/${item._id}`, { isFeatured: nextFeatured });
      setMenuItems((prev) =>
        prev.map((m) => (m._id === item._id ? { ...m, isFeatured: nextFeatured } : m))
      );
    } catch (error) {
      console.error('Lỗi cập nhật nhãn Món đặc trưng:', error);
      alert('Không thể cập nhật nhãn Món đặc trưng.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    try {
      setIsExporting(true);
      if (filteredMenu.length === 0) {
        alert('Không có dữ liệu món ăn để xuất.');
        return;
      }

      const headers = [
        'Mã Món',
        'Tên Món Ăn',
        'Nhà Hàng',
        'Giá Bán (VNĐ)',
        'Tình Trạng',
        'Món Đặc Trưng',
        'Món Chay',
        'Thẻ Phân Loại',
        'Mô Tả Chi Tiết'
      ];

      const csvRows = [headers.join(',')];

      filteredMenu.forEach((m) => {
        const restName = typeof m.restaurantId === 'object' ? m.restaurantId?.tenQuan : 'GastroWise Partner';
        const inStockText = m.isAvailable !== false ? 'Còn món' : 'Tạm hết món';
        const featuredText = m.isFeatured ? 'Món đặc trưng' : 'Bình thường';
        const vegText = m.isVegetarian ? 'Món chay' : 'Món thường';
        const tags = (m.tags || []).join(' ');
        const cleanDesc = (m.description || '').replace(/"/g, '""').replace(/(\r\n|\n|\r)/gm, ' ');

        const row = [
          `"${m._id}"`,
          `"${(m.name || '').replace(/"/g, '""')}"`,
          `"${(restName || '').replace(/"/g, '""')}"`,
          m.price || 0,
          `"${inStockText}"`,
          `"${featuredText}"`,
          `"${vegText}"`,
          `"${tags.replace(/"/g, '""')}"`,
          `"${cleanDesc}"`
        ];

        csvRows.push(row.join(','));
      });

      const csvString = '\uFEFF' + csvRows.join('\r\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `GastroWise_Menu_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Không thể xuất file CSV.');
    } finally {
      setIsExporting(false);
    }
  };

  // Filtered Menu Items
  const filteredMenu = menuItems.filter((item) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(term) ||
      (item.description && item.description.toLowerCase().includes(term));
    
    // Restaurant filter
    let matchesRest = true;
    if (selectedRestaurantFilter !== 'all') {
      const restId = typeof item.restaurantId === 'object' ? item.restaurantId?._id : item.restaurantId;
      matchesRest = restId === selectedRestaurantFilter;
    }

    // Status filter (in stock / out of stock / featured)
    let matchesStatus = true;
    if (statusFilter === 'available') {
      matchesStatus = item.isAvailable !== false;
    } else if (statusFilter === 'unavailable') {
      matchesStatus = item.isAvailable === false;
    } else if (statusFilter === 'featured') {
      matchesStatus = Boolean(item.isFeatured);
    }

    // Diet filter
    let matchesDiet = true;
    if (dietFilter === 'veg') {
      matchesDiet = Boolean(item.isVegetarian);
    } else if (dietFilter === 'non-veg') {
      matchesDiet = !item.isVegetarian;
    }

    return matchesSearch && matchesRest && matchesStatus && matchesDiet;
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
    }, 1500);
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
        isAvailable: true,
        isFeatured: false,
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
      isAvailable: item.isAvailable !== false,
      isFeatured: !!item.isFeatured,
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
      isAvailable: true,
      isFeatured: false,
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
        isAvailable: formData.isAvailable,
        isFeatured: formData.isFeatured,
        image: formData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : ['Hot']
      };

      if (editingItem) {
        await apiClient.patch(`/restaurants/menu/${editingItem._id}`, payload);
        alert('Cập nhật món ăn thành công!');
      } else {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Utensils className="w-6 h-6 text-primary-600" /> Quản Lý Thực Đơn & Tình Trạng Món Ăn
            <span className="bg-primary-50 text-primary-700 text-xs px-2.5 py-1 rounded-full border border-primary-200 font-semibold">
              Còn/Hết món & Chef Pick
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý kho món ăn của đối tác nhà hàng, cập nhật tình trạng Còn/Hết món tức thì và nhận diện món bằng AI.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button 
            onClick={handleExportCSV}
            disabled={isExporting}
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-100"
            icon={<Download className="w-4 h-4 text-emerald-600" />}
          >
            Xuất CSV Thực Đơn
          </Button>
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
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên món ăn hoặc mô tả..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Restaurant Filter */}
          <div className="flex items-center gap-2">
            <Utensils className="h-4 w-4 text-slate-400" />
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

          {/* Status Filter (Available / Out of Stock / Featured) */}
          <div className="flex items-center gap-2">
            <Power className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="all">Tất cả Tình trạng</option>
              <option value="available">🟢 Còn món (Đang phục vụ)</option>
              <option value="unavailable">🔴 Tạm hết món</option>
              <option value="featured">⭐ Món đặc trưng (Chef's Pick)</option>
            </select>
          </div>

          {/* Diet Filter */}
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-slate-400" />
            <select
              value={dietFilter}
              onChange={(e) => setDietFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="all">Tất cả Khẩu vị</option>
              <option value="veg">🥗 Món chay</option>
              <option value="non-veg">🥩 Món thông thường</option>
            </select>
          </div>
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
          <h3 className="text-base font-bold text-slate-700">Chưa có món ăn nào khớp với bộ lọc</h3>
          <p className="text-xs text-slate-500 mt-1">Hãy thay đổi bộ lọc hoặc thêm món mới cho nhà hàng.</p>
        </div>
      ) : (
        /* Grid Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMenu.map((item) => {
            const restName = typeof item.restaurantId === 'object' ? item.restaurantId?.tenQuan : 'Nhà hàng GastroWise';
            const isItemAvailable = item.isAvailable !== false;
            const isItemFeatured = Boolean(item.isFeatured);
            const isRowBusy = actionLoadingId === item._id;

            return (
              <div 
                key={item._id} 
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden group hover:shadow-md transition-all flex flex-col justify-between ${
                  !isItemAvailable ? 'border-rose-200 bg-slate-50/50' : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Image Container */}
                  <div className="h-44 bg-slate-100 relative overflow-hidden">
                    <img 
                      src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'} 
                      alt={item.name}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                        !isItemAvailable ? 'grayscale opacity-60' : ''
                      }`}
                    />
                    
                    {/* Top Left Badges: Vegetarian & Chef's Special */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                      {isItemFeatured && (
                        <div className="bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                          <Star className="w-3 h-3 fill-white" /> Đặc trưng
                        </div>
                      )}
                      {item.isVegetarian && (
                        <div className="bg-emerald-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                          <Leaf className="w-3 h-3" /> Món chay
                        </div>
                      )}
                    </div>

                    {/* Action buttons on image hover */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenEdit(item)}
                        className="bg-white/90 p-1.5 rounded-lg shadow text-slate-600 hover:text-amber-600 hover:bg-white transition-colors"
                        title="Chỉnh sửa món"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item._id)}
                        className="bg-white/90 p-1.5 rounded-lg shadow text-slate-600 hover:text-rose-600 hover:bg-white transition-colors"
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
                    <h3 className="font-bold text-slate-900 line-clamp-1 flex items-center justify-between">
                      <span>{item.name}</span>
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 min-h-[2.25rem]">
                      {item.description || 'Chưa có mô tả món ăn...'}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-heading font-extrabold text-secondary-600 text-base">
                        {Number(item.price).toLocaleString('vi-VN')} đ
                      </span>
                      
                      {item.tags && item.tags.length > 0 && (
                        <Badge variant="default" className="text-[10px] bg-slate-100 text-slate-600 border-slate-200">
                          {item.tags[0]}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Status Control Strip */}
                <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Availability Toggle */}
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    disabled={isRowBusy}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                      isItemAvailable
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    }`}
                    title="Bấm để chuyển trạng thái Còn món / Tạm hết món"
                  >
                    <span className={`w-2 h-2 rounded-full ${isItemAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {isItemAvailable ? 'Còn món' : 'Tạm hết món'}
                  </button>

                  {/* Chef's Special Toggle */}
                  <button
                    onClick={() => handleToggleFeatured(item)}
                    disabled={isRowBusy}
                    className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                      isItemFeatured
                        ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                        : 'bg-white text-slate-400 border-slate-200 hover:text-amber-600 hover:border-amber-200'
                    }`}
                    title={isItemFeatured ? 'Bỏ nhãn Món đặc trưng' : 'Gán nhãn Món đặc trưng'}
                  >
                    <Star className={`w-3.5 h-3.5 ${isItemFeatured ? 'fill-amber-500 text-amber-500' : ''}`} />
                    <span className="text-[11px] hidden sm:inline">{isItemFeatured ? 'Đặc trưng' : 'Món thường'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Utensils className="w-5 h-5 text-primary-400" />
                {editingItem ? 'Chỉnh Sửa Món Ăn' : 'Thêm Món Ăn Mới Vào Thực Đơn'}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nhà hàng sở hữu *</label>
                <select
                  disabled={!!editingItem}
                  value={formData.restaurantId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, restaurantId: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  {restaurants.map((r) => (
                    <option key={r._id} value={r._id}>{r.tenQuan}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên món ăn *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: Bún chả Hà Nội đặc biệt" 
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500/20 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giá bán (VNĐ) *</label>
                  <input 
                    type="number" 
                    required
                    placeholder="65000" 
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thẻ phân loại (Tags)</label>
                  <input 
                    type="text" 
                    placeholder="Bán chạy, Món mới" 
                    value={formData.tags}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500/20 outline-none"
                  />
                </div>
              </div>

              {/* Status and Special Checkboxes */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isAvailable: e.target.checked }))}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-slate-800">🟢 Còn món (Sẵn sàng phục vụ khách hàng)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-slate-200/60">
                  <input 
                    type="checkbox" 
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-bold text-slate-800">⭐ Món đặc trưng của quán (Chef's Special Recommendation)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-slate-200/60">
                  <input 
                    type="checkbox" 
                    checked={formData.isVegetarian}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isVegetarian: e.target.checked }))}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="font-bold text-slate-800">🥗 Món chay (Dành cho người ăn chay / Thuần chay)</span>
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Hình ảnh món ăn</label>
                <input 
                  type="text" 
                  placeholder="https://images.unsplash.com/photo-..." 
                  value={formData.image}
                  onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả nguyên liệu & hương vị</label>
                <textarea 
                  rows={2}
                  placeholder="Mô tả tóm tắt món ăn..." 
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500/20 outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>Hủy</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : (editingItem ? 'Lưu Cập Nhật' : 'Tạo Món Ăn')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Food Recognition Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-indigo-900 text-white p-5 flex justify-between items-center">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> AI Food Vision & Auto-Catalog
              </h2>
              <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Gán vào nhà hàng đối tác *</label>
                <select
                  value={aiSelectedRestId}
                  onChange={(e) => setAiSelectedRestId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {restaurants.map((r) => (
                    <option key={r._id} value={r._id}>{r.tenQuan}</option>
                  ))}
                </select>
              </div>

              {/* Upload Dropzone Preview */}
              <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-6 text-center bg-indigo-50/40">
                <Camera className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
                <p className="font-bold text-indigo-950">Chụp hoặc Tải ảnh món ăn</p>
                <p className="text-[11px] text-slate-500 mt-0.5">AI sẽ tự động nhận diện món, đề xuất mức giá & sinh mô tả chuẩn SEO.</p>
                <div className="mt-4 flex justify-center">
                  <Button 
                    onClick={handleSimulateScan}
                    disabled={isScanning}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                    icon={isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
                  >
                    {isScanning ? 'AI Vision đang phân tích...' : 'Bắt đầu quét ảnh'}
                  </Button>
                </div>
              </div>

              {/* AI Detection Result */}
              {scanResult && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-2 animate-fade-in">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Nhận diện thành công: {scanResult.name}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed italic">
                    "{scanResult.description}"
                  </p>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-emerald-100">
                    <span className="text-slate-600">Giá đề xuất AI: <strong>{Number(scanResult.suggestedPrice).toLocaleString('vi-VN')} đ</strong></span>
                    <span className="bg-emerald-200/60 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">Độ tin cậy: 98%</span>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAiModal(false)}>Đóng</Button>
                {scanResult && (
                  <Button 
                    onClick={handleSaveAiItem}
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : 'Lưu món vào Menu'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

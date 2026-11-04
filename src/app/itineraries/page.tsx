'use client';

import React, { useState, useEffect } from 'react';
import {
  Route, Search, Filter, Eye, Trash2, Loader2, X,
  MapPin, Clock, User, Wallet, Share2, RefreshCw,
  CheckCircle2, XCircle, Leaf, Download,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { apiClient } from '@/shared/lib/axios';

interface ItineraryStop {
  stop_id?: string;
  restaurant_name: string;
  order_index: number;
  restaurant_lat?: number;
  restaurant_lng?: number;
}

interface ItineraryItem {
  _id: string;
  user_id?: { _id: string; username?: string; firstName?: string; lastName?: string; email?: string } | string;
  prompt?: string;
  title?: string;
  start_time?: string;
  end_time?: string;
  budget?: number;
  status?: string;
  stops?: ItineraryStop[];
  shareToken?: string;
  reminderEnabled?: boolean;
  co2SavedKg?: number;
  created_at?: string;
  createdAt?: string;
  confirmedAt?: string;
  confirmedBy?: any;
  cancelledAt?: string;
  cancelledBy?: any;
  completedAt?: string;
  completedBy?: any;
}

const STATUS_CFG: Record<string, { label: string; className: string }> = {
  generated: { label: '🤖 Đã tạo AI',     className: 'bg-blue-100 text-blue-700 border-blue-200' },
  confirmed: { label: '✅ Đã xác nhận',   className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  completed: { label: '🏁 Hoàn thành',    className: 'bg-slate-100 text-slate-700 border-slate-200' },
  cancelled: { label: '❌ Đã hủy',        className: 'bg-rose-100 text-rose-700 border-rose-200' },
  pending:   { label: '⏳ Chờ xử lý',    className: 'bg-amber-100 text-amber-700 border-amber-200' },
};

export default function ItinerariesPage() {
  const [itineraries, setItineraries] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<ItineraryItem | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = () => {
    try {
      setIsExporting(true);
      if (filtered.length === 0) {
        alert('Không có lộ trình nào để xuất báo cáo.');
        return;
      }

      const headers = [
        'Mã Lộ Trình',
        'Khách Hàng',
        'Tiêu Đề / Yêu Cầu',
        'Trạng Thái',
        'Ngân Sách (VNĐ)',
        'CO₂ Tiết Kiệm (kg)',
        'Số Điểm Dừng',
        'Danh Sách Quán Ăn',
        'Thời Gian Bắt Đầu',
        'Thời Gian Kết Thúc',
        'Ngày Tạo'
      ];

      const rows = [headers.join(',')];

      filtered.forEach((item) => {
        const title = getTitle(item).replace(/"/g, '""');
        const user = getUserName(item).replace(/"/g, '""');
        const status = STATUS_CFG[item.status || 'generated']?.label || item.status;
        const budget = item.budget || 0;
        const co2 = item.co2SavedKg ? Number(item.co2SavedKg).toFixed(1) : '0.0';
        const stopsCount = (item.stops || []).length;
        const stopsNames = (item.stops || []).map((s) => s.restaurant_name).join(' -> ').replace(/"/g, '""');
        const start = item.start_time || '';
        const end = item.end_time || '';
        const rawDate = item.created_at || item.createdAt;
        const created = rawDate ? new Date(rawDate).toLocaleString('vi-VN') : '';

        const row = [
          `"${item._id}"`,
          `"${user}"`,
          `"${title}"`,
          `"${status}"`,
          budget,
          co2,
          stopsCount,
          `"${stopsNames}"`,
          `"${start}"`,
          `"${end}"`,
          `"${created}"`
        ];

        rows.push(row.join(','));
      });

      const csvString = '\uFEFF' + rows.join('\r\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `GastroWise_Itineraries_${new Date().toISOString().slice(0, 10)}.csv`);
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

  const fetchItineraries = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/itineraries/all');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setItineraries(data);
    } catch (error) {
      console.warn('Lỗi tải itineraries:', error);
      setItineraries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItineraries(); }, []);

  const getUserName = (item: ItineraryItem) => {
    if (!item.user_id) return 'Khách ẩn danh';
    if (typeof item.user_id === 'string') return item.user_id;
    const u = item.user_id as any;
    return `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || u.email || 'User';
  };

  const getTitle = (item: ItineraryItem) =>
    item.title || (item.prompt ? item.prompt.slice(0, 55) + (item.prompt.length > 55 ? '...' : '') : `Lộ trình #${item._id.slice(-6)}`);

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa lộ trình này khỏi hệ thống?')) return;
    try {
      await apiClient.delete(`/itineraries/${id}`);
      setItineraries((prev) => prev.filter((i) => i._id !== id));
      setShowDetail(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      let actorId: string | undefined;
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const u = JSON.parse(storedUser);
          actorId = u._id || u.id;
        }
      } catch {}

      const res = await apiClient.patch(`/itineraries/${id}`, { status: newStatus, actorId });
      const updated = res.data;
      setItineraries((prev) => prev.map((i) => i._id === id ? { ...i, ...updated } : i));
      if (selected?._id === id) setSelected((p) => p ? { ...p, ...updated } : p);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const filtered = itineraries.filter((item) => {
    const matchSearch =
      searchQuery === '' ||
      getTitle(item).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getUserName(item).toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Stats
  const totalCo2 = itineraries.reduce((sum, i) => sum + (i.co2SavedKg || 0), 0);
  const totalBudget = itineraries.reduce((sum, i) => sum + (i.budget || 0), 0);
  const generatedCount = itineraries.filter(i => i.status === 'generated').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Route className="w-6 h-6 text-primary-600" /> Quản lý Lộ Trình AI (Itineraries)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Toàn bộ lộ trình ẩm thực được tạo bởi GastroWise AI — xem, duyệt và quản lý với Audit Trail.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button 
            onClick={handleExportCSV} 
            disabled={isExporting} 
            variant="outline" 
            className="border-slate-300 text-slate-700 hover:bg-slate-100"
            icon={<Download className="w-4 h-4 text-emerald-600" />}
          >
            Xuất Báo Cáo CSV
          </Button>
          <Button onClick={fetchItineraries} variant="outline" icon={<RefreshCw className="w-4 h-4" />}>
            Làm mới
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tổng lộ trình',     value: `${itineraries.length}`,           color: 'text-slate-700', bg: 'bg-slate-50',   border: 'border-slate-200'  },
          { label: '🤖 Vừa tạo AI',    value: `${generatedCount}`,               color: 'text-blue-700',  bg: 'bg-blue-50',    border: 'border-blue-200'   },
          { label: '🌱 CO₂ tiết kiệm', value: `${totalCo2.toFixed(1)} kg`,       color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          { label: '💰 Tổng ngân sách', value: `${(totalBudget/1000).toFixed(0)}K VNĐ`, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4`}>
            <p className="text-xs font-bold text-slate-500">{s.label}</p>
            <p className={`text-xl font-extrabold ${s.color} mt-1`}>{loading ? '–' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tiêu đề, người dùng..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="generated">🤖 Đã tạo AI</option>
            <option value="confirmed">✅ Đã xác nhận</option>
            <option value="completed">🏁 Hoàn thành</option>
            <option value="cancelled">❌ Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-2" />
            <p className="text-sm font-medium text-slate-500">Đang tải lộ trình AI...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Route className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">
              {itineraries.length === 0 ? 'Chưa có lộ trình nào được tạo' : 'Không tìm thấy kết quả'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Người dùng sẽ tạo lộ trình từ tính năng AI Itinerary.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Lộ trình</th>
                  <th className="px-6 py-4">Người dùng</th>
                  <th className="px-6 py-4">Điểm dừng</th>
                  <th className="px-6 py-4">Ngân sách</th>
                  <th className="px-6 py-4">CO₂</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const statusCfg = STATUS_CFG[item.status || 'generated'] || STATUS_CFG['generated'];
                  const createdAt = item.created_at || item.createdAt;
                  return (
                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">{getTitle(item)}</div>
                        {createdAt && (
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {new Date(createdAt).toLocaleDateString('vi-VN')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {getUserName(item).charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-slate-700 truncate max-w-[120px]">{getUserName(item)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {item.stops && item.stops.length > 0 ? (
                          <div className="space-y-0.5">
                            {item.stops.slice(0, 2).map((s, i) => (
                              <div key={i} className="text-xs text-slate-600 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-primary-400 shrink-0" />
                                <span className="truncate max-w-[140px]">{s.restaurant_name}</span>
                              </div>
                            ))}
                            {item.stops.length > 2 && (
                              <span className="text-xs text-slate-400">+{item.stops.length - 2} điểm nữa</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Không có</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.budget ? (
                          <span className="text-sm font-semibold text-slate-700">
                            {item.budget.toLocaleString('vi-VN')}đ
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.co2SavedKg ? (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            🌱 {item.co2SavedKg.toFixed(1)} kg
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusCfg.className}`}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setSelected(item); setShowDetail(true); }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {(item.status === 'generated' || item.status === 'pending') && (
                            <button
                              onClick={() => handleUpdateStatus(item._id, 'confirmed')}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Xác nhận"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xóa"
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
      </div>

      {/* Detail Modal */}
      {showDetail && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white p-5 flex justify-between items-center">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Route className="w-5 h-5 text-primary-400" /> Chi tiết Lộ trình AI
              </h2>
              <button onClick={() => setShowDetail(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-700 max-h-[70vh] overflow-y-auto">
              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Tiêu đề lộ trình</span>
                <p className="font-semibold text-slate-900 mt-0.5">{getTitle(selected)}</p>
              </div>
              {selected.prompt && (
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">Prompt AI</span>
                  <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm text-slate-700 mt-1 leading-relaxed italic">"{selected.prompt}"</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">Người dùng</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{getUserName(selected)}</p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">Ngân sách</span>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    {selected.budget ? `${selected.budget.toLocaleString('vi-VN')}đ` : 'Không xác định'}
                  </p>
                </div>
                {selected.start_time && (
                  <div>
                    <span className="text-xs font-bold uppercase text-slate-400">Giờ bắt đầu</span>
                    <p className="font-semibold text-slate-900 mt-0.5">{selected.start_time}</p>
                  </div>
                )}
                {selected.end_time && (
                  <div>
                    <span className="text-xs font-bold uppercase text-slate-400">Giờ kết thúc</span>
                    <p className="font-semibold text-slate-900 mt-0.5">{selected.end_time}</p>
                  </div>
                )}
              </div>

              {selected.co2SavedKg && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
                  <Leaf className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-700">CO₂ tiết kiệm được</p>
                    <p className="text-lg font-extrabold text-emerald-800">{selected.co2SavedKg.toFixed(2)} kg</p>
                  </div>
                </div>
              )}

              {selected.stops && selected.stops.length > 0 && (
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">Danh sách điểm dừng ({selected.stops.length})</span>
                  <div className="mt-2 space-y-2">
                    {selected.stops.map((s, i) => (
                      <div key={i} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                        <div>
                          <p className="font-semibold text-sm text-slate-900">{s.restaurant_name}</p>
                          {(s.restaurant_lat && s.restaurant_lng) && (
                            <p className="text-xs text-slate-400">{s.restaurant_lat.toFixed(4)}, {s.restaurant_lng.toFixed(4)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selected.shareToken && (
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">Share Token</span>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono truncate flex-1">{selected.shareToken}</code>
                    <Share2 className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                </div>
              )}

              {/* Audit Trail Timeline */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                <span className="font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary-500" /> Lịch sử Audit Trail
                </span>
                <div className="space-y-2 divide-y divide-slate-200/60 pt-1">
                  <div className="flex items-center justify-between text-slate-600 pt-1">
                    <span>🕒 Thời điểm tạo AI:</span>
                    <span className="font-semibold text-slate-800">
                      {(selected.created_at || selected.createdAt)
                        ? new Date(selected.created_at || selected.createdAt!).toLocaleString('vi-VN')
                        : '—'}
                    </span>
                  </div>
                  {selected.confirmedAt && (
                    <div className="flex items-center justify-between text-emerald-700 pt-1">
                      <span>✅ Đã xác nhận lúc:</span>
                      <span className="font-semibold">{new Date(selected.confirmedAt).toLocaleString('vi-VN')}</span>
                    </div>
                  )}
                  {selected.cancelledAt && (
                    <div className="flex items-center justify-between text-rose-700 pt-1">
                      <span>❌ Đã hủy lúc:</span>
                      <span className="font-semibold">{new Date(selected.cancelledAt).toLocaleString('vi-VN')}</span>
                    </div>
                  )}
                  {selected.completedAt && (
                    <div className="flex items-center justify-between text-blue-700 pt-1">
                      <span>🏁 Hoàn thành lúc:</span>
                      <span className="font-semibold">{new Date(selected.completedAt).toLocaleString('vi-VN')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowDetail(false)}>Đóng</Button>
                {(selected.status === 'generated' || selected.status === 'pending') && (
                  <Button disabled={isUpdating} className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleUpdateStatus(selected._id, 'confirmed')}>
                    ✅ Xác nhận
                  </Button>
                )}
                {selected.status !== 'cancelled' && (
                  <Button disabled={isUpdating} className="bg-rose-600 hover:bg-rose-700 text-white"
                    onClick={() => handleUpdateStatus(selected._id, 'cancelled')}>
                    Hủy lộ trình
                  </Button>
                )}
                <Button disabled={isUpdating} variant="outline" className="text-slate-600 border-slate-300"
                  onClick={() => handleDelete(selected._id)}>
                  Xóa
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

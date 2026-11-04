'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail, Search, Filter, Eye, Trash2, CheckCircle2, Loader2,
  X, Phone, MessageSquare, Tag, Clock, AlertCircle, RefreshCw,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { apiClient } from '@/shared/lib/axios';

interface ContactItem {
  _id: string;
  name: string;
  phone: string;
  email: string;
  topic: 'FEEDBACK' | 'MERCHANT' | 'COMPLAINT' | 'OTHER';
  message: string;
  aiClassification?: string;
  status?: string;
  createdAt?: string;
  processingAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

const TOPIC_CONFIG: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  FEEDBACK:  { label: 'Phản hồi',       color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',    emoji: '💬' },
  MERCHANT:  { label: 'Đăng ký quán',   color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', emoji: '🏪' },
  COMPLAINT: { label: 'Khiếu nại',      color: 'text-rose-700',   bg: 'bg-rose-50 border-rose-200',    emoji: '🚨' },
  OTHER:     { label: 'Khác',           color: 'text-slate-700',  bg: 'bg-slate-50 border-slate-200',   emoji: '📋' },
};

const STATUS_OPTIONS = ['CHỜ XỬ LÝ', 'ĐANG XỬ LÝ', 'ĐÃ GIẢI QUYẾT'];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState<ContactItem | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/contacts');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setContacts(data);
    } catch (error) {
      console.error('Lỗi khi tải contacts:', error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      let adminName: string | undefined;
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const u = JSON.parse(storedUser);
          adminName = u.fullName || u.username || u.email;
        }
      } catch {}

      const res = await apiClient.patch(`/contacts/${id}`, { status: newStatus, resolvedBy: adminName });
      const updated = res.data;
      setContacts((prev) => prev.map((c) => c._id === id ? { ...c, ...updated } : c));
      if (selectedContact?._id === id) {
        setSelectedContact((prev) => prev ? { ...prev, ...updated } : prev);
      }
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa liên hệ này khỏi hệ thống?')) return;
    try {
      await apiClient.delete(`/contacts/${id}`);
      setContacts((prev) => prev.filter((c) => c._id !== id));
      setShowDetail(false);
    } catch (error) {
      console.error('Lỗi xóa contact:', error);
    }
  };

  const filtered = contacts.filter((c) => {
    const matchSearch = searchQuery === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTopic = topicFilter === 'all' || c.topic === topicFilter;
    const matchStatus = statusFilter === 'all' || (c.status || 'CHỜ XỬ LÝ') === statusFilter;
    return matchSearch && matchTopic && matchStatus;
  });

  // Stats
  const complaintCount = contacts.filter(c => c.topic === 'COMPLAINT').length;
  const merchantCount = contacts.filter(c => c.topic === 'MERCHANT').length;
  const pendingCount = contacts.filter(c => !c.status || c.status === 'CHỜ XỬ LÝ').length;

  const getStatusBadge = (status?: string) => {
    const s = status || 'CHỜ XỬ LÝ';
    if (s === 'ĐÃ GIẢI QUYẾT') return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">✅ Đã giải quyết</span>;
    if (s === 'ĐANG XỬ LÝ')   return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">🔄 Đang xử lý</span>;
    return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">⏳ Chờ xử lý</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-6 h-6 text-primary-600" /> Quản lý Liên Hệ & Phản Ánh
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tiếp nhận và xử lý phản hồi từ người dùng, khiếu nại và đăng ký chủ quán kèm Audit Trail.
          </p>
        </div>
        <Button onClick={fetchContacts} variant="outline" icon={<RefreshCw className="w-4 h-4" />}>
          Làm mới
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tổng liên hệ',      value: contacts.length, color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' },
          { label: '🚨 Khiếu nại',      value: complaintCount,   color: 'text-rose-700',  bg: 'bg-rose-50',  border: 'border-rose-200' },
          { label: '🏪 Đăng ký quán',   value: merchantCount,    color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
          { label: '⏳ Chờ xử lý',      value: pendingCount,     color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4`}>
            <p className="text-xs font-bold text-slate-500">{s.label}</p>
            <p className={`text-2xl font-extrabold ${s.color} mt-1`}>{loading ? '–' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, email, nội dung..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="all">Tất cả chủ đề</option>
            <option value="FEEDBACK">💬 Phản hồi</option>
            <option value="MERCHANT">🏪 Đăng ký quán</option>
            <option value="COMPLAINT">🚨 Khiếu nại</option>
            <option value="OTHER">📋 Khác</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="CHỜ XỬ LÝ">⏳ Chờ xử lý</option>
            <option value="ĐANG XỬ LÝ">🔄 Đang xử lý</option>
            <option value="ĐÃ GIẢI QUYẾT">✅ Đã giải quyết</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-2" />
            <p className="text-sm font-medium text-slate-500">Đang tải danh sách liên hệ...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">
              {contacts.length === 0 ? 'Chưa có liên hệ nào' : 'Không tìm thấy kết quả'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Người gửi</th>
                  <th className="px-6 py-4">Chủ đề</th>
                  <th className="px-6 py-4 max-w-xs">Nội dung</th>
                  <th className="px-6 py-4">AI Phân loại</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => {
                  const topicCfg = TOPIC_CONFIG[c.topic] || TOPIC_CONFIG['OTHER'];
                  return (
                    <tr key={c._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{c.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{c.email}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {c.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${topicCfg.bg} ${topicCfg.color}`}>
                          {topicCfg.emoji} {topicCfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">"{c.message}"</p>
                      </td>
                      <td className="px-6 py-4">
                        {c.aiClassification && c.aiClassification !== 'Chờ phân tích' ? (
                          <span className="text-xs bg-purple-50 text-purple-700 font-medium px-2 py-0.5 rounded-full border border-purple-100">
                            🤖 {c.aiClassification}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Chưa phân loại</span>
                        )}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(c.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setSelectedContact(c); setShowDetail(true); }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {(!c.status || c.status === 'CHỜ XỬ LÝ') && (
                            <button
                              onClick={() => handleUpdateStatus(c._id, 'ĐÃ GIẢI QUYẾT')}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Đánh dấu đã giải quyết"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(c._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xóa liên hệ"
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
      {showDetail && selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white p-5 flex justify-between items-center">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary-400" /> Chi tiết Liên Hệ & Phản Ánh
              </h2>
              <button onClick={() => setShowDetail(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-700 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">Người gửi</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedContact.name}</p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">Email</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedContact.email}</p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">Số điện thoại</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedContact.phone}</p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">Chủ đề</span>
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${(TOPIC_CONFIG[selectedContact.topic] || TOPIC_CONFIG['OTHER']).bg} ${(TOPIC_CONFIG[selectedContact.topic] || TOPIC_CONFIG['OTHER']).color}`}>
                      {(TOPIC_CONFIG[selectedContact.topic] || TOPIC_CONFIG['OTHER']).emoji} {(TOPIC_CONFIG[selectedContact.topic] || TOPIC_CONFIG['OTHER']).label}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Nội dung</span>
                <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm text-slate-800 mt-1 leading-relaxed">
                  "{selectedContact.message}"
                </p>
              </div>

              {selectedContact.aiClassification && (
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">AI Phân loại</span>
                  <p className="font-semibold text-purple-700 mt-0.5">🤖 {selectedContact.aiClassification}</p>
                </div>
              )}

              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Trạng thái</span>
                <div className="mt-1">{getStatusBadge(selectedContact.status)}</div>
              </div>

              {/* Audit Trail Timeline */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                <span className="font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary-500" /> Lịch sử Xử lý (Audit Trail)
                </span>
                <div className="space-y-2 divide-y divide-slate-200/60 pt-1">
                  <div className="flex items-center justify-between text-slate-600 pt-1">
                    <span>🕒 Thời điểm gửi:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedContact.createdAt ? new Date(selectedContact.createdAt).toLocaleString('vi-VN') : '—'}
                    </span>
                  </div>
                  {selectedContact.processingAt && (
                    <div className="flex items-center justify-between text-blue-700 pt-1">
                      <span>🔄 Tiếp nhận xử lý lúc:</span>
                      <span className="font-semibold">{new Date(selectedContact.processingAt).toLocaleString('vi-VN')}</span>
                    </div>
                  )}
                  {selectedContact.resolvedAt && (
                    <div className="flex items-center justify-between text-emerald-700 pt-1">
                      <span>✅ Đã giải quyết lúc:</span>
                      <span className="font-semibold">{new Date(selectedContact.resolvedAt).toLocaleString('vi-VN')}</span>
                    </div>
                  )}
                  {selectedContact.resolvedBy && (
                    <div className="flex items-center justify-between text-indigo-700 pt-1">
                      <span>👤 Người xử lý:</span>
                      <span className="font-semibold">{selectedContact.resolvedBy}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowDetail(false)}>Đóng</Button>
                {(!selectedContact.status || selectedContact.status === 'CHỜ XỬ LÝ') && (
                  <Button
                    disabled={isUpdating}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => handleUpdateStatus(selectedContact._id, 'ĐANG XỬ LÝ')}
                  >
                    🔄 Đang xử lý
                  </Button>
                )}
                <Button
                  disabled={isUpdating}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleUpdateStatus(selectedContact._id, 'ĐÃ GIẢI QUYẾT')}
                >
                  ✅ Đã giải quyết
                </Button>
                <Button
                  disabled={isUpdating}
                  variant="outline"
                  className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  onClick={() => handleDelete(selectedContact._id)}
                >
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

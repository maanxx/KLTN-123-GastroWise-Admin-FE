'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Edit, Trash2, Shield, Lock, Unlock, Users, Eye, CheckCircle2, X, Loader2, Heart, Award } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { apiClient } from '@/shared/lib/axios';

interface UserItem {
  id?: string;
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin' | 'owner' | 'merchant';
  status: 'active' | 'banned';
  createdAt?: string;
  picture?: string;
  phone?: string;
  preferences?: string[];
  savedRestaurants?: any[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Detail / Edit Modal
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [newRole, setNewRole] = useState<'user' | 'admin' | 'owner'>('user');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Users from Backend API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/users', {
        params: { page, limit, search: searchQuery, role: roleFilter }
      });
      const data = res.data?.data || res.data || [];
      setUsers(Array.isArray(data) ? data : []);
      setTotalPages(res.data?.totalPages || 1);
      setTotalUsers(res.data?.total || data.length || 0);
    } catch (error) {
      console.error('Lỗi khi tải danh sách người dùng:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset to page 1 when search or role changes
    setPage(1);
  }, [searchQuery, roleFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, roleFilter, page, limit]);

  // Toggle Lock/Unlock Account
  const handleToggleStatus = async (user: UserItem) => {
    const targetStatus = user.status === 'banned' ? 'active' : 'banned';
    const actionText = targetStatus === 'banned' ? 'khóa' : 'mở khóa';
    if (!confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản của ${user.email}?`)) return;

    try {
      const id = user._id || user.id;
      await apiClient.patch(`/users/${id}`, { status: targetStatus });
      setUsers((prev) =>
        prev.map((u) => ((u._id || u.id) === id ? { ...u, status: targetStatus } : u))
      );
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
    }
  };

  // Submit Role Change
  const handleChangeRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setIsSubmitting(true);
      const id = selectedUser._id || selectedUser.id;
      await apiClient.patch(`/users/${id}`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => ((u._id || u.id) === id ? { ...u, role: newRole } : u))
      );
      setShowEditRoleModal(false);
    } catch (error) {
      console.error('Lỗi khi đổi role:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài khoản này vĩnh viễn?')) return;
    try {
      await apiClient.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => (u._id || u.id) !== id));
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="danger" className="bg-rose-500 text-white font-bold"><Shield className="w-3 h-3 mr-1 inline" /> Admin</Badge>;
      case 'owner':
      case 'merchant':
        return <Badge variant="info" className="bg-indigo-600 text-white font-bold">Chủ quán (Owner)</Badge>;
      case 'user':
        return <Badge variant="default" className="bg-slate-100 text-slate-700 font-medium">Người dùng</Badge>;
      default:
        return <Badge variant="default">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" className="bg-emerald-100 text-emerald-700 font-semibold border-emerald-200">Hoạt động</Badge>;
      case 'banned':
        return <Badge variant="danger" className="bg-rose-100 text-rose-700 font-semibold border-rose-200">Bị khóa</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary-600" /> Quản lý Người dùng & Phân quyền (CRM)
          </h1>
          <p className="text-sm text-slate-500 mt-1">Kiểm soát phân quyền hệ thống (Admin/Owner/User), xem sở thích khẩu vị và khóa/mở khóa tài khoản.</p>
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
            placeholder="Tìm theo tên, email, username..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="all">Tất cả Vai trò</option>
            <option value="user">Khách hàng (User)</option>
            <option value="owner">Chủ nhà hàng (Owner)</option>
            <option value="admin">Quản trị viên (Admin)</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-2" />
            <p className="text-sm font-medium text-slate-500">Đang đồng bộ dữ liệu tài khoản từ MongoDB...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Không tìm thấy tài khoản nào</h3>
            <p className="text-xs text-slate-500 mt-1">Thử thay đổi từ khóa hoặc bộ lọc vai trò.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Tài khoản & Email</th>
                  <th className="px-6 py-4">Vai trò (Role)</th>
                  <th className="px-6 py-4">Khẩu vị AI</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((row) => {
                  const userId = row._id || row.id || '';
                  const displayName = `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.username || 'User';
                  const avatarText = displayName.charAt(0).toUpperCase();

                  return (
                    <tr key={userId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {row.picture ? (
                            <img src={row.picture} alt={displayName} className="h-10 w-10 rounded-full object-cover shrink-0 border border-slate-200" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 font-extrabold flex items-center justify-center shrink-0 border border-primary-200">
                              {avatarText}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              {displayName}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">{row.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getRoleBadge(row.role)}
                      </td>
                      <td className="px-6 py-4">
                        {row.preferences && row.preferences.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {row.preferences.slice(0, 2).map((pref, i) => (
                              <span key={i} className="text-[11px] bg-indigo-50 text-indigo-700 font-medium px-2 py-0.5 rounded-full">
                                #{pref}
                              </span>
                            ))}
                            {row.preferences.length > 2 && (
                              <span className="text-[11px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                                +{row.preferences.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-italic">Chưa thiết lập</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(row.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => { setSelectedUser(row); setShowDetailModal(true); }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" 
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => { setSelectedUser(row); setNewRole(row.role as any); setShowEditRoleModal(true); }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
                            title="Đổi vai trò"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {row.status === 'banned' ? (
                            <button 
                              onClick={() => handleToggleStatus(row)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" 
                              title="Mở khóa tài khoản"
                            >
                              <Unlock className="h-4 w-4" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleToggleStatus(row)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                              title="Khóa tài khoản"
                            >
                              <Lock className="h-4 w-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteUser(userId)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                            title="Xóa tài khoản"
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
        {!loading && users.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
            <div className="text-sm text-slate-500">
              Hiển thị <span className="font-semibold text-slate-700">{users.length}</span> trong số <span className="font-semibold text-slate-700">{totalUsers}</span> người dùng
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

      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white p-6 relative">
              <button 
                onClick={() => setShowDetailModal(false)}
                className="absolute top-4 right-4 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4">
                {selectedUser.picture ? (
                  <img src={selectedUser.picture} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-indigo-500 text-white font-extrabold text-xl flex items-center justify-center border-2 border-white shadow-md">
                    {(selectedUser.firstName || selectedUser.username || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg leading-tight">
                    {`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() || selectedUser.username}
                  </h3>
                  <p className="text-xs text-indigo-200 mt-0.5">{selectedUser.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    {getRoleBadge(selectedUser.role)}
                    {getStatusBadge(selectedUser.status)}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 text-sm text-slate-700">
              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Username</span>
                <p className="font-semibold text-slate-900 mt-0.5">@{selectedUser.username}</p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Khẩu vị AI Preferences</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedUser.preferences && selectedUser.preferences.length > 0 ? (
                    selectedUser.preferences.map((p, i) => (
                      <span key={i} className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full border border-indigo-100">
                        ✨ {p}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">Người dùng chưa chọn khẩu vị cá nhân</p>
                  )}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500" /> Quán ăn đã lưu
                </span>
                <p className="text-sm font-semibold text-slate-900 mt-1">
                  {selectedUser.savedRestaurants?.length || 0} quán ăn trong bộ sưu tập
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button variant="outline" onClick={() => setShowDetailModal(false)}>Đóng</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditRoleModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" /> Cập nhật Vai trò (Role)
              </h2>
              <button onClick={() => setShowEditRoleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangeRoleSubmit} className="p-5 space-y-4">
              <p className="text-xs text-slate-500">
                Thay đổi quyền hạn cho tài khoản <b>{selectedUser.email}</b>:
              </p>

              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={newRole === 'user'}
                    onChange={() => setNewRole('user')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="font-bold text-sm text-slate-900">User (Khách hàng)</div>
                    <div className="text-xs text-slate-500">Quyền tìm kiếm, lưu quán và đánh giá</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="owner"
                    checked={newRole === 'owner' || newRole === ('merchant' as any)}
                    onChange={() => setNewRole('owner')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="font-bold text-sm text-indigo-700">Owner (Chủ nhà hàng)</div>
                    <div className="text-xs text-slate-500">Quyền quản lý thực đơn và xem thống kê quán</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={newRole === 'admin'}
                    onChange={() => setNewRole('admin')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="font-bold text-sm text-rose-600">Admin (Quản trị hệ thống)</div>
                    <div className="text-xs text-slate-500">Toàn quyền kiểm soát tài khoản và dữ liệu</div>
                  </div>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setShowEditRoleModal(false)}>Hủy</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lưu vai trò'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

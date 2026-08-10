import React from 'react';
import { Search, Filter, MoreVertical, Edit, Trash2, Shield, Lock, Unlock } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';

// Mock data
const mockUsers = [
  { id: '1', name: 'Trần Văn Sếp', email: 'admin@gastrowise.com', role: 'admin', status: 'active', created_at: '2024-01-01', avatar: 'A' },
  { id: '2', name: 'Nguyễn Văn Chủ', email: 'merchant@biendong.com', role: 'merchant', status: 'active', created_at: '2024-03-12', avatar: 'M' },
  { id: '3', name: 'Lê Khách Hàng', email: 'khachhang@gmail.com', role: 'user', status: 'active', created_at: '2024-03-15', avatar: 'K' },
  { id: '4', name: 'Spammer TQ', email: 'spam123@xyz.com', role: 'user', status: 'banned', created_at: '2024-03-19', avatar: 'S' },
];

const getRoleBadge = (role: string) => {
  switch(role) {
    case 'admin': return <Badge variant="danger"><Shield className="w-3 h-3 mr-1 inline" /> Admin</Badge>;
    case 'merchant': return <Badge variant="info">Merchant</Badge>;
    case 'user': return <Badge variant="default">User</Badge>;
    default: return <Badge>Unknown</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  switch(status) {
    case 'active': return <Badge variant="success">Hoạt động</Badge>;
    case 'banned': return <Badge variant="danger">Bị khóa</Badge>;
    default: return <Badge>Unknown</Badge>;
  }
};

export default function UsersPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Quản lý Tài khoản</h1>
          <p className="text-sm text-slate-500 mt-1">Kiểm soát quyền truy cập và trạng thái người dùng.</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm theo tên, email..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" icon={<Filter className="h-4 w-4" />}>
            Lọc Roles
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Tài khoản</th>
                <th className="px-6 py-4">Vai trò (Role)</th>
                <th className="px-6 py-4">Ngày đăng ký</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockUsers.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center shrink-0">
                        {row.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{row.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{row.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getRoleBadge(row.role)}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{row.created_at}</td>
                  <td className="px-6 py-4">
                    {getStatusBadge(row.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Chỉnh sửa quyền">
                        <Edit className="h-4 w-4" />
                      </button>
                      {row.status === 'banned' ? (
                        <button className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Mở khóa tài khoản">
                          <Unlock className="h-4 w-4" />
                        </button>
                      ) : (
                        <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Khóa tài khoản">
                          <Lock className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
          <div>Hiển thị 1 đến 4 trong số 4 tài khoản</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>Trước</Button>
            <Button variant="outline" size="sm" disabled>Tiếp</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

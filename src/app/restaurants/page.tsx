import React from 'react';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';

// Mock data (thay thế bằng API thật sau này)
const mockRestaurants = [
  { id: '1', name: 'Nhà hàng Biển Đông', cuisine: 'Hải sản', owner: 'Nguyen Van A', rating: 4.8, status: 'approved', created_at: '2024-03-12' },
  { id: '2', name: 'Phở Thìn Lò Đúc', cuisine: 'Món Việt', owner: 'Tran Thi B', rating: 4.5, status: 'approved', created_at: '2024-03-14' },
  { id: '3', name: 'Sushi Hokkaido', cuisine: 'Nhật Bản', owner: 'Le Van C', rating: 4.9, status: 'pending', created_at: '2024-03-15' },
  { id: '4', name: 'Gogi House', cuisine: 'Đồ nướng', owner: 'Golden Gate', rating: 4.2, status: 'rejected', created_at: '2024-03-16' },
  { id: '5', name: 'Highlands Coffee', cuisine: 'Cafe & Dessert', owner: 'Thai Corp', rating: 4.1, status: 'approved', created_at: '2024-03-18' },
];

const getStatusBadge = (status: string) => {
  switch(status) {
    case 'approved': return <Badge variant="success">Đã duyệt</Badge>;
    case 'pending': return <Badge variant="warning">Chờ duyệt</Badge>;
    case 'rejected': return <Badge variant="danger">Từ chối</Badge>;
    default: return <Badge>Unknown</Badge>;
  }
};

export default function RestaurantsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Quản lý Nhà hàng</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý và xét duyệt các đối tác nhà hàng trên hệ thống.</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />}>Thêm nhà hàng</Button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm theo tên quán, chủ sở hữu..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" icon={<Filter className="h-4 w-4" />}>
            Lọc trạng thái
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Nhà hàng</th>
                <th className="px-6 py-4">Phân loại</th>
                <th className="px-6 py-4">Chủ sở hữu</th>
                <th className="px-6 py-4">Đánh giá</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockRestaurants.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{row.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Tham gia: {row.created_at}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium">
                      {row.cuisine}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{row.owner}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <StarIcon rating={row.rating} />
                      {row.rating}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(row.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Xem chi tiết">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Chỉnh sửa">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Xóa">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
          <div>Hiển thị 1 đến 5 trong số 12 nhà hàng</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>Trước</Button>
            <Button variant="outline" size="sm">Tiếp</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StarIcon({ rating }: { rating: number }) {
  return (
    <svg className="w-4 h-4 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

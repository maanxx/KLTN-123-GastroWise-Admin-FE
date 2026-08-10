import React from 'react';
import { Users, Utensils, CalendarCheck, TrendingUp } from 'lucide-react';

const stats = [
  { name: 'Tổng người dùng', value: '12,450', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
  { name: 'Nhà hàng đối tác', value: '342', change: '+5%', icon: Utensils, color: 'text-primary-600', bg: 'bg-primary-100' },
  { name: 'Lượt đặt bàn (tháng)', value: '4,521', change: '+18%', icon: CalendarCheck, color: 'text-secondary-600', bg: 'bg-secondary-100' },
  { name: 'Doanh thu (tháng)', value: '1.2B VNĐ', change: '+24%', icon: TrendingUp, color: 'text-accent-600', bg: 'bg-accent-100' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-slate-900">Tổng quan hệ thống</h1>
        <div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200">
          Hôm nay: {new Date().toLocaleDateString('vi-VN')}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">{stat.name}</p>
              <h3 className="font-heading text-2xl font-bold text-slate-900 mt-2">{stat.value}</h3>
              <p className="text-sm font-medium text-primary-600 mt-2 flex items-center gap-1">
                {stat.change} so với tháng trước
              </p>
            </div>
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 min-h-[400px]">
          <h2 className="font-heading text-lg font-bold text-slate-900 mb-4">Biểu đồ Đặt bàn 7 ngày qua</h2>
          <div className="flex items-center justify-center h-64 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
            [ Recharts LineChart Placeholder ]
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 min-h-[400px]">
          <h2 className="font-heading text-lg font-bold text-slate-900 mb-4">Danh mục Ẩm thực nổi bật</h2>
          <div className="flex items-center justify-center h-64 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
            [ Recharts PieChart Placeholder ]
          </div>
        </div>
      </div>
    </div>
  );
}

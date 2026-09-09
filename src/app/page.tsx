'use client';

import React, { useState, useEffect } from 'react';
import { Users, Utensils, CalendarCheck, TrendingUp, Sparkles, ArrowUpRight, ShieldCheck, Clock } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { apiClient } from '@/shared/lib/axios';

// Dữ liệu biểu đồ Lượt tìm kiếm AI Itinerary & Đặt bàn
const activityChartData = [
  { day: 'Thứ 2', itn: 320, bookings: 120 },
  { day: 'Thứ 3', itn: 450, bookings: 190 },
  { day: 'Thứ 4', itn: 410, bookings: 160 },
  { day: 'Thứ 5', itn: 580, bookings: 240 },
  { day: 'Thứ 6', itn: 890, bookings: 420 },
  { day: 'Thứ 7', itn: 1240, bookings: 680 },
  { day: 'Chủ Nhật', itn: 1100, bookings: 590 },
];

// Dữ liệu biểu đồ Tỷ lệ Ẩm thực
const categoryPieData = [
  { name: 'Món Việt', value: 45, color: '#3b82f6' },
  { name: 'Lẩu & Nướng', value: 25, color: '#f59e0b' },
  { name: 'Cafe & Dessert', value: 15, color: '#10b981' },
  { name: 'Món Á - Âu', value: 10, color: '#8b5cf6' },
  { name: 'Ăn vặt & Khác', value: 5, color: '#ec4899' },
];

export default function DashboardPage() {
  const [totalRestaurants, setTotalRestaurants] = useState<number>(178);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await apiClient.get('/restaurants?limit=1');
        if (res.data && res.data.total) {
          setTotalRestaurants(res.data.total);
        }
      } catch (err) {
        console.log('Use default total restaurants');
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const stats = [
    { name: 'Tổng số nhà hàng (CMS)', value: totalRestaurants.toString(), change: '+15 quán mới', icon: Utensils, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Người dùng hệ thống (CRM)', value: '1,245', change: '+18% tháng này', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Lượt tạo Lộ trình AI', value: '4,521', change: '+28% lượt AI', icon: CalendarCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'Ước tính Doanh số (GMV)', value: '1.25B VNĐ', change: '+24% tăng trưởng', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> GastroWise Admin Engine 2.0
            </span>
          </div>
          <h1 className="font-heading text-2xl font-extrabold text-slate-900">
            Tổng Quan Hệ Thống 管理
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-400" />
            Hôm nay: {new Date().toLocaleDateString('vi-VN')}
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between transition-all hover:shadow-md">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.name}</p>
              <h3 className="font-heading text-3xl font-extrabold text-slate-900 mt-2">
                {isLoading ? '...' : stat.value}
              </h3>
              <p className="text-xs font-semibold text-emerald-600 mt-2 flex items-center gap-1">
                <ArrowUpRight className="h-3.5 w-3.5" /> {stat.change}
              </p>
            </div>
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} shadow-sm`}>
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Recharts Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Line / Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-900">
                Thống Kê Tương Tác AI & Đặt Bàn (7 Ngày Qua)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">So sánh lượt tạo Lộ trình AI và lượt chuyển đổi Đặt bàn</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorItn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBook" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none' }}
                  labelStyle={{ fontWeight: 'bold', color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="itn" name="Lượt tạo AI Itinerary" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorItn)" />
                <Area type="monotone" dataKey="bookings" name="Lượt đặt bàn" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorBook)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-heading text-lg font-bold text-slate-900 mb-1">
            Phân Bổ Danh Mục Ẩm Thực
          </h2>
          <p className="text-xs text-slate-500 mb-4">Tỷ lệ lượt tìm kiếm theo chủ đề</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none' }}
                  formatter={(val: any) => [`${val}%`, 'Tỷ lệ']}
                />
                <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

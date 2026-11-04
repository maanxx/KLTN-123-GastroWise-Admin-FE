'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, Utensils, CalendarCheck, TrendingUp, Sparkles, ArrowUpRight,
  Clock, MessageSquare, SmilePlus, Frown, Meh, Route, Heart, Star,
  Trophy, Award, MapPin, ChevronRight,
} from 'lucide-react';
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

const activityChartData = [
  { day: 'Thứ 2', itn: 320, bookings: 120 },
  { day: 'Thứ 3', itn: 450, bookings: 190 },
  { day: 'Thứ 4', itn: 410, bookings: 160 },
  { day: 'Thứ 5', itn: 580, bookings: 240 },
  { day: 'Thứ 6', itn: 890, bookings: 420 },
  { day: 'Thứ 7', itn: 1240, bookings: 680 },
  { day: 'CN', itn: 1100, bookings: 590 },
];

interface DashboardStats {
  totalRestaurants: number;
  totalUsers: number;
  totalReviews: number;
  totalItineraries: number;
  positiveReviews: number;
  negativeReviews: number;
  neutralReviews: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRestaurants: 178,
    totalUsers: 0,
    totalReviews: 0,
    totalItineraries: 0,
    positiveReviews: 0,
    negativeReviews: 0,
    neutralReviews: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [topFavorites, setTopFavorites] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAllStats() {
      try {
        setIsLoading(true);

        const [restaurantsRes, usersRes, reviewsRes, itinerariesRes, favoritesRes, reviewStatsRes] = await Promise.allSettled([
          apiClient.get('/restaurants', { params: { limit: 1 } }),
          apiClient.get('/users', { params: { limit: 5 } }),
          apiClient.get('/reviews/all', { params: { limit: 5 } }),
          apiClient.get('/itineraries/all'),
          apiClient.get('/favorites/top', { params: { limit: 5 } }),
          apiClient.get('/reviews/stats'),
        ]);

        const newStats = { ...stats };

        if (restaurantsRes.status === 'fulfilled') {
          newStats.totalRestaurants = restaurantsRes.value.data?.total || restaurantsRes.value.data?.length || 178;
        }
        if (usersRes.status === 'fulfilled') {
          const d = usersRes.value.data;
          newStats.totalUsers = d?.total || d?.totalUsers || (Array.isArray(d?.data) ? d.data.length : 0);
          setRecentUsers(d?.data || []);
        }
        if (reviewsRes.status === 'fulfilled') {
          const d = reviewsRes.value.data;
          newStats.totalReviews = d?.total || (Array.isArray(d?.data) ? d.total : 0);
          const reviews: any[] = d?.data || [];
          setRecentReviews(reviews.slice(0, 5));
        }
        if (reviewStatsRes.status === 'fulfilled' && reviewStatsRes.value.data) {
          const s = reviewStatsRes.value.data;
          newStats.totalReviews = s.totalReviews || newStats.totalReviews;
          newStats.positiveReviews = s.positiveCount || 0;
          newStats.negativeReviews = s.negativeCount || 0;
          newStats.neutralReviews = s.neutralCount || 0;
        }
        if (itinerariesRes.status === 'fulfilled') {
          const d = itinerariesRes.value.data;
          newStats.totalItineraries = Array.isArray(d) ? d.length : (d?.total || 0);
        }
        if (favoritesRes.status === 'fulfilled') {
          const d = favoritesRes.value.data;
          setTopFavorites(Array.isArray(d) ? d : []);
        }

        setStats(newStats);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAllStats();
  }, []);

  const sentimentPieData = [
    { name: `Tích cực 😊 (${stats.positiveReviews})`, value: stats.positiveReviews || 1, color: '#10b981' },
    { name: `Trung tính 😐 (${stats.neutralReviews})`, value: stats.neutralReviews || 1, color: '#f59e0b' },
    { name: `Tiêu cực 😡 (${stats.negativeReviews})`, value: stats.negativeReviews || 1, color: '#ef4444' },
  ];

  const statCards = [
    {
      name: 'Nhà hàng (CMS)',
      value: stats.totalRestaurants,
      change: 'Đang hoạt động',
      icon: Utensils,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      name: 'Người dùng (CRM)',
      value: stats.totalUsers,
      change: 'Tổng tài khoản',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      name: 'Đánh giá (Reviews)',
      value: stats.totalReviews,
      change: `${stats.positiveReviews} tích cực / ${stats.negativeReviews} tiêu cực`,
      icon: MessageSquare,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
    {
      name: 'Lộ trình AI (Itineraries)',
      value: stats.totalItineraries,
      change: 'Tạo bởi AI Engine',
      icon: Route,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
    },
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
            {!isLoading && (
              <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 font-semibold px-2.5 py-0.5 rounded-full">
                ● Live Data
              </span>
            )}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className={`bg-white p-6 rounded-2xl border shadow-sm flex items-start justify-between transition-all hover:shadow-md ${stat.border}`}
          >
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.name}</p>
              <h3 className="font-heading text-3xl font-extrabold text-slate-900 mt-2">
                {isLoading ? (
                  <span className="inline-block w-16 h-8 bg-slate-100 animate-pulse rounded-lg" />
                ) : (
                  stat.value.toLocaleString('vi-VN')
                )}
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

      {/* Sentiment AI Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-xl">
            <SmilePlus className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase">AI Sentiment Tích cực</p>
            <p className="text-2xl font-extrabold text-emerald-700">{isLoading ? '...' : stats.positiveReviews}</p>
            <p className="text-xs text-emerald-500">reviews trong 5 gần nhất</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-xl">
            <Meh className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase">AI Sentiment Trung tính</p>
            <p className="text-2xl font-extrabold text-amber-700">{isLoading ? '...' : stats.neutralReviews}</p>
            <p className="text-xs text-amber-500">reviews trong 5 gần nhất</p>
          </div>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="bg-rose-100 p-3 rounded-xl">
            <Frown className="h-6 w-6 text-rose-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-rose-600 uppercase">AI Sentiment Tiêu cực</p>
            <p className="text-2xl font-extrabold text-rose-700">{isLoading ? '...' : stats.negativeReviews}</p>
            <p className="text-xs text-rose-500">cần kiểm duyệt ngay</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-900">
                Thống Kê Tương Tác AI & Đặt Bàn (7 Ngày Qua)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">So sánh lượt tạo lộ trình AI và lượt chuyển đổi đặt bàn</p>
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

        {/* Sentiment Pie Chart - Real Data */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-heading text-lg font-bold text-slate-900 mb-1">
            Phân Tích AI Sentiment
          </h2>
          <p className="text-xs text-slate-500 mb-4">Tỷ lệ cảm xúc từ reviews gần nhất</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sentimentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none' }}
                  formatter={(val: any) => [`${val} review`, '']}
                />
                <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TOP FAVORITED RESTAURANTS SECTION (Nghiệp vụ 1) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-rose-100 text-rose-700 p-1.5 rounded-xl">
                <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
              </span>
              <h2 className="font-heading text-lg font-bold text-slate-900">
                Top Quán Ăn Được Yêu Thích Nhất (Community Favorites)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Thống kê thời gian thực từ thao tác lưu quán (Heart Bookmark) của khách hàng trên Web & Mobile
            </p>
          </div>
          <a
            href="/restaurants"
            className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 hover:underline shrink-0"
          >
            Quản lý tất cả quán ăn <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {topFavorites.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400">
            Chưa có dữ liệu yêu thích.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topFavorites.map((item, idx) => {
              const rank = idx + 1;
              const rankBadge =
                rank === 1
                  ? { bg: 'bg-amber-400 text-amber-950 shadow-amber-200', label: '🥇 Top 1' }
                  : rank === 2
                  ? { bg: 'bg-slate-300 text-slate-800 shadow-slate-200', label: '🥈 Top 2' }
                  : rank === 3
                  ? { bg: 'bg-amber-600 text-white shadow-amber-300', label: '🥉 Top 3' }
                  : { bg: 'bg-slate-100 text-slate-600', label: `#${rank}` };

              const placeholderImg = `https://picsum.photos/seed/${item._id}/400/250`;
              const imageSrc = item.avatarUrl || placeholderImg;

              return (
                <div
                  key={item._id}
                  className="group relative bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-4 transition-all hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    {/* Rank & Heart Count Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-black px-2.5 py-0.5 rounded-full shadow-sm ${rankBadge.bg}`}>
                        {rankBadge.label}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-extrabold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                        <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                        {item.count} lượt lưu
                      </span>
                    </div>

                    {/* Image & Name */}
                    <div className="flex items-center gap-3">
                      <img
                        src={imageSrc}
                        alt={item.tenQuan}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-slate-900 truncate group-hover:text-primary-600 transition-colors">
                          {item.tenQuan}
                        </h4>
                        <div className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{item.diaChi || 'TP. Hồ Chí Minh'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mt-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{Number(item.diemTrungBinh || 5).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {item.tags && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap gap-1">
                      {item.tags.split(',').slice(0, 2).map((t: string, i: number) => (
                        <span key={i} className="text-[10px] font-medium text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reviews */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-heading font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary-600" /> Đánh giá Gần nhất
            </h3>
            <a href="/reviews" className="text-xs text-primary-600 font-semibold hover:underline">Xem tất cả →</a>
          </div>
          <div className="divide-y divide-slate-50">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-6 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-slate-100 rounded animate-pulse w-3/4" />
                    <div className="h-2.5 bg-slate-100 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))
            ) : recentReviews.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-slate-400">Chưa có đánh giá nào</div>
            ) : (
              recentReviews.map((r) => {
                const lbl = (r.aiSentimentLabel || '').toUpperCase();
                const isPos = lbl.includes('POS') || lbl === 'POSITIVE' || lbl === 'LABEL_2';
                const isNeg = lbl.includes('NEG') || lbl === 'NEGATIVE' || lbl === 'LABEL_0';
                return (
                  <div key={r._id} className="px-6 py-3 flex items-start gap-3 hover:bg-slate-50/50">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs shrink-0">
                      {(r.tenNguoiDung || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 truncate">{r.tenNguoiDung || 'Khách hàng'}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isPos ? 'bg-emerald-100 text-emerald-700' : isNeg ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                          {isPos ? '😊' : isNeg ? '😡' : '😐'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">"{r.noiDung}"</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-heading font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" /> Người dùng Mới nhất
            </h3>
            <a href="/users" className="text-xs text-primary-600 font-semibold hover:underline">Quản lý →</a>
          </div>
          <div className="divide-y divide-slate-50">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-6 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-slate-100 rounded animate-pulse w-3/4" />
                    <div className="h-2.5 bg-slate-100 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))
            ) : recentUsers.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-slate-400">Chưa có người dùng nào</div>
            ) : (
              recentUsers.map((u) => {
                const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'User';
                return (
                  <div key={u._id || u.id} className="px-6 py-3 flex items-center gap-3 hover:bg-slate-50/50">
                    {u.picture ? (
                      <img src={u.picture} alt={name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-slate-900 truncate">{name}</div>
                      <div className="text-xs text-slate-500 truncate">{u.email}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      u.role === 'admin' ? 'bg-rose-100 text-rose-700' :
                      u.role === 'owner' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

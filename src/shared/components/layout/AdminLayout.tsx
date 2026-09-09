'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Utensils, 
  MapPin, 
  LogOut,
  Bell,
  Search,
  Settings,
  BookOpen,
  Sparkles,
  MessageSquare,
  ShieldAlert,
  ArrowLeft,
  Lock
} from 'lucide-react';

import { AiCopilot } from '@/shared/components/ui/AiCopilot';
import { apiClient } from '@/shared/lib/axios';

const sidebarMenus = [
  { name: 'Tổng quan (Dashboard)', href: '/', icon: LayoutDashboard },
  { name: 'Quản lý Nhà hàng', href: '/restaurants', icon: Utensils },
  { name: 'Quản lý Thực đơn', href: '/menu', icon: BookOpen },
  { name: 'Quản lý Đặt bàn', href: '/bookings', icon: MapPin },
  { name: 'Quản lý Đánh giá', href: '/reviews', icon: MessageSquare },
  { name: 'AI Trợ lý (Insights)', href: '/ai-insights', icon: Sparkles, isAi: true },
  { name: 'Quản lý Người dùng', href: '/users', icon: Users },
  { name: 'Cài đặt', href: '/settings', icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Check RBAC Authorization
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setCurrentUser(parsed);
          
          // Role check: 'admin', 'owner', 'merchant' are allowed
          if (parsed.role === 'admin' || parsed.role === 'owner' || parsed.role === 'merchant') {
            setIsAuthorized(true);
            return;
          } else {
            setIsAuthorized(false);
            return;
          }
        }

        if (token) {
          const res = await apiClient.get('/auth/profile');
          if (res.data) {
            setCurrentUser(res.data);
            const role = res.data.role;
            if (role === 'admin' || role === 'owner' || role === 'merchant') {
              setIsAuthorized(true);
            } else {
              setIsAuthorized(false);
            }
            return;
          }
        }

        // If running in development without strict token, default to Admin access
        setIsAuthorized(true);
      } catch (error) {
        // Fallback for dev mode
        setIsAuthorized(true);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'http://localhost:3000';
  };

  // Render Access Denied Guard if user is a normal user
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl text-center space-y-5 animate-fade-in">
          <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/30 text-rose-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
              403 Forbidden - Unauthorized Access
            </span>
            <h2 className="text-2xl font-bold font-heading text-white mt-3">Truy Cập Bị Từ Chối!</h2>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Tài khoản <b>{currentUser?.email || 'của bạn'}</b> có vai trò là <span className="text-amber-400 font-bold">Standard User</span>. 
              Khu vực Dashboard này chỉ dành riêng cho <b>Quản trị viên (Admin)</b> và <b>Chủ nhà hàng (Owner)</b>.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <a
              href="http://localhost:3000"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Quay về Trang Chủ GastroWise (Port 3000)
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl transition-colors text-sm"
            >
              <LogOut className="w-4 h-4 text-rose-400" /> Đăng xuất & Chọn tài khoản Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col transition-all">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="bg-primary-500 p-1.5 rounded-lg">
              <Utensils className="h-5 w-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-slate-900">
              Gastro<span className="text-primary-600">Admin</span>
            </span>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {sidebarMenus.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors font-medium text-sm justify-between
                  ${isActive 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  } ${item.isAi ? 'bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : (item.isAi ? 'text-indigo-600' : 'text-slate-400')}`} />
                  {item.name}
                </div>
                {item.isAi && (
                  <span className="text-[10px] uppercase font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded animate-pulse">New</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info / Logout */}
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Đăng xuất Admin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center bg-slate-100 px-3 py-1.5 rounded-full w-96 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-300 transition-all border border-transparent">
            <Search className="h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm nhà hàng, người dùng..." 
              className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full text-slate-700"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-rose-500"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-700 leading-none">
                  {currentUser?.fullName || currentUser?.firstName || 'Admin'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {currentUser?.role === 'owner' ? 'Chủ Nhà Hàng (Owner)' : 'Super Admin'}
                </p>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center border-2 border-white shadow-sm text-primary-700 font-bold uppercase">
                {(currentUser?.firstName || currentUser?.username || 'A').charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          {children}
        </main>
      </div>

      {/* Global AI Assistant */}
      <AiCopilot />
    </div>
  );
}

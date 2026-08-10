'use client';

import React from 'react';
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
  Sparkles
} from 'lucide-react';

import { AiCopilot } from '@/shared/components/ui/AiCopilot';

const sidebarMenus = [
  { name: 'Tổng quan (Dashboard)', href: '/', icon: LayoutDashboard },
  { name: 'Quản lý Nhà hàng', href: '/restaurants', icon: Utensils },
  { name: 'Quản lý Thực đơn', href: '/menu', icon: BookOpen },
  { name: 'Quản lý Đặt bàn', href: '/bookings', icon: MapPin },
  { name: 'AI Trợ lý (Insights)', href: '/ai-insights', icon: Sparkles, isAi: true },
  { name: 'Quản lý Người dùng', href: '/users', icon: Users },
  { name: 'Cài đặt', href: '/settings', icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
          <button className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 rounded-xl hover:bg-rose-50 transition-colors">
            <LogOut className="h-5 w-5" />
            Đăng xuất
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
                <p className="text-sm font-bold text-slate-700 leading-none">Admin</p>
                <p className="text-xs text-slate-500 mt-1">Super Admin</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center border-2 border-white shadow-sm text-primary-700 font-bold">
                A
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

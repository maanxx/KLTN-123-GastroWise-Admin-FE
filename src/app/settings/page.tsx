'use client';

import React, { useState } from 'react';
import { Store, Settings, Upload, Save, Bell, Shield, Key } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'system'>('profile');

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-slate-900">Cài đặt Hệ thống</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý thông tin nhà hàng và cấu hình bảo mật.</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'profile' 
              ? 'border-primary-500 text-primary-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Store className="w-4 h-4" />
          Thông tin Quán (Profile)
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'system' 
              ? 'border-primary-500 text-primary-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Settings className="w-4 h-4" />
          Hệ thống & Bảo mật
        </button>
      </div>

      {/* Tab Content: Profile */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-fade-in">
          {/* Cover Image */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Ảnh bìa (Cover Image)</h3>
            <div className="h-48 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer group">
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-primary-500 transition-colors mb-2" />
              <p className="font-medium text-sm">Nhấn để tải ảnh lên Cloudinary</p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG (Tối đa 2MB)</p>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Thông tin Cơ bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Tên quán ăn / Nhà hàng</label>
                <input 
                  type="text" 
                  defaultValue="Nhà hàng Biển Đông"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Chuyên mục (Cuisine)</label>
                <select className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors bg-white">
                  <option>Hải sản</option>
                  <option>Đồ nướng</option>
                  <option>Lẩu</option>
                  <option>Món Việt</option>
                </select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Địa chỉ</label>
                <input 
                  type="text" 
                  defaultValue="12 Nguyễn Trãi, Quận 1, TP.HCM"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Giờ mở cửa</label>
                <input 
                  type="time" 
                  defaultValue="08:00"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Giờ đóng cửa</label>
                <input 
                  type="time" 
                  defaultValue="22:30"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button icon={<Save className="w-4 h-4" />}>Lưu thông tin</Button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: System */}
      {activeTab === 'system' && (
        <div className="space-y-6 animate-fade-in">
          {/* Notifications */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900">Cấu hình Thông báo</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <div>
                  <h4 className="font-medium text-slate-800">Email khi có Đơn đặt bàn mới</h4>
                  <p className="text-sm text-slate-500">Gửi email về hòm thư admin@gastrowise.com</p>
                </div>
                <ToggleSwitch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <div>
                  <h4 className="font-medium text-slate-800">Cảnh báo Đánh giá Tiêu cực (AI)</h4>
                  <p className="text-sm text-slate-500">Nhận cảnh báo đỏ nếu AI phát hiện review xấu.</p>
                </div>
                <ToggleSwitch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <h4 className="font-medium text-slate-800">Cập nhật Tính năng mới</h4>
                  <p className="text-sm text-slate-500">Nhận bản tin cập nhật nền tảng GastroWise.</p>
                </div>
                <ToggleSwitch />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-rose-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-rose-100 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="font-bold text-slate-900">Bảo mật</h3>
            </div>
            
            <div className="space-y-4 max-w-sm">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Mật khẩu hiện tại</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Mật khẩu mới</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <Button variant="danger" className="w-full mt-2" icon={<Key className="w-4 h-4" />}>
                Đổi mật khẩu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Mini Component: Toggle Switch
function ToggleSwitch({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  
  return (
    <button
      onClick={() => setChecked(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
        checked ? 'bg-primary-500' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

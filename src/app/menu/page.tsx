'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Sparkles, X, Camera, Scan, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

// Mock data
const mockMenu = [
  { id: '1', name: 'Combo Hải sản nướng', price: '450.000đ', category: 'Combo', status: 'available', image: 'https://via.placeholder.com/150' },
  { id: '2', name: 'Lẩu Thái Tomyum', price: '250.000đ', category: 'Lẩu', status: 'available', image: 'https://via.placeholder.com/150' },
  { id: '3', name: 'Salad Cá ngừ', price: '85.000đ', category: 'Khai vị', status: 'out_of_stock', image: 'https://via.placeholder.com/150' },
  { id: '4', name: 'Nước ép Cam', price: '45.000đ', category: 'Đồ uống', status: 'available', image: 'https://via.placeholder.com/150' },
  { id: '5', name: 'Bò lúc lắc', price: '120.000đ', category: 'Món chính', status: 'available', image: 'https://via.placeholder.com/150' },
  { id: '6', name: 'Súp cua', price: '50.000đ', category: 'Khai vị', status: 'out_of_stock', image: 'https://via.placeholder.com/150' },
];

export default function MenuPage() {
  const [showAiModal, setShowAiModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const handleSimulateScan = () => {
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        name: 'Sườn nướng tảng xốt BBQ',
        description: 'Miếng sườn heo nguyên tảng được tẩm ướp xốt BBQ độc quyền 12 tiếng, nướng than hoa mềm mọng bên trong, cháy xém bên ngoài.',
        suggestedPrice: '185.000đ',
        category: 'Món chính'
      });
    }, 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Quản lý Thực đơn</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý danh sách món ăn, giá cả và trạng thái của nhà hàng.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setShowAiModal(true)}
            variant="ghost" 
            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200" 
            icon={<Sparkles className="w-4 h-4 text-indigo-500" />}
          >
            Tạo món bằng AI
          </Button>
          <Button icon={<Plus className="h-4 w-4" />}>Thêm món thủ công</Button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm món ăn..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" icon={<Filter className="h-4 w-4" />}>
            Lọc Danh mục
          </Button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockMenu.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            {/* Image Placeholder */}
            <div className="h-48 bg-slate-100 relative">
              <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
                <span className="text-slate-400 font-medium">Image</span>
              </div>
              {item.status === 'out_of_stock' && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="bg-rose-500 text-white font-bold px-3 py-1 rounded-full text-sm shadow-lg transform -rotate-12">Hết hàng</span>
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="bg-white p-1.5 rounded-md shadow-sm text-slate-500 hover:text-blue-600 transition-colors">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="bg-white p-1.5 rounded-md shadow-sm text-slate-500 hover:text-rose-600 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className={`font-bold ${item.status === 'out_of_stock' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                    {item.name}
                  </h3>
                  <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-0.5 rounded mt-1 inline-block">
                    {item.category}
                  </span>
                </div>
                <div className="font-heading font-bold text-secondary-600">
                  {item.price}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Trạng thái</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={item.status === 'available'} readOnly />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Generator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white flex justify-between items-start shrink-0 relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10">
                <Sparkles className="w-48 h-48 animate-pulse" />
              </div>
              <div className="relative z-10">
                <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="w-6 h-6" /> AI Menu Generator
                </h2>
                <p className="text-indigo-100 mt-1">Tải ảnh lên, AI sẽ tự động viết mô tả và gợi ý giá bán cạnh tranh.</p>
              </div>
              <button onClick={() => setShowAiModal(false)} className="relative z-10 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {!scanResult ? (
                <div className="space-y-6">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/50 p-10 flex flex-col items-center justify-center text-center hover:bg-indigo-50 transition-colors cursor-pointer relative overflow-hidden">
                    {isScanning && (
                      <div className="absolute inset-0 bg-indigo-500/10 z-10">
                        <div className="w-full h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] absolute top-0 animate-[scan_2s_ease-in-out_infinite]" style={{ animation: 'scan 2s ease-in-out infinite alternate' }} />
                      </div>
                    )}
                    
                    <div className={`p-4 bg-white rounded-full shadow-sm mb-4 relative z-20 ${isScanning ? 'animate-pulse text-indigo-500' : 'text-slate-400'}`}>
                      {isScanning ? <Scan className="w-10 h-10" /> : <Camera className="w-10 h-10" />}
                    </div>
                    <h3 className="font-bold text-slate-900 z-20">{isScanning ? 'AI Đang phân tích hình ảnh...' : 'Tải hình ảnh món ăn lên'}</h3>
                    <p className="text-sm text-slate-500 mt-1 z-20">Hỗ trợ JPG, PNG (Tối đa 5MB)</p>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button onClick={handleSimulateScan} disabled={isScanning} className="bg-indigo-600 hover:bg-indigo-700">
                      {isScanning ? 'Đang xử lý...' : 'Upload & Chạy AI'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg font-medium text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    AI đã phân tích thành công hình ảnh của bạn!
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Tên món ăn (AI Gợi ý)</label>
                        <input type="text" defaultValue={scanResult.name} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Mức giá đề xuất</label>
                        <input type="text" defaultValue={scanResult.suggestedPrice} className="w-full px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg font-heading font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors" />
                        <p className="text-xs text-slate-500">Dựa trên giá trung bình của các món Sườn nướng khu vực Quận 1.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Mô tả hấp dẫn (Copywriting)</label>
                      <textarea 
                        defaultValue={scanResult.description}
                        rows={5}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {scanResult && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 shrink-0">
                <Button variant="outline" onClick={() => setScanResult(null)}>Quét lại ảnh khác</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700">Lưu vào Thực đơn</Button>
              </div>
            )}
            
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes scan {
                0% { top: 0; }
                100% { top: 100%; }
              }
            `}} />
          </div>
        </div>
      )}
    </div>
  );
}

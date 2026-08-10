'use client';

import React, { useState } from 'react';
import { CalendarClock, Clock, CheckCircle2, User, Phone, MapPin } from 'lucide-react';

type BookingStatus = 'pending' | 'confirmed' | 'completed';

interface Booking {
  id: string;
  customerName: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  status: BookingStatus;
  note?: string;
}

const initialBookings: Booking[] = [
  { id: 'B001', customerName: 'Nguyễn Văn A', phone: '0901234567', date: '12/03/2024', time: '18:30', guests: 4, status: 'pending', note: 'Kỷ niệm ngày cưới' },
  { id: 'B002', customerName: 'Trần Thị B', phone: '0912345678', date: '12/03/2024', time: '19:00', guests: 2, status: 'pending' },
  { id: 'B003', customerName: 'Lê Văn C', phone: '0987654321', date: '12/03/2024', time: '12:00', guests: 10, status: 'confirmed', note: 'Đặt bàn VIP' },
  { id: 'B004', customerName: 'Phạm D', phone: '0977777777', date: '12/03/2024', time: '11:30', guests: 3, status: 'completed' },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('bookingId', id);
  };

  const onDrop = (e: React.DragEvent, status: BookingStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('bookingId');
    setBookings((prev) => 
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const renderColumn = (title: string, status: BookingStatus, icon: React.ReactNode, bgColor: string, borderColor: string) => {
    const columnBookings = bookings.filter((b) => b.status === status);
    
    return (
      <div 
        className={`flex-1 min-w-[300px] flex flex-col bg-slate-50/50 rounded-2xl border border-slate-200 p-4 transition-colors`}
        onDrop={(e) => onDrop(e, status)}
        onDragOver={onDragOver}
      >
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-heading font-bold text-slate-800">{title}</h3>
          </div>
          <span className="bg-white text-slate-500 px-2 py-0.5 rounded-md text-xs font-bold border border-slate-200 shadow-sm">
            {columnBookings.length}
          </span>
        </div>
        
        <div className="flex-1 space-y-3 overflow-y-auto">
          {columnBookings.map((booking) => (
            <div 
              key={booking.id}
              draggable
              onDragStart={(e) => onDragStart(e, booking.id)}
              className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${borderColor} cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-slate-900">{booking.customerName}</div>
                <div className="text-xs font-bold text-slate-400">#{booking.id}</div>
              </div>
              
              <div className="space-y-1.5 mb-3">
                <div className="flex items-center text-xs text-slate-500 gap-2">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {booking.phone}
                </div>
                <div className="flex items-center text-xs text-slate-500 gap-2 font-medium">
                  <CalendarClock className="w-3 h-3 text-primary-500" />
                  {booking.time} - {booking.date}
                </div>
                <div className="flex items-center text-xs text-slate-500 gap-2">
                  <User className="w-3 h-3 text-secondary-500" />
                  {booking.guests} khách
                </div>
              </div>

              {booking.note && (
                <div className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1.5 rounded-lg border border-amber-100 italic">
                  "{booking.note}"
                </div>
              )}
            </div>
          ))}

          {columnBookings.length === 0 && (
            <div className="h-24 flex items-center justify-center text-sm text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
              Kéo thả vào đây
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-slate-900">Quản lý Đặt bàn (Kanban)</h1>
        <p className="text-sm text-slate-500 mt-1">Kéo thả để cập nhật trạng thái đơn đặt bàn của khách.</p>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {renderColumn(
          'Chờ xác nhận', 
          'pending', 
          <Clock className="w-5 h-5 text-amber-500" />,
          'bg-slate-50',
          'border-amber-400'
        )}
        {renderColumn(
          'Đã nhận bàn', 
          'confirmed', 
          <MapPin className="w-5 h-5 text-primary-500" />,
          'bg-slate-50',
          'border-primary-400'
        )}
        {renderColumn(
          'Hoàn thành', 
          'completed', 
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
          'bg-slate-50',
          'border-emerald-500'
        )}
      </div>
    </div>
  );
}

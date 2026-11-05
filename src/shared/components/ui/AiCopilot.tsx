'use client';

import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, BarChart2, MapPin, Star } from 'lucide-react';
import { restaurantClient } from '@/shared/lib/axios';

interface RestaurantSnippet {
  _id?: string;
  id?: string;
  tenQuan?: string;
  name?: string;
  diaChi?: string;
  diemTrungBinh?: number;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  isWidget?: boolean;
  items?: RestaurantSnippet[];
}

export function AiCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'ai', text: 'Chào Admin! Tôi là Trợ lý AI GastroWise. Bạn cần tôi tra cứu nhà hàng, gợi ý thực đơn hay hỗ trợ thông tin gì hôm nay?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isTyping) return;

    const newMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await restaurantClient.post('/restaurants/chat', { message: text });
      const reply = response.data?.reply || 'Tôi đã xử lý yêu cầu của bạn.';
      const dataList: RestaurantSnippet[] = response.data?.data || [];

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: reply,
          items: dataList.slice(0, 3),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `GastroWise Copilot đã ghi nhận câu hỏi "${text}". Hệ thống đang phân tích và hỗ trợ các truy vấn về nhà hàng, ẩm thực, lộ trình ẩm thực theo thời gian thực.`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 w-96 h-[520px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right z-50 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">GastroWise Copilot</h3>
              <p className="text-xs text-indigo-100">Trợ lý AI Quản trị viên</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-primary-100 text-primary-700' : 'bg-indigo-100 text-indigo-700'}`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'}`}>
                <p>{msg.text}</p>
                {msg.items && msg.items.length > 0 && (
                  <div className="mt-2.5 space-y-2 border-t border-slate-100 pt-2">
                    {msg.items.map((item, idx) => (
                      <div key={item._id || item.id || idx} className="rounded-xl bg-slate-50 p-2 border border-slate-100 text-slate-700">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span className="truncate">{item.tenQuan || item.name}</span>
                          {item.diemTrungBinh && (
                            <span className="flex items-center gap-0.5 text-[11px] text-amber-600">
                              <Star className="w-3 h-3 fill-amber-500" />
                              {Number(item.diemTrungBinh).toFixed(1)}
                            </span>
                          )}
                        </div>
                        {item.diaChi && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{item.diaChi}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {msg.isWidget && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-2">
                    <BarChart2 className="w-8 h-8 text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-600">[Biểu đồ Thống kê]</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2.5 flex-row">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          <form onSubmit={handleSend} className="flex items-center gap-2 relative">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Hỏi AI về quán lẩu, món chay, phở ngon..." 
              className="w-full bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-full pl-4 pr-12 py-2.5 text-xs transition-all"
            />
            <button 
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="absolute right-1.5 p-1.5 bg-indigo-600 text-white rounded-full disabled:opacity-50 hover:bg-indigo-700 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

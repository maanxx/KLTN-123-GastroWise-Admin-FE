'use client';

import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, BarChart2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  isWidget?: boolean;
}

export function AiCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'ai', text: 'Chào Admin! Tôi là Trợ lý AI GastroWise. Bạn cần tôi phân tích dữ liệu gì hôm nay?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: inputText };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI Response with Widget
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev, 
        { id: Date.now().toString(), sender: 'ai', text: 'Đây là thống kê doanh thu tuần qua theo yêu cầu của bạn:', isWidget: true }
      ]);
    }, 1500);
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
        className={`fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right z-50 ${
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
              <p className="text-xs text-indigo-100">Sẵn sàng phân tích dữ liệu</p>
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
            <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-primary-100 text-primary-700' : 'bg-indigo-100 text-indigo-700'}`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${msg.sender === 'user' ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'}`}>
                <p>{msg.text}</p>
                {msg.isWidget && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-2">
                    <BarChart2 className="w-8 h-8 text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-600">[Biểu đồ Doanh thu]</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3 flex-row">
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
              placeholder="Hỏi AI về doanh thu, khách hàng..." 
              className="w-full bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-full pl-4 pr-12 py-2.5 text-sm transition-all"
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
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

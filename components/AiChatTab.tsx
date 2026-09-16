import React, { useState } from 'react';
import { User } from '../types';
import { t } from '../services/translations';

interface AiChatTabProps {
  user: User;
  lang: 'uz' | 'ru' | 'en';
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AiChatTab: React.FC<AiChatTabProps> = ({ user, lang }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Assalomu alaykum, ${user.displayName || user.username}! Men sizning shaxsiy Life Engine AI yordamchingizman. Bugun qaysi maqsadingiz yoki vazifangiz bo'yicha reja tuzamiz?`,
      timestamp: 'Hozir'
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const quickPrompts = [
    '30 kunlik ertalab 06:00 da turish rejasi',
    'Kunlik vaqtni to\'g\'ri taqsimlash (Time blocking)',
    'Moliyaviy tejash va xarajatlarni qisqartirish yo\'llari',
    'Chalg\'imasdan 4 soat Deep Work qilish usullari'
  ];

  const handleSend = (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim()) return;

    const userMsg: Message = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: q,
      timestamp: 'Hozir'
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let aiReply = '';
      if (q.includes('06:00') || q.includes('uyqu')) {
        aiReply = "Ertalab 06:00 da tetik uyg'onish uchun eng asosiy qoida — kechasi soat 22:30 yoki 23:00 dan kechikmasdan yotishdir. Dastlabki 7 kunda uyqudan 1 soat oldin telefon va ekranlarni chetga suring, xonani shamollating va ertalab darhol bir stakan iliq suv iching!";
      } else if (q.includes('moliya') || q.includes('tejash')) {
        aiReply = "Moliyaviy intizom uchun 50/30/20 qoidasini qo'llashni tavsiya qilaman: 50% asosiy ehtiyojlar uchun, 30% shaxsiy xohishlar uchun va 20% majburiy jamg'arma yoki investitsiyaga ajratiladi. Life Engine 'Moliya' bo'limida har bir xarajatni qayd etib boring!";
      } else {
        aiReply = `Ajoyib savol! Ushbu maqsadga erishish uchun birinchi navbatda har kuni kichik qadamlar bilan boshlash lozim. Life Engine tizimida ushbu rejangizni yangi vazifa sifatida qo'shib, 30 kunlik matritsa orqali kuzatib borishni tavsiya etaman.`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: 'ai_' + Date.now(),
          sender: 'ai',
          text: aiReply,
          timestamp: 'Hozir'
        }
      ]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="max-w-3xl mx-auto animate-slide-up space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">
            Gemini AI Engine
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black">
          Aqlli Samaradorlik Yordamchisi
        </h2>
        <p className="text-xs text-indigo-200 mt-1 max-w-md">
          Kunlik rejalar, odatlarni shakllantirish va maqsadlarni tahlil qilishda yordam beradi.
        </p>
      </div>

      {/* Quick Prompts */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0 hover:border-indigo-500 active:scale-95 transition-all shadow-sm"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-xl min-h-[380px] max-h-[500px] overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl text-xs md:text-sm font-medium leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl rounded-bl-none text-xs text-slate-400 font-bold flex items-center gap-2">
              <i className="fas fa-circle-notch animate-spin"></i>
              <span>AI javob tayyorlamoqda...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t(lang, 'ai_prompt_placeholder')}
          className="flex-1 px-6 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none text-xs md:text-sm font-bold text-slate-900 dark:text-white focus:border-indigo-500 shadow-md"
        />
        <button
          type="submit"
          className="px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
        >
          <i className="fas fa-paper-plane mr-2"></i>
          <span>Yuborish</span>
        </button>
      </form>
    </div>
  );
};

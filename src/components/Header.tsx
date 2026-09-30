import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  Globe,
  Wallet,
  Wifi,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { Language } from '../types/pos';

export const Header: React.FC = () => {
  const {
    settings,
    language,
    setLanguage,
    t,
    currentShift,
    cart,
    clearCart,
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-[#160e08] border-b border-[#362111] px-5 flex items-center justify-between select-none z-20 shrink-0 font-['Cairo',sans-serif]">
      {/* System status & Clock */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#22150b] border border-[#3e2614] text-xs">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold text-emerald-400">وضع العمل المباشر (Online)</span>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#22150b] border border-[#3e2614] text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold text-white tracking-widest">{currentTime}</span>
        </div>
      </div>

      {/* Middle side: Active register shift status */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#22150b] border border-[#3e2614] text-xs">
          <Wallet className="w-4 h-4 text-amber-400" />
          <div>
            <span className="text-stone-400">رصيد الصندوق: </span>
            <span className="font-black text-amber-400">
              {currentShift ? `${currentShift.expectedCash} ${settings.currency}` : 'الوردية مفتوحة'}
            </span>
          </div>
          {currentShift && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          )}
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-800/40 text-xs font-bold text-red-300 hover:bg-red-900/40 hover:text-white transition"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>طلب جديد (تفريغ السلة)</span>
          </button>
        )}
      </div>

      {/* Language Switcher */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center bg-[#22150b] p-1 rounded-xl border border-[#3e2614]">
          <Globe className="w-3.5 h-3.5 text-amber-400 mx-1.5" />
          {(['ar', 'fr', 'en'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-2.5 py-1 text-xs font-black rounded-lg transition ${
                language === lang
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-white hover:bg-[#2d1c0f]'
              }`}
            >
              {lang === 'ar' ? 'العربية 🇩🇿' : lang === 'fr' ? 'FR 🇫🇷' : 'EN 🇬🇧'}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

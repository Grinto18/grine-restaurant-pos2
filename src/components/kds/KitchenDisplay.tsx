import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ChefHat,
  Clock,
  CheckCircle,
  Play,
  Flame,
  Printer,
  BellRing,
  Filter,
  CheckCircle2,
  UtensilsCrossed,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/pos';
import { PrintService } from '../../services/printService';

export const KitchenDisplay: React.FC = () => {
  const { orders, updateOrderStatus, settings, t } = useApp();
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Ticking timer every 5 seconds to update waiting minutes
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  const getElapsedTimeMinutes = (createdAt: string) => {
    const start = new Date(createdAt).getTime();
    const diff = Math.max(0, currentTime - start);
    return Math.floor(diff / 60000);
  };

  const getUrgencyBadge = (minutes: number) => {
    if (minutes >= 20) {
      return {
        bg: 'bg-red-600 text-white animate-pulse',
        label: `${minutes} د (تأخير !)`,
      };
    }
    if (minutes >= 10) {
      return {
        bg: 'bg-amber-500 text-black font-black',
        label: `${minutes} د`,
      };
    }
    return {
      bg: 'bg-emerald-600 text-white',
      label: `${minutes} د`,
    };
  };

  const handlePrintKOT = (order: Order) => {
    PrintService.printKitchenTicket(order, settings);
  };

  // Group orders into 4 Kanban stages:
  const newOrders = orders.filter((o) => o.status === 'pending');
  const preparingOrders = orders.filter((o) => o.status === 'cooking');
  const readyOrders = orders.filter((o) => o.status === 'ready');
  const servedOrders = orders.filter((o) => o.status === 'served');

  const renderOrderCard = (order: Order) => {
    const minutes = getElapsedTimeMinutes(order.createdAt);
    const urgency = getUrgencyBadge(minutes);

    return (
      <div
        key={order.id}
        className="p-3.5 rounded-2xl bg-[#1c1209] border border-[#3e2715] shadow-lg flex flex-col justify-between space-y-3 text-right hover:border-amber-500/60 transition"
      >
        {/* Card Header: Order #, Table, Timer */}
        <div>
          <div className="flex items-center justify-between border-b border-[#311e11] pb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-8 h-8 rounded-xl bg-[#2e1d10] border border-[#4a301a] font-mono font-black text-amber-400 text-xs flex items-center justify-center">
                #{order.orderNumber.slice(-3)}
              </span>
              <div>
                <div className="font-black text-sm text-white leading-tight">
                  {order.tableName ? `طاولة: ${order.tableName}` : 'طلب سفري'}
                </div>
                <div className="text-[10px] text-stone-400">
                  {order.type === 'dine_in' ? 'محلي (Sur place)' : 'سفري (Emporter)'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black font-mono ${urgency.bg}`}>
                {urgency.label}
              </span>
              <button
                onClick={() => handlePrintKOT(order)}
                className="p-1 rounded-lg bg-[#2e1d10] text-stone-400 hover:text-white hover:bg-amber-600 transition"
                title="طباعة تذكرة المطبخ KOT"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="pt-2 space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="bg-[#24170d] p-2 rounded-xl border border-[#362111]">
                <div className="flex justify-between items-baseline">
                  <span className="font-black text-xs text-white">
                    {item.productNameAr || item.productName}
                  </span>
                  <span className="w-6 h-6 rounded-lg bg-amber-500 text-[#120a05] font-black text-xs flex items-center justify-center font-mono shrink-0">
                    x{item.quantity}
                  </span>
                </div>

                {/* Variant & Addons */}
                {(item.variantName || (item.addons && item.addons.length > 0)) && (
                  <div className="flex flex-wrap items-center gap-1 mt-1 text-[10px] text-amber-300">
                    {item.variantName && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-600/60 font-bold">
                        حجم {item.variantName}
                      </span>
                    )}
                    {item.addons?.map((a, i) => (
                      <span key={i} className="text-stone-300 font-medium">
                        + {a}
                      </span>
                    ))}
                  </div>
                )}

                {item.note && (
                  <div className="text-[10px] text-red-300 bg-red-950/50 p-1 rounded-md mt-1 font-bold">
                    ⚠️ ملاحظة: {item.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Advance Buttons */}
        <div className="pt-2 border-t border-[#311e11]">
          {order.status === 'pending' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'cooking')}
              className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/60 transition"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>بدء التحضير (PREPARING)</span>
            </button>
          )}

          {order.status === 'cooking' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'ready')}
              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/60 transition"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>جاهز للتقديم (READY)</span>
            </button>
          )}

          {order.status === 'ready' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'served')}
              className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-950/60 transition"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>تسليم الطلب (SERVED)</span>
            </button>
          )}

          {order.status === 'served' && (
            <div className="text-center text-[10px] font-bold text-stone-400 py-1">
              ✓ تم تسليم الطلب للزبون
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#120a05] text-[#fef3c7] overflow-hidden p-5 select-none font-['Cairo',sans-serif]">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#362111] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xl shadow-lg shadow-amber-950/40">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#fffdfa] flex items-center gap-2">
              <span>شاشة المطبخ الذكية (KDS)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-600 text-white font-extrabold">
                {newOrders.length + preparingOrders.length + readyOrders.length} طلب نشط
              </span>
            </h2>
            <p className="text-xs text-amber-200/70">
              تنظيم سير العمل بين الكاشير والمطبخ عبر أربع مراحل واضحة وسريعة
            </p>
          </div>
        </div>

        {/* Realtime Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#22150b] border border-[#3e2715] text-xs font-bold text-emerald-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>تحديث مباشر متزامن</span>
        </div>
      </div>

      {/* 4-Columns KDS Kanban: NEW | PREPARING | READY | SERVED */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden pt-4 min-h-0">
        {/* 1. NEW (جديد) */}
        <div className="bg-[#180f08] border border-[#362111] rounded-2xl flex flex-col overflow-hidden">
          <div className="p-3 bg-[#24170d] border-b border-[#362111] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="font-black text-xs text-white">1. NEW (طلب جديد)</span>
            </div>
            <span className="text-xs font-mono font-black px-2 py-0.5 rounded-full bg-blue-600 text-white">
              {newOrders.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {newOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-stone-500 text-xs">
                لا توجد طلبات جديدة
              </div>
            ) : (
              newOrders.map((order) => renderOrderCard(order))
            )}
          </div>
        </div>

        {/* 2. PREPARING (قيد التحضير) */}
        <div className="bg-[#180f08] border border-[#362111] rounded-2xl flex flex-col overflow-hidden">
          <div className="p-3 bg-[#24170d] border-b border-[#362111] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="font-black text-xs text-white">2. PREPARING (تحضير)</span>
            </div>
            <span className="text-xs font-mono font-black px-2 py-0.5 rounded-full bg-amber-600 text-white">
              {preparingOrders.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {preparingOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-stone-500 text-xs">
                لا توجد طلبات على النار
              </div>
            ) : (
              preparingOrders.map((order) => renderOrderCard(order))
            )}
          </div>
        </div>

        {/* 3. READY (جاهز للتقديم) */}
        <div className="bg-[#180f08] border border-[#362111] rounded-2xl flex flex-col overflow-hidden">
          <div className="p-3 bg-[#24170d] border-b border-[#362111] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-black text-xs text-white">3. READY (جاهز)</span>
            </div>
            <span className="text-xs font-mono font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white">
              {readyOrders.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {readyOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-stone-500 text-xs">
                لا توجد طلبات جاهزة للتسليم
              </div>
            ) : (
              readyOrders.map((order) => renderOrderCard(order))
            )}
          </div>
        </div>

        {/* 4. SERVED (تم التقديم) */}
        <div className="bg-[#180f08] border border-[#362111] rounded-2xl flex flex-col overflow-hidden">
          <div className="p-3 bg-[#24170d] border-b border-[#362111] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-500"></span>
              <span className="font-black text-xs text-white">4. SERVED (تم التقديم)</span>
            </div>
            <span className="text-xs font-mono font-black px-2 py-0.5 rounded-full bg-stone-700 text-white">
              {servedOrders.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {servedOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-stone-500 text-xs">
                سجل الطلبات المسلمة فارغ
              </div>
            ) : (
              servedOrders.slice(0, 10).map((order) => renderOrderCard(order))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

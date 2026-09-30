import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Receipt,
  Search,
  Printer,
  Eye,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  Filter,
  DollarSign,
  UtensilsCrossed,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/pos';
import { PrintService } from '../../services/printService';

export const OrdersView: React.FC = () => {
  const { orders, settings, t, setLastCompletedOrder, setIsReceiptModalOpen } = useApp();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      order.orderNumber.toLowerCase().includes(q) ||
      (order.tableName && order.tableName.toLowerCase().includes(q)) ||
      (order.cashierName && order.cashierName.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return {
          bg: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80',
          label: 'مدفوع / مكتمل',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case 'cooking':
        return {
          bg: 'bg-amber-950/70 text-amber-300 border-amber-800/80',
          label: 'قيد التحضير بالمطبخ',
          icon: <ChefHat className="w-3.5 h-3.5 text-amber-400" />,
        };
      case 'ready':
        return {
          bg: 'bg-emerald-950/70 text-emerald-300 border-emerald-700/80 animate-pulse',
          label: 'جاهز للتقديم',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />,
        };
      case 'pending':
        return {
          bg: 'bg-blue-950/70 text-blue-300 border-blue-800/80',
          label: 'طلب جديد',
          icon: <Clock className="w-3.5 h-3.5 text-blue-400" />,
        };
      case 'served':
        return {
          bg: 'bg-cyan-950/70 text-cyan-300 border-cyan-800/80',
          label: 'تم التقديم للزبون',
          icon: <UtensilsCrossed className="w-3.5 h-3.5 text-cyan-400" />,
        };
      case 'cancelled':
        return {
          bg: 'bg-red-950/70 text-red-300 border-red-800/80',
          label: 'ملغي',
          icon: <AlertCircle className="w-3.5 h-3.5 text-red-400" />,
        };
      default:
        return {
          bg: 'bg-stone-900 text-stone-300 border-stone-800',
          label: status,
          icon: null,
        };
    }
  };

  const handlePrint = (order: Order) => {
    PrintService.printReceipt(order, settings);
  };

  const handlePreviewReceipt = (order: Order) => {
    setLastCompletedOrder(order);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#120a05] text-[#fef3c7] overflow-hidden p-5 select-none font-['Cairo',sans-serif]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#3b2514] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shadow-lg shadow-amber-950/40">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#fffdfa] flex items-center gap-2">
              <span>سجل الطلبات والمبيعات</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-600 text-white font-extrabold">
                {orders.length} طلب
              </span>
            </h2>
            <p className="text-xs text-amber-200/70">
              متابعة جميع طلبات الكاشير، الطاولات، وحالات الدفع وطباعة الفواتير
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-400/60" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث برقم الطلب، الطاولة أو الكاشير..."
              className="w-full pr-10 pl-3 py-2 bg-[#1c1209] border border-[#422915] rounded-xl text-white placeholder-stone-500 text-xs focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#1c1209] p-1 rounded-xl border border-[#422915]">
            <Filter className="w-3.5 h-3.5 text-amber-400 mx-2" />
            {[
              { id: 'all', label: 'الكل' },
              { id: 'paid', label: 'المدفوعة' },
              { id: 'cooking', label: 'بالمطبخ' },
              { id: 'ready', label: 'جاهزة' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  filterStatus === tab.id
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-stone-400 hover:text-white hover:bg-[#2e1d10]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Orders list & detail */}
      <div className="flex-1 flex gap-5 overflow-hidden pt-4 min-h-0">
        {/* Orders Table */}
        <div className="flex-1 bg-[#1a1008] border border-[#3b2514] rounded-2xl overflow-hidden flex flex-col">
          <div className="p-3 bg-[#24170d] border-b border-[#3b2514] flex items-center justify-between text-xs font-bold text-amber-300/80">
            <span>قائمة الفواتير والطلبات ({filteredOrders.length})</span>
            <span>الترتيب: من الأحدث للأقدم</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-[#2e1d10]">
            {filteredOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-stone-500 space-y-2">
                <Receipt className="w-12 h-12 text-stone-700" />
                <p className="text-sm font-bold">لا توجد طلبات مطابقة</p>
                <p className="text-xs text-stone-600">سيتم ظهور أي طلب جديد يتم إنشاؤه في شاشة POS هنا فوراً</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const badge = getStatusBadge(order.status);
                const isSelected = selectedOrder?.id === order.id;
                const date = new Date(order.createdAt);
                const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-3.5 flex items-center justify-between gap-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-950/40 border-r-4 border-amber-500'
                        : 'hover:bg-[#24170d]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#2e1d10] border border-[#4a301a] flex items-center justify-center font-mono font-black text-amber-400 text-xs shrink-0">
                        #{order.orderNumber.slice(-4)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#fffdfa] truncate">
                            {order.tableName ? `طاولة: ${order.tableName}` : 'طلب سفري (Emporter)'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${badge.bg}`}
                          >
                            {badge.icon}
                            <span>{badge.label}</span>
                          </span>
                        </div>

                        <div className="text-xs text-stone-400 flex items-center gap-2 mt-0.5">
                          <span>{timeStr}</span>
                          <span>•</span>
                          <span>{order.items.length} أصناف</span>
                          <span>•</span>
                          <span className="text-stone-300 font-medium">الكاشير: {order.cashierName || 'Karim'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-left font-mono">
                        <div className="text-base font-black text-amber-400">
                          {order.total} <span className="text-xs font-bold text-amber-300">{settings.currency}</span>
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {order.paymentMethod === 'card'
                            ? 'CIB / الذهبية'
                            : order.paymentMethod === 'other'
                            ? 'بريدي موب / تحويل'
                            : 'نقدًا'}
                        </div>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewReceipt(order);
                          }}
                          className="p-2 rounded-xl bg-[#2e1d10] text-amber-300 hover:bg-amber-600 hover:text-white transition"
                          title="معاينة الوصل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrint(order);
                          }}
                          className="p-2 rounded-xl bg-amber-600 text-white hover:bg-amber-500 shadow-md shadow-amber-900/30 transition"
                          title="طباعة حرارية 80mm"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Order Details Panel (Side preview) */}
        {selectedOrder ? (
          <div className="w-80 bg-[#1a1008] border border-[#3b2514] rounded-2xl flex flex-col overflow-hidden shrink-0">
            <div className="p-4 bg-[#24170d] border-b border-[#3b2514] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-400">تفاصيل الفاتورة</span>
                <h3 className="text-base font-black text-white">#{selectedOrder.orderNumber}</h3>
              </div>
              <button
                onClick={() => handlePrint(selectedOrder)}
                className="py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar text-xs">
              <div className="p-3 rounded-xl bg-[#26180c] border border-[#422915] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-400">نوع الطلب:</span>
                  <span className="font-bold text-white">
                    {selectedOrder.type === 'dine_in' ? 'محلي (Sur place)' : 'سفري (Emporter)'}
                  </span>
                </div>
                {selectedOrder.tableName && (
                  <div className="flex justify-between">
                    <span className="text-stone-400">الطاولة:</span>
                    <span className="font-bold text-amber-400">{selectedOrder.tableName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-400">الوقت:</span>
                  <span className="text-stone-300 font-mono">
                    {new Date(selectedOrder.createdAt).toLocaleTimeString('fr-FR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">الكاشير:</span>
                  <span className="text-stone-300 font-bold">{selectedOrder.cashierName || 'Karim Grine'}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1.5">
                <div className="font-bold text-stone-300 text-[11px] uppercase tracking-wider mb-1">
                  المنتجات المشمولة ({selectedOrder.items.length})
                </div>
                {selectedOrder.items.map((it, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-[#24170d] border border-[#3b2514] flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-white">
                        {it.productNameAr || it.productName}{' '}
                        {it.variantName && (
                          <span className="text-amber-400 text-[10px]">({it.variantName})</span>
                        )}
                      </div>
                      {it.addons && it.addons.length > 0 && (
                        <div className="text-[10px] text-amber-200/80">
                          + {it.addons.join(', ')}
                        </div>
                      )}
                      <div className="text-[10px] text-stone-400">الكمية: {it.quantity}</div>
                    </div>
                    <div className="font-mono font-bold text-amber-400">
                      {it.price * it.quantity} {settings.currency}
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Summary */}
              <div className="pt-2 border-t border-[#3b2514] space-y-1 text-xs">
                <div className="flex justify-between text-stone-400">
                  <span>المجموع الفرعي:</span>
                  <span className="font-mono">{selectedOrder.subtotal} {settings.currency}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>الخصم:</span>
                    <span className="font-mono">-{selectedOrder.discountAmount} {settings.currency}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-amber-400 pt-1 border-t border-[#3b2514]">
                  <span>الإجمالي:</span>
                  <span className="font-mono">{selectedOrder.total} {settings.currency}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-80 bg-[#1a1008] border border-[#3b2514] rounded-2xl flex flex-col items-center justify-center p-6 text-stone-500 text-center shrink-0">
            <Eye className="w-8 h-8 text-stone-700 mb-2" />
            <span className="text-xs font-bold text-stone-400">اختر طلبًا من القائمة</span>
            <span className="text-[10px] text-stone-600 mt-1">لعرض تفاصيل الفاتورة وطباعة وصل 80mm</span>
          </div>
        )}
      </div>
    </div>
  );
};

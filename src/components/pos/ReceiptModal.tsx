import React from 'react';
import { useApp } from '../../context/AppContext';
import { PrintService } from '../../services/printService';
import { X, Printer, ChefHat, Check, CheckCircle2 } from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const {
    isReceiptModalOpen,
    setIsReceiptModalOpen,
    lastCompletedOrder,
    settings,
    t,
  } = useApp();

  if (!isReceiptModalOpen || !lastCompletedOrder) return null;

  const order = lastCompletedOrder;
  const dateFormatted = new Date(order.createdAt).toLocaleDateString('fr-FR');
  const timeFormatted = new Date(order.createdAt).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrintCustomer = () => {
    PrintService.printReceipt(order, settings);
  };

  const handlePrintKitchen = () => {
    PrintService.printKitchenTicket(order, settings);
  };

  const paymentLabel =
    order.paymentMethod === 'cib'
      ? 'بطاقة CIB'
      : order.paymentMethod === 'dahabia'
      ? 'البطاقة الذهبية (Dahabia)'
      : order.paymentMethod === 'baridimob'
      ? 'بريدي موب (BaridiMob)'
      : order.paymentMethod === 'transfer'
      ? 'تحويل بنكي'
      : 'نقدًا (Espèces)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none font-['Cairo',sans-serif]">
      <div className="w-full max-w-md bg-[#180f08] border border-[#422915] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#362111] bg-[#22150b] flex items-center justify-between text-right">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>تم تسجيل الدفع بنجاح وجاهز للطباعة</span>
          </div>
          <button
            onClick={() => setIsReceiptModalOpen(false)}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-[#322012] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thermal Receipt Visual Preview (80mm styling) */}
        <div className="p-5 overflow-y-auto flex-1 bg-[#120a05] flex justify-center custom-scrollbar">
          <div className="w-[300px] bg-white text-black p-5 rounded-lg shadow-2xl font-mono text-xs leading-relaxed select-text border border-stone-300">
            {/* Store Name & Tagline */}
            <div className="text-center pb-2">
              <h2 className="font-black text-base uppercase tracking-wider">{settings.name}</h2>
              <p className="text-[11px] font-bold text-stone-700">{settings.tagline}</p>
              <p className="text-[10px] text-stone-600 mt-1">{settings.address}</p>
              <p className="text-[10px] text-stone-600">Tél: {settings.phone}</p>
            </div>

            <div className="border-t border-dashed border-black my-2"></div>

            {/* Meta info */}
            <div className="space-y-0.5 text-[11px]">
              <div className="flex justify-between">
                <span>Date: <b>{dateFormatted}</b></span>
                <span>Heure: <b>{timeFormatted}</b></span>
              </div>
              <div className="flex justify-between">
                <span>Ticket: <b>#{order.orderNumber}</b></span>
                <span>Table: <b>{order.tableName || (order.type === 'takeaway' ? 'À Emporter' : 'Comptoir')}</b></span>
              </div>
              {order.cashierName && (
                <div>Caissier: <b>{order.cashierName}</b></div>
              )}
            </div>

            <div className="border-t border-dashed border-black my-2"></div>

            {/* Items Table */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between font-bold border-b border-black pb-1">
                <span className="w-1/2">المنتج / Plat</span>
                <span className="w-1/4 text-center">الكمية</span>
                <span className="w-1/4 text-right">السعر</span>
              </div>

              {order.items.map((item, idx) => (
                <div key={idx} className="py-0.5">
                  <div className="flex justify-between">
                    <span className="w-1/2 font-bold truncate">
                      {item.productNameAr || item.productName}
                    </span>
                    <span className="w-1/4 text-center font-bold">{item.quantity}</span>
                    <span className="w-1/4 text-right font-bold">{item.price * item.quantity}</span>
                  </div>
                  {(item.variantName || (item.addons && item.addons.length > 0)) && (
                    <div className="text-[9px] text-stone-600 pl-1">
                      {item.variantName && `[حجم ${item.variantName}] `}
                      {item.addons?.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-black my-2"></div>

            {/* Totals */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Sous-total:</span>
                <span>{order.subtotal} DA</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-stone-700">
                  <span>Remise:</span>
                  <span>-{order.discountAmount} DA</span>
                </div>
              )}

              <div className="flex justify-between font-black text-sm pt-1 border-t border-black">
                <span>TOTAL:</span>
                <span>{order.total} DA</span>
              </div>

              <div className="flex justify-between pt-1 text-[10px]">
                <span>Paiement:</span>
                <span>{paymentLabel}</span>
              </div>

              {order.paymentMethod === 'cash' && (
                <>
                  <div className="flex justify-between text-[10px]">
                    <span>Reçu:</span>
                    <span>{order.amountReceived || order.total} DA</span>
                  </div>
                  <div className="flex justify-between font-bold text-[10px]">
                    <span>Rendu (Monnaie):</span>
                    <span>{order.change || 0} DA</span>
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-dashed border-black my-3"></div>

            {/* Footer */}
            <div className="text-center space-y-1 text-[10px]">
              <p className="font-bold">شكراً لزيارتكم وننتظر عودتكم قريباً !</p>
              <p>Merci pour votre visite et à bientôt !</p>
              <p className="text-[9px] text-stone-500">GRINE RESTAURANT POS Windows Pro</p>
            </div>
          </div>
        </div>

        {/* Print Buttons */}
        <div className="p-4 border-t border-[#362111] bg-[#1a1109] flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handlePrintKitchen}
            className="flex-1 py-3 px-4 rounded-2xl bg-[#26180c] border border-[#422915] text-amber-300 hover:bg-[#322012] font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <ChefHat className="w-4 h-4 text-amber-400" />
            <span>طباعة تذكرة المطبخ (KOT)</span>
          </button>

          <button
            onClick={handlePrintCustomer}
            className="flex-1 py-3 px-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/70 transition"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة وصل الزبون 80mm</span>
          </button>
        </div>
      </div>
    </div>
  );
};

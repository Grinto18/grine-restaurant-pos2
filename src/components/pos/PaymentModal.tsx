import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Printer,
  CheckCircle2,
  Delete,
  ArrowRight,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';
import { PaymentMethod } from '../../types/pos';

export const PaymentModal: React.FC = () => {
  const {
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    cartTotal,
    settings,
    t,
    completePayment,
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [receivedAmount, setReceivedAmount] = useState<number>(cartTotal);
  const [inputBuffer, setInputBuffer] = useState<string>(String(cartTotal));
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Reset amounts whenever modal opens
  useEffect(() => {
    if (isPaymentModalOpen) {
      setReceivedAmount(cartTotal);
      setInputBuffer(String(cartTotal));
      setPaymentMethod('cash');
      setIsProcessing(false);
    }
  }, [isPaymentModalOpen, cartTotal]);

  if (!isPaymentModalOpen) return null;

  const changeDue = paymentMethod === 'cash' ? Math.max(0, receivedAmount - cartTotal) : 0;
  const isInsufficient = paymentMethod === 'cash' && receivedAmount < cartTotal;

  const handleQuickCash = (amount: number) => {
    setReceivedAmount(amount);
    setInputBuffer(String(amount));
  };

  const handleNumPad = (key: string) => {
    let next: string;
    if (key === 'C') {
      next = '0';
    } else if (key === 'DEL') {
      next = inputBuffer.length > 1 ? inputBuffer.slice(0, -1) : '0';
    } else {
      next = inputBuffer === '0' ? key : inputBuffer + key;
    }
    setInputBuffer(next);
    setReceivedAmount(Number(next) || 0);
  };

  const handleConfirm = () => {
    if (isInsufficient || isProcessing) return;
    setIsProcessing(true);

    try {
      completePayment(paymentMethod, receivedAmount);
    } finally {
      // Completed, modal will close via AppContext
    }
  };

  // Quick Algerian Banknotes buttons as requested: 200, 500, 1000, 2000, 3000, 5000 DA + Exact
  const quickCashPresets = [
    { label: 'المبلغ بالضبط', value: cartTotal, isExact: true },
    { label: '200 DA', value: 200 },
    { label: '500 DA', value: 500 },
    { label: '1 000 DA', value: 1000 },
    { label: '2 000 DA', value: 2000 },
    { label: '3 000 DA', value: 3000 },
    { label: '5 000 DA', value: 5000 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none font-['Cairo',sans-serif]">
      <div className="w-full max-w-3xl bg-[#180f08] border border-[#422915] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#362111] bg-[#22150b] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xl shadow-lg shadow-amber-950/40">
              💵
            </div>
            <div>
              <h2 className="text-lg font-black text-white">نافذة الدفع والتحصيل (ENCAISSER)</h2>
              <p className="text-xs text-amber-200/70">
                اختر طريقة الدفع وحدد المبلغ المستلم لطباعة الفاتورة الحرارية 80mm
              </p>
            </div>
          </div>
          <button
            onClick={() => !isProcessing && setIsPaymentModalOpen(false)}
            disabled={isProcessing}
            className="p-2 rounded-xl bg-[#2e1d10] text-stone-400 hover:text-white hover:bg-[#3e2715] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: 2 Columns */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 custom-scrollbar text-right">
          {/* Column 1: Payment Methods & Cash Balance */}
          <div className="space-y-4">
            {/* 5 Payment Methods requested */}
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                اختر وسيلة الدفع:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* 1. Cash */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('cash');
                    setReceivedAmount(cartTotal);
                    setInputBuffer(String(cartTotal));
                  }}
                  className={`py-3 px-2 rounded-xl flex flex-col items-center gap-1.5 font-bold text-xs border transition-all ${
                    paymentMethod === 'cash'
                      ? 'bg-amber-600 text-white border-amber-400 shadow-lg shadow-amber-950/70 scale-102 font-black'
                      : 'bg-[#22150b] text-stone-300 border-[#3e2715] hover:bg-[#2d1c0f]'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-amber-300" />
                  <span>💵 نقدًا</span>
                </button>

                {/* 2. CIB */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('cib');
                    setReceivedAmount(cartTotal);
                  }}
                  className={`py-3 px-2 rounded-xl flex flex-col items-center gap-1.5 font-bold text-xs border transition-all ${
                    paymentMethod === 'cib'
                      ? 'bg-amber-600 text-white border-amber-400 shadow-lg shadow-amber-950/70 scale-102 font-black'
                      : 'bg-[#22150b] text-stone-300 border-[#3e2715] hover:bg-[#2d1c0f]'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  <span>💳 CIB</span>
                </button>

                {/* 3. Dahabia */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('dahabia');
                    setReceivedAmount(cartTotal);
                  }}
                  className={`py-3 px-2 rounded-xl flex flex-col items-center gap-1.5 font-bold text-xs border transition-all ${
                    paymentMethod === 'dahabia'
                      ? 'bg-amber-600 text-white border-amber-400 shadow-lg shadow-amber-950/70 scale-102 font-black'
                      : 'bg-[#22150b] text-stone-300 border-[#3e2715] hover:bg-[#2d1c0f]'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-yellow-400" />
                  <span>💳 Dahabia</span>
                </button>

                {/* 4. BaridiMob */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('baridimob');
                    setReceivedAmount(cartTotal);
                  }}
                  className={`py-3 px-2 rounded-xl flex flex-col items-center gap-1.5 font-bold text-xs border transition-all ${
                    paymentMethod === 'baridimob'
                      ? 'bg-amber-600 text-white border-amber-400 shadow-lg shadow-amber-950/70 scale-102 font-black'
                      : 'bg-[#22150b] text-stone-300 border-[#3e2715] hover:bg-[#2d1c0f]'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-purple-400" />
                  <span>📱 BaridiMob</span>
                </button>

                {/* 5. Transfer */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('transfer');
                    setReceivedAmount(cartTotal);
                  }}
                  className={`col-span-2 py-3 px-2 rounded-xl flex items-center justify-center gap-2 font-bold text-xs border transition-all ${
                    paymentMethod === 'transfer'
                      ? 'bg-amber-600 text-white border-amber-400 shadow-lg shadow-amber-950/70 scale-102 font-black'
                      : 'bg-[#22150b] text-stone-300 border-[#3e2715] hover:bg-[#2d1c0f]'
                  }`}
                >
                  <RotateCw className="w-4 h-4 text-emerald-400" />
                  <span>🔄 تحويل (Virement)</span>
                </button>
              </div>
            </div>

            {/* Total Required Banner */}
            <div className="p-4 rounded-2xl bg-[#24170d] border border-[#422915] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-400 block">المبلغ الإجمالي المطلوب:</span>
                <span className="text-3xl font-black font-mono text-amber-400">
                  {cartTotal} <span className="text-sm font-bold text-amber-300">{settings.currency}</span>
                </span>
              </div>
              <ShieldCheck className="w-8 h-8 text-amber-400/50" />
            </div>

            {/* Cash Calculations */}
            {paymentMethod === 'cash' ? (
              <div className="space-y-3">
                {/* Amount Received Box */}
                <div className="p-4 rounded-2xl bg-[#1c1209] border border-[#422915]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-stone-300">المبلغ المدفوع (المستلم):</span>
                    <span className="text-xs font-mono text-amber-400 font-bold">دينار جزائري</span>
                  </div>
                  <div className="text-3xl font-black font-mono text-white text-left tracking-wider">
                    {receivedAmount} <span className="text-sm text-stone-400">{settings.currency}</span>
                  </div>
                </div>

                {/* Change To Return Box */}
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between ${
                    isInsufficient
                      ? 'bg-red-950/50 border-red-800/80 text-red-300'
                      : 'bg-emerald-950/50 border-emerald-800/80 text-emerald-300'
                  }`}
                >
                  <div>
                    <div className="text-xs font-black uppercase">
                      {isInsufficient ? 'المبلغ المستلم غير كافٍ !' : 'الباقي للزبون (La Monnaie):'}
                    </div>
                    <div className="text-[11px] opacity-80 mt-0.5">
                      {isInsufficient
                        ? `متبقي للدفع: ${cartTotal - receivedAmount} ${settings.currency}`
                        : 'يُسلّم للزبون نقدًا'}
                    </div>
                  </div>
                  <div className="text-3xl font-black font-mono">
                    {changeDue} <span className="text-sm font-bold">{settings.currency}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs font-medium space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>دفع إلكتروني مباشر</span>
                </div>
                <p>
                  سيتم تسديد المبلغ بالكامل ({cartTotal} {settings.currency}) عبر{' '}
                  {paymentMethod === 'cib'
                    ? 'بطاقة CIB'
                    : paymentMethod === 'dahabia'
                    ? 'البطاقة الذهبية'
                    : paymentMethod === 'baridimob'
                    ? 'تطبيق بريدي موب'
                    : 'التحويل المصرفي'}{' '}
                  دون الحاجة لحساب الباقي.
                </p>
              </div>
            )}
          </div>

          {/* Column 2: Quick Cash Presets & Touch Keypad */}
          <div className="space-y-4">
            {paymentMethod === 'cash' ? (
              <>
                {/* Quick Presets: 200, 500, 1000, 2000, 3000, 5000 DA */}
                <div>
                  <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                    أزرار سريعة للأوراق النقدية:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {quickCashPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickCash(preset.value)}
                        className={`py-2 px-3 rounded-xl border text-xs font-black transition-all flex items-center justify-between ${
                          receivedAmount === preset.value
                            ? 'bg-amber-600 border-amber-400 text-white shadow-md'
                            : 'bg-[#22150b] border-[#3e2715] text-stone-300 hover:bg-[#2d1c0f]'
                        }`}
                      >
                        <span>{preset.label}</span>
                        {receivedAmount === preset.value && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Touch Keypad */}
                <div>
                  <div className="grid grid-cols-3 gap-2">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'].map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => handleNumPad(k)}
                        className={`py-2.5 rounded-xl font-mono font-black text-sm border transition active:scale-95 ${
                          k === 'C'
                            ? 'bg-red-950/60 border-red-800/60 text-red-300 hover:bg-red-900/60'
                            : k === 'DEL'
                            ? 'bg-amber-950/60 border-amber-800/60 text-amber-300 hover:bg-amber-900/60'
                            : 'bg-[#24170d] border-[#3e2715] text-white hover:bg-[#322012]'
                        }`}
                      >
                        {k === 'DEL' ? '⌫' : k}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-[#1c1209] rounded-2xl border border-[#3e2715]">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl">
                  💳
                </div>
                <div className="font-extrabold text-sm text-white">جاهز لتسجيل العملية</div>
                <p className="text-xs text-stone-400">
                  يرجى تمرير البطاقة أو التحقق من نجاح إشعار الدفع عبر الهاتف، ثم اضغط على زر تأكيد الدفع والطباعة بالأسفل.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#362111] bg-[#1a1109] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => !isProcessing && setIsPaymentModalOpen(false)}
            disabled={isProcessing}
            className="py-3 px-6 rounded-2xl bg-[#26180c] border border-[#422915] text-stone-300 hover:bg-[#322012] font-bold text-xs transition"
          >
            إلغاء وتراجع
          </button>

          {/* Confirm & Print Button with double-click prevention */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isInsufficient || isProcessing}
            className={`flex-1 py-4 px-6 rounded-2xl font-black text-sm tracking-wider flex items-center justify-center gap-2 shadow-xl transition active:scale-98 ${
              isInsufficient || isProcessing
                ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-emerald-950/70 border border-emerald-400/50 cursor-pointer'
            }`}
          >
            {isProcessing ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                <span>جاري معالجة الدفع والطباعة...</span>
              </>
            ) : (
              <>
                <Printer className="w-5 h-5" />
                <span>تأكيد الدفع والطباعة الحرارية 80mm</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

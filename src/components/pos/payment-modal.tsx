import { Loader2, CheckCircle2, Banknote, ShoppingBag, Bike } from "lucide-react";

const quickAmounts = [50000, 100000, 150000, 200000];

export function PaymentModal({
  isOpen,
  onClose,
  paymentMethod,
  onPaymentMethodChange,
  amountReceived,
  onAmountReceivedChange,
  changeAmount,
  isSubmitting,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: "CASH" | "QRIS" | "DEBIT";
  onPaymentMethodChange: (method: "CASH" | "QRIS" | "DEBIT") => void;
  amountReceived: number;
  onAmountReceivedChange: (amount: number) => void;
  changeAmount: number;
  isSubmitting: boolean;
  onSubmit: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-[3px] h-6 bg-orange-500 rounded-full"></div>
            <h3 className="text-lg font-bold tracking-wider text-gray-800 uppercase">
              PEMBAYARAN
            </h3>
          </div>

          {/* Payment Methods */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: "CASH" as const, label: "Cash", icon: Banknote },
              { id: "QRIS" as const, label: "QRIS", icon: ShoppingBag },
              { id: "DEBIT" as const, label: "GRAB", icon: Bike },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => onPaymentMethodChange(method.id)}
                className={`flex flex-col items-center justify-center py-6 rounded-2xl border-2 transition-all ${
                  paymentMethod === method.id
                    ? "bg-orange-50 border-orange-500 text-orange-500 shadow-sm"
                    : "bg-white border-gray-100 text-gray-400 hover:bg-gray-50"
                }`}
              >
                <method.icon
                  className={`h-8 w-8 mb-3 ${
                    paymentMethod === method.id
                      ? "text-orange-500"
                      : "text-gray-300"
                  }`}
                  strokeWidth={1.5}
                />
                <span className="text-xs font-bold">{method.label}</span>
              </button>
            ))}
          </div>

          {/* Amount Input */}
          <div className="space-y-4">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
              UANG DITERIMA
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-400 font-bold text-sm">Rp</span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={amountReceived ? amountReceived.toLocaleString('id-ID') : ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  onAmountReceivedChange(val ? Number(val) : 0);
                }}
                placeholder="Masukan Nominal..."
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-700 placeholder:text-gray-300 focus:ring-2 focus:ring-orange-100 focus:border-orange-200 transition-all"
              />
            </div>

            {/* Quick Amounts */}
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => onAmountReceivedChange(amt)}
                  className="py-2.5 rounded-xl border border-gray-100 text-[10px] font-bold text-gray-500 hover:bg-orange-50 hover:border-orange-100 hover:text-orange-500 transition-all"
                >
                  {amt / 1000}K
                </button>
              ))}
            </div>
          </div>

          {/* Change Display */}
          <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Banknote className="h-5 w-5 text-orange-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                  Kembalian
                </span>
                <span className="text-[10px] text-gray-400">
                  Masukan uang diterima
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-orange-500">
                {paymentMethod === "CASH"
                  ? `Rp ${changeAmount.toLocaleString()}`
                  : "Rp -"}
              </span>
            </div>
          </div>

          {/* Submit / Cancel Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="w-full py-5 rounded-[1.5rem] font-bold text-sm text-white bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 transform active:scale-[0.98]"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Konfirmasi Pembayaran</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

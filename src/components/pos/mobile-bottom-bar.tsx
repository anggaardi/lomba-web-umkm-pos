import { Banknote } from "lucide-react";

export function MobileBottomBar({
  totalAmount,
  cartItemCount,
  isSubmitting,
  onCheckout,
}: {
  totalAmount: number;
  cartItemCount: number;
  isSubmitting: boolean;
  onCheckout: () => void;
}) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Total Tagihan
          </span>
          <span className="text-lg font-black text-gray-900 leading-none">
            IDR {totalAmount.toLocaleString()}
          </span>
        </div>
        <button
          type="button"
          onClick={onCheckout}
          disabled={isSubmitting || cartItemCount === 0}
          className="flex-1 py-4 px-6 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transform active:scale-[0.98]"
        >
          <Banknote className="h-5 w-5" />
          <span>Bayar ({cartItemCount})</span>
        </button>
      </div>
    </div>
  );
}

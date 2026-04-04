import { ShoppingBag, Banknote, Minus, Plus } from "lucide-react";
import type { CartItem, PosConfig } from "@/types/pos";

export function CartPanel({
  cart,
  onUpdateQuantity,
  subtotal,
  taxAmount,
  serviceAmount,
  totalAmount,
  applyTax,
  applyService,
  posConfig,
  error,
  isSubmitting,
  onCheckout,
}: {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  subtotal: number;
  taxAmount: number;
  serviceAmount: number;
  totalAmount: number;
  applyTax: boolean;
  applyService: boolean;
  posConfig: PosConfig;
  error: string | null;
  isSubmitting: boolean;
  onCheckout: () => void;
}) {
  return (
    <div className="bg-white rounded-[1.5rem] shadow-lg overflow-hidden flex flex-col flex-1 border border-gray-50 min-h-0 relative">
      {/* Header */}
      <div className="p-5 pb-3 flex items-center justify-between shrink-0 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-[3px] h-6 bg-orange-500 rounded-full"></div>
          <h3 className="text-sm font-bold tracking-wider text-gray-600 uppercase">
            ITEM PESANAN
          </h3>
        </div>
        <div className="px-3 py-1.5 bg-red-50 text-orange-500 text-[10px] font-bold rounded-full">
          {cart.reduce((sum, item) => sum + item.quantity, 0)} item
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scrollbar-thin scrollbar-thumb-gray-100 hover:scrollbar-thumb-gray-200">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40">
            <ShoppingBag className="h-10 w-10 mb-2 text-gray-200" />
            <p className="text-xs font-bold italic text-gray-400 uppercase tracking-widest">
              Belum ada pesanan
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.product.id} className="flex gap-3 group items-center">
              <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 shadow-sm border border-gray-100 self-start mt-0.5">
                <img
                  src={
                    item.product.image ||
                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=100&auto=format&fit=crop"
                  }
                  className="w-full h-full object-cover"
                  alt={item.product.name}
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="text-[13px] font-bold text-gray-800 leading-tight mb-1 truncate">
                  {item.product.name}
                </p>
                <div className="flex flex-col items-start gap-2 xl:flex-row xl:items-center xl:justify-between">
                  <p className="text-xs font-bold text-orange-500">
                    {item.product.price.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="h-6 w-6 flex items-center justify-center rounded-full bg-gray-400 text-white font-bold hover:bg-gray-500 transition-colors shadow-sm active:scale-90"
                    >
                      <Minus className="h-3 w-3" strokeWidth={4} />
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateQuantity(item.product.id, item.quantity + 1)
                      }
                      className="h-6 w-6 flex items-center justify-center rounded-full bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors shadow-sm active:scale-90"
                    >
                      <Plus className="h-3 w-3" strokeWidth={4} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="p-6 bg-white border-t border-gray-100 space-y-4 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
        <div className="space-y-2 font-bold">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-500 uppercase tracking-tighter">
              Subtotal
            </span>
            <span className="text-gray-800">IDR {subtotal.toLocaleString()}</span>
          </div>
          {applyService && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-500 uppercase tracking-tighter">
                Service
              </span>
              <span className="text-gray-800">
                IDR {serviceAmount.toLocaleString()}
              </span>
            </div>
          )}
          {applyTax && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-500 uppercase tracking-tighter">
                Pajak ({posConfig.taxPercent}%)
              </span>
              <span className="text-gray-800">
                IDR {taxAmount.toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm font-bold text-gray-900 pt-3 mt-1 border-t border-gray-50">
            <span className="uppercase tracking-wider">Total</span>
            <span className="text-lg text-orange-600">
              IDR {totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="pt-2">
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-100 rounded-xl animate-bounce">
              <p className="text-[10px] font-bold text-red-500 text-center">
                {error}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={onCheckout}
            disabled={isSubmitting || cart.length === 0}
            className="w-full py-4 rounded-2xl font-bold text-sm text-white bg-linear-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-orange-500/30 flex items-center justify-center gap-3 transform active:scale-[0.98]"
          >
            <Banknote className="h-5 w-5" />
            <span>Lanjut Pembayaran</span>
          </button>
        </div>
      </div>
    </div>
  );
}

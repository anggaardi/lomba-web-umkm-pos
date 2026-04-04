import { CheckCircle2, X, Printer } from "lucide-react";
import type { LastTransaction, PosConfig } from "@/types/pos";

export function ReceiptModal({
  isOpen,
  onClose,
  transaction,
  posConfig,
  tenant,
}: {
  isOpen: boolean;
  onClose: () => void;
  transaction: LastTransaction | null;
  posConfig: PosConfig;
  tenant: {
    name: string;
    address: string;
    whatsappNumber: string;
  };
}) {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => window.print();

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content,
          #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            margin: 0 !important;
            padding: 5mm !important;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 print:p-0 print:bg-white print:static animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 print:shadow-none print:rounded-none print:max-w-none">
          <div className="bg-[#FF724C] p-5 flex items-center justify-between text-white print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-bold text-lg">Berhasil</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div
            className="p-8 space-y-4 font-mono text-sm text-gray-800 print:p-0"
            id="receipt-content"
          >
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold uppercase">{tenant.name}</h2>
              <p className="text-xs leading-tight opacity-70">{tenant.address}</p>
              <p className="text-xs opacity-70">WA: {tenant.whatsappNumber}</p>
              {posConfig.receiptHeader && (
                <p className="text-xs italic pt-2 border-t border-gray-100 mt-2">
                  {posConfig.receiptHeader}
                </p>
              )}
            </div>
            <div className="border-t border-dashed border-gray-300 pt-4 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Order: #{transaction.orderNumber}</span>
                <span>{transaction.createdAt}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode: {transaction.paymentMethod}</span>
              </div>
            </div>
            <div className="border-t border-dashed border-gray-300 pt-4 space-y-3">
              {transaction.items.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between font-bold text-sm">
                    <span>{item.name}</span>
                  </div>
                  <div className="flex justify-between text-xs opacity-70">
                    <span>
                      {item.quantity} x {item.price.toLocaleString()}
                    </span>
                    <span>{(item.quantity * item.price).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-gray-300 pt-4 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{transaction.subtotal.toLocaleString()}</span>
              </div>
              {transaction.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>Pajak ({posConfig.taxPercent}%)</span>
                  <span>{transaction.taxAmount.toLocaleString()}</span>
                </div>
              )}
              {transaction.serviceAmount > 0 && (
                <div className="flex justify-between">
                  <span>Service ({posConfig.serviceChargePercent}%)</span>
                  <span>{transaction.serviceAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-3 border-t border-gray-100">
                <span>TOTAL</span>
                <span>Rp {transaction.totalAmount.toLocaleString()}</span>
              </div>
            </div>
            <div className="border-t border-dashed border-gray-300 pt-4 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Bayar</span>
                <span>{transaction.amountReceived.toLocaleString()}</span>
              </div>
              {transaction.paymentMethod === "CASH" && (
                <div className="flex justify-between font-bold text-emerald-600">
                  <span>Kembali</span>
                  <span>{transaction.changeAmount.toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className="text-center pt-8 space-y-1 italic text-xs border-t border-dashed border-gray-300 opacity-60">
              <p className="whitespace-pre-line">{posConfig.receiptFooter}</p>
              <p className="not-italic font-bold pt-2">SmartBizFNB</p>
            </div>
          </div>
          <div className="p-6 bg-gray-50 border-t flex gap-4 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all transform active:scale-95"
            >
              <Printer className="h-4 w-4 mr-2" />
              Struk
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all transform active:scale-95"
            >
              Selesai
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

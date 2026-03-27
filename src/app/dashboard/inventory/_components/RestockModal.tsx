import React from "react";
import { X, CheckCircle2, Loader2, Info } from "lucide-react";
import { type Ingredient } from "../types";

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIngredient: Ingredient | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  purchasePackagingId: string;
  setPurchasePackagingId: (val: string) => void;
  purchaseQty: number;
  setPurchaseQty: (val: number) => void;
  purchaseTotalPrice: number;
  setPurchaseTotalPrice: (val: number) => void;
  purchaseCustomValue: number;
  setPurchaseCustomValue: (val: number) => void;
  showPriceWarning: boolean;
}

export function RestockModal({
  isOpen,
  onClose,
  selectedIngredient,
  onSubmit,
  isSubmitting,
  error,
  purchasePackagingId,
  setPurchasePackagingId,
  purchaseQty,
  setPurchaseQty,
  purchaseTotalPrice,
  setPurchaseTotalPrice,
  purchaseCustomValue,
  setPurchaseCustomValue,
  showPriceWarning,
}: RestockModalProps) {
  if (!isOpen || !selectedIngredient) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 transition-all duration-300">
      <div className="bg-white rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] w-full max-w-[500px] overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="px-8 pt-8 pb-4 flex items-start justify-between">
          <div>
            <h2 className="text-[28px] font-black text-slate-900 leading-tight">
              Tambah Stok Masuk
            </h2>
            <p className="text-slate-400 text-[13px] font-bold mt-1 uppercase tracking-wide">
              Catat penerimaan bahan baku
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="px-8 pb-10 space-y-6" onSubmit={onSubmit}>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-primary shadow-sm font-black text-xl">
              {selectedIngredient.name[0]}
            </div>
            <div>
              <p className="font-bold text-slate-900">{selectedIngredient.name}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Stok saat ini: {selectedIngredient.stock.toLocaleString()}{" "}
                {selectedIngredient.unit}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Pilih Kemasan Pembelian
              </label>
              <div className="grid grid-cols-2 gap-3">
                {selectedIngredient.packagings?.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setPurchasePackagingId(pkg.id)}
                    className={`p-4 rounded-2xl border-2 transition-all text-left group ${
                      purchasePackagingId === pkg.id
                        ? "border-primary bg-primary-light"
                        : "border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <p className={`font-bold text-sm ${purchasePackagingId === pkg.id ? "text-primary" : "text-slate-700"}`}>
                      {pkg.name}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400">
                      1 {pkg.name} = {pkg.conversionValue} {selectedIngredient.unit}
                    </p>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPurchasePackagingId("")}
                  className={`p-4 rounded-2xl border-2 transition-all text-left ${
                    purchasePackagingId === ""
                      ? "border-primary bg-primary-light"
                      : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <p className={`font-bold text-sm ${purchasePackagingId === "" ? "text-primary" : "text-slate-700"}`}>
                    Lainnya
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 italic">
                    Masukkan rasio manual
                  </p>
                </button>
              </div>
            </div>

            {!purchasePackagingId && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <label className="text-[11px] font-black text-primary uppercase tracking-widest ml-1">
                  Rasio Konversi Manual
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={purchaseCustomValue || ""}
                    onChange={(e) => setPurchaseCustomValue(Number(e.target.value))}
                    placeholder="Contoh: 1000"
                    className="w-full bg-slate-50 border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-primary/10 transition-all border"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">
                    {selectedIngredient.unit} / UNIT BELI
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Jumlah Barang
                </label>
                <input
                  type="number"
                  required
                  value={purchaseQty || ""}
                  onChange={(e) => setPurchaseQty(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-slate-50 border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 border"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Total Bayar (Rp)
                </label>
                <input
                  type="number"
                  required
                  value={purchaseTotalPrice || ""}
                  onChange={(e) => setPurchaseTotalPrice(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-slate-50 border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 border"
                />
              </div>
            </div>
          </div>

          {showPriceWarning && (
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex gap-3 items-start animate-shake">
              <Info className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[11px] font-black text-orange-800 uppercase tracking-widest">
                  Peringatan Harga
                </p>
                <p className="text-[10px] text-orange-700 leading-relaxed font-medium">
                  Harga beli baru ini &gt;50% lebih tinggi dari harga beli terakhir.
                  Klik tombol &quot;Simpan&quot; sekali lagi jika data sudah benar.
                </p>
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl">
              {error}
            </p>
          )}

          <button
            disabled={isSubmitting}
            className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-sm shadow-[0_8px_30px_rgb(255,114,76,0.2)] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" /> SIMPAN STOK MASUK
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

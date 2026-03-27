import React from "react";
import { X, CheckCircle2, Loader2 } from "lucide-react";

interface RegisterIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  addInitialStock: number;
  setAddInitialStock: (val: number) => void;
  addMinStock: number;
  setAddMinStock: (val: number) => void;
}

export function RegisterIngredientModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  error,
  addInitialStock,
  setAddInitialStock,
  addMinStock,
  setAddMinStock,
}: RegisterIngredientModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-primary p-6 flex items-center justify-between text-white">
          <h2 className="text-xl font-black">Tambah Bahan Baku</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form className="p-6 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">
              Nama Bahan
            </label>
            <input
              name="name"
              required
              placeholder="Contoh: Kopi Arabica"
              className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 border"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">
                Satuan
              </label>
              <input
                name="unit"
                required
                placeholder="gr, ml, pcs"
                className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 border"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">
                Stok Awal
              </label>
              <input
                name="initialStock"
                type="number"
                value={addInitialStock}
                min="0"
                onChange={(e) => {
                  const val = Number(e.target.value) || 0;
                  setAddInitialStock(val);
                  setAddMinStock(Math.round(val * 0.1));
                }}
                className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 border"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">
              Nilai Stok Awal (Total Harga)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                Rp
              </span>
              <input
                name="initialPrice"
                type="number"
                defaultValue="0"
                placeholder="0"
                className="w-full bg-slate-50 border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 border"
              />
            </div>
            <p className="text-[10px] text-slate-400 italic ml-1">
              *Digunakan untuk menghitung HPP awal
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">
              Min Stok
              <span className="ml-2 text-[10px] font-medium text-slate-400 normal-case tracking-normal">
                (otomatis 10% dari stok awal)
              </span>
            </label>
            <input
              type="number"
              name="minStock"
              value={addMinStock}
              min="0"
              onChange={(e) => setAddMinStock(Number(e.target.value) || 0)}
              className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 border"
            />
            <p className="text-[10px] text-slate-400 italic ml-1">
              *Bisa diubah manual sesuai kebutuhan
            </p>
          </div>

          {error && (
            <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </p>
          )}

          <button
            disabled={isSubmitting}
            className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" /> SIMPAN BAHAN
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

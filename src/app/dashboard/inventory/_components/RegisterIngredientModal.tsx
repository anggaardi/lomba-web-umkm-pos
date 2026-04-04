import React from "react";
import { X, CheckCircle2, Loader2, ChevronsUpDown } from "lucide-react";

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
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all duration-300">
      <div className="bg-white rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] w-full max-w-[500px] overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="px-8 pt-8 pb-6 flex items-start justify-between bg-white border-b border-slate-50 relative z-10">
          <div>
            <h2 className="text-[28px] font-black text-slate-900 leading-tight">
              Tambah Bahan Baku
            </h2>
            <p className="text-slate-400 text-[13px] font-bold mt-1 uppercase tracking-wide">
              Masukkan detail bahan baku baru
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
          
        </div>

        <form className="px-8 pb-8 pt-4 space-y-4" onSubmit={onSubmit}>
          
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">
              Nama Bahan
            </label>
            <input
              name="name"
              required
              placeholder="Contoh: Kopi Arabica"
              className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">
                Stok Awal
              </label>
              <div className="relative">
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
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-5 pr-12 py-3.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center bg-slate-100 rounded text-slate-400 p-0.5 pointer-events-none">
                  <ChevronsUpDown className="w-[14px] h-[14px]" />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">
              Nilai Stok Awal (Total Harga)
            </label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                Rp
              </span>
              <input
                name="initialPrice"
                type="number"
                defaultValue="0"
                placeholder="0"
                className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-12 py-3.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center bg-slate-100 rounded text-slate-400 p-0.5 pointer-events-none">
                <ChevronsUpDown className="w-[14px] h-[14px]" />
              </div>
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
            <div className="relative">
              <input
                type="number"
                name="minStock"
                value={addMinStock}
                min="0"
                onChange={(e) => setAddMinStock(Number(e.target.value) || 0)}
                className="w-full bg-white border border-slate-200 rounded-2xl pl-5 pr-12 py-3.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center bg-slate-100 rounded text-slate-400 p-0.5 pointer-events-none">
                <ChevronsUpDown className="w-[14px] h-[14px]" />
              </div>
            </div>
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
            className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
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

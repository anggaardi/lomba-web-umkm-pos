import React from "react";
import { X, CheckCircle2, Loader2, Info, Trash2, Box } from "lucide-react";
import { type Ingredient } from "../types";

interface PackagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIngredient: Ingredient | null;
  onAddPackaging: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onDeletePackaging: (packagingId: string) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

export function PackagingModal({
  isOpen,
  onClose,
  selectedIngredient,
  onAddPackaging,
  onDeletePackaging,
  isSubmitting,
  error,
}: PackagingModalProps) {
  if (!isOpen || !selectedIngredient) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all duration-300">
      <div className="bg-white rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] w-full max-w-[500px] max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header - Fixed */}
        <div className="px-8 pt-8 pb-6 flex items-start justify-between bg-white border-b border-slate-50 relative z-10">
          <div>
            <h2 className="text-[28px] font-black text-slate-900 leading-tight">
              Kelola Kemasan
            </h2>
            <p className="text-slate-400 text-[13px] font-bold mt-1 uppercase tracking-wide">
              Ubah unit beli menjadi unit simpan
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {/* Info Alert */}
          <div className="bg-primary/5 p-5 rounded-3xl flex items-start gap-4 border border-primary/10">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0 border border-primary/10">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <p className="text-[11px] text-primary/80 leading-relaxed font-black uppercase tracking-widest italic">
              Definisikan kemasan yang sering dibeli untuk mempermudah input barang masuk. 
              <span className="block mt-1 text-slate-400 font-bold normal-case italic">
                Contoh: 1 Sak = 50kg, 1 Bal = 20kg.
              </span>
            </p>
          </div>

          {/* List Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                List Kemasan Terdaftar
              </h3>
              <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[9px] font-black text-slate-400">
                {(selectedIngredient.packagings || []).length} Item
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {(selectedIngredient.packagings || []).map((pkg) => (
                <div key={pkg.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-[24px] group transition-all hover:border-primary/20 hover:shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors border border-slate-100">
                      <Box className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{pkg.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                        Rasio: <span className="text-primary">{pkg.conversionValue}</span> {selectedIngredient.unit}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeletePackaging(pkg.id)}
                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(!selectedIngredient.packagings || selectedIngredient.packagings.length === 0) && (
                <div className="text-center py-10 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[32px]">
                  <Box className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Belum ada kemasan</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Form - Fixed */}
        <div className="px-8 py-8 bg-slate-50/80 border-t border-slate-100 backdrop-blur-sm relative z-10">
          <div className="space-y-5">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
              Tambah Kemasan Baru
            </h3>
            <form className="grid grid-cols-2 gap-4" onSubmit={onAddPackaging}>
              <div className="space-y-1.5">
                <input
                  name="name"
                  required
                  placeholder="Sak, Bal, Botol"
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-300"
                />
              </div>
              <div className="space-y-1.5">
                <div className="relative">
                  <input
                    name="conversionValue"
                    type="number"
                    required
                    placeholder="Nilai Konversi"
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-5 pr-12 py-3.5 text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-300"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">
                    {selectedIngredient.unit}
                  </span>
                </div>
              </div>
              <button
                disabled={isSubmitting}
                className="col-span-2 py-4 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Kemasan Baru"}
              </button>
            </form>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-50 p-4 rounded-2xl border border-red-100 animate-in slide-in-from-bottom-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 transition-all duration-300">
      <div className="bg-white rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] w-full max-w-[500px] overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="px-8 pt-8 pb-4 flex items-start justify-between">
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

        <div className="px-8 pb-10 space-y-6">
          <div className="bg-primary-light p-4 rounded-2xl flex items-start gap-3 shadow-sm shadow-primary/5">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[10px] text-primary/80 leading-relaxed font-black uppercase tracking-widest italic">
              Definisikan kemasan yang sering dibeli untuk mempermudah input barang masuk. Contoh: 1 Sak = 50kg, 1 Bal = 20kg.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
              List Kemasan Terdaftar
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {(selectedIngredient.packagings || []).map((pkg) => (
                <div key={pkg.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                      <Box className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{pkg.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">
                        Rasio: {pkg.conversionValue} {selectedIngredient.unit}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeletePackaging(pkg.id)}
                    className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(!selectedIngredient.packagings || selectedIngredient.packagings.length === 0) && (
                <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-2xl">
                  <p className="text-xs text-slate-400 font-medium">Belum ada kemasan terdaftar</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-6">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
              Tambah Kemasan Baru
            </h3>
            <form className="grid grid-cols-2 gap-3" onSubmit={onAddPackaging}>
              <div className="space-y-1.5">
                <input
                  name="name"
                  required
                  placeholder="Sak, Bal, Botol"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-black text-slate-900"
                />
              </div>
              <div className="space-y-1.5">
                <div className="relative">
                  <input
                    name="conversionValue"
                    type="number"
                    required
                    placeholder="Nilai Konversi"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-4 pr-10 py-2.5 text-xs font-black text-slate-900"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">
                    {selectedIngredient.unit}
                  </span>
                </div>
              </div>
              <button
                disabled={isSubmitting}
                className="col-span-2 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Simpan Kemasan Baru"}
              </button>
            </form>
          </div>

          {error && (
            <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

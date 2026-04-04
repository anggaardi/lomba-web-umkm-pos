import React, { useEffect, useState } from "react";
import { X, CheckCircle2, Loader2, Trash2, ChevronsUpDown } from "lucide-react";
import { type Ingredient } from "../types";

interface EditIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isSubmitting: boolean;
  ingredient: Ingredient | null;
}

export function EditIngredientModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  isSubmitting,
  ingredient,
}: EditIngredientModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    minStock: 0,
  });

  useEffect(() => {
    if (ingredient) {
      setFormData({
        name: ingredient.name,
        unit: ingredient.unit,
        minStock: ingredient.minStock || 0,
      });
    }
  }, [ingredient]);

  if (!isOpen || !ingredient) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(ingredient.id, formData);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all duration-300">
      <div className="bg-white rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] w-full max-w-[500px] overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="px-8 pt-8 pb-6 flex items-start justify-between bg-white border-b border-slate-50 relative z-10">
          <div>
            <h2 className="text-[28px] font-black text-slate-900 leading-tight">
              Edit Bahan Baku
            </h2>
            <p className="text-slate-400 text-[13px] font-bold mt-1 uppercase tracking-wide">
              Perbarui informasi bahan baku
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
        <form className="px-8 pb-8 pt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">
              Nama Bahan
            </label>
            <input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">
                Satuan
              </label>
              <input
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">
                Min Stok
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.minStock}
                  min="0"
                  onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-5 pr-12 py-3.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center bg-slate-100 rounded text-slate-400 p-0.5 pointer-events-none">
                  <ChevronsUpDown className="w-[14px] h-[14px]" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" /> SIMPAN PERUBAHAN
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Apakah Anda yakin ingin menghapus bahan baku ini? Tindakan ini tidak dapat dibatalkan.")) {
                  onDelete(ingredient.id);
                }
              }}
              disabled={isSubmitting}
              className="w-full py-4 bg-white border border-red-200 text-red-500 hover:bg-red-50 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" /> HAPUS BAHAN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

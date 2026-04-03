import React, { useEffect, useState } from "react";
import { X, CheckCircle2, Loader2, Trash2 } from "lucide-react";
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
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-primary p-6 flex items-center justify-between text-white">
          <h2 className="text-xl font-black">Edit Bahan Baku</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">
              Nama Bahan
            </label>
            <input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 border"
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
                className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 border"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">
                Min Stok
              </label>
              <input
                type="number"
                value={formData.minStock}
                min="0"
                onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) || 0 })}
                className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 border"
              />
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
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
              className="w-full py-4 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" /> HAPUS BAHAN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

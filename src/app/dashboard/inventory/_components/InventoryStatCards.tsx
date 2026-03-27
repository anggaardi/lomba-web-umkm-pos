import React from "react";
import { Box, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface InventoryStatCardsProps {
  stats: {
    total: number;
    lowStock: number;
    outOfStock: number;
  };
}

export function InventoryStatCards({ stats }: InventoryStatCardsProps) {
  return (
    <>
      {/* Mobile Stats Scroll */}
      <div className="lg:hidden flex overflow-x-auto gap-4 pb-2 -mx-4 px-4 no-scrollbar">
        <div className="min-w-[150px] flex-1 bg-white p-5 rounded-3xl shadow-sm border border-slate-50 flex flex-col">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 italic">TOTAL BAHAN</p>
          <div className="flex items-end gap-1">
            <p className="text-3xl font-black text-primary">{stats.total}</p>
            <span className="text-xs font-bold text-slate-400 pb-1">Item</span>
          </div>
        </div>
        <div className="min-w-[150px] flex-1 bg-amber-50 p-5 rounded-3xl shadow-sm border border-amber-100 flex flex-col">
          <p className="text-[10px] font-black text-amber-800/60 uppercase tracking-widest mb-4 italic">MENIPIS</p>
          <div className="flex items-end gap-1">
            <p className="text-3xl font-black text-amber-500">{stats.lowStock}</p>
            <span className="text-xs font-bold text-amber-800/60 pb-1">Item</span>
          </div>
        </div>
        <div className="min-w-[150px] flex-1 bg-rose-50 p-5 rounded-3xl shadow-sm border border-rose-100 flex flex-col">
          <p className="text-[10px] font-black text-rose-800/60 uppercase tracking-widest mb-4 italic">HABIS</p>
          <div className="flex items-end gap-1">
            <p className="text-3xl font-black text-rose-500">{stats.outOfStock}</p>
            <span className="text-xs font-bold text-rose-800/60 pb-1">Bahan</span>
          </div>
        </div>
      </div>

      {/* Desktop Stats Grid */}
      <div className="hidden lg:grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Bahan Baku</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Stok Menipis</p>
            <p className="text-2xl font-bold text-slate-800">{stats.lowStock}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <X className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Habis</p>
            <p className="text-2xl font-bold text-slate-800">{stats.outOfStock}</p>
          </div>
        </div>
      </div>
    </>
  );
}

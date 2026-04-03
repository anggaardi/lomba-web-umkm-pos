import React from "react";
import { Box, CheckCircle2, X, Pencil, Plus } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { getStockStatus } from "@/lib/inventory-utils";
import { type Ingredient } from "../types";

interface MobileCardProps {
  ing: Ingredient;
  onRestock: () => void;
  onPackaging: () => void;
  onEditMinStock: () => void;
  isEditingMinStock: boolean;
  editMinStockValue: number;
  onSaveMinStock: (val: number) => void;
  onCancelEdit: () => void;
  minStockError: string | null;
  setEditMinStockValue: (val: number) => void;
  onEdit: () => void;
}

export function MobileInventoryCard({
  ing,
  onRestock,
  onPackaging,
  onEditMinStock,
  isEditingMinStock,
  editMinStockValue,
  onSaveMinStock,
  onCancelEdit,
  minStockError,
  setEditMinStockValue,
  onEdit,
}: MobileCardProps) {
  const status = getStockStatus(ing.stock, ing.minStock ?? 0);
  const isLow = status === "MENIPIS";
  const isOut = status === "HABIS";

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-50 flex flex-col gap-4 mx-1">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="font-black text-slate-800 text-lg leading-tight">{ing.name}</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {ing.unit} | {ing.packagings?.length || 0} Kemasan
          </p>
        </div>
        {isOut ? (
          <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-wider">HABIS</span>
        ) : isLow ? (
          <span className="px-2.5 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-wider">MENIPIS</span>
        ) : (
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-wider">NORMAL</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 py-2 border-y border-dashed border-slate-100">
        <div>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">STOK SAAT INI</p>
          <p className="text-lg font-black text-slate-800">{ing.stock.toLocaleString()} <span className="text-xs text-slate-400">{ing.unit}</span></p>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">MIN STOK</p>
          {isEditingMinStock ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={editMinStockValue}
                  onChange={(e) => setEditMinStockValue(Number(e.target.value))}
                  className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold focus:ring-2 focus:ring-primary/20 border-b-2"
                  autoFocus
                />
                <button onClick={() => onSaveMinStock(editMinStockValue)} className="p-1 text-emerald-500"><CheckCircle2 className="w-4 h-4" /></button>
                <button onClick={onCancelEdit} className="p-1 text-slate-400"><X className="w-4 h-4" /></button>
              </div>
              {minStockError && <p className="text-[9px] text-red-500 font-bold">{minStockError}</p>}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-lg font-black text-slate-800">{(ing.minStock ?? 0).toLocaleString()} <span className="text-xs text-slate-400">{ing.unit}</span></p>
              <button onClick={onEditMinStock} className="p-1 text-slate-300 hover:text-primary transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">HPP AVG</p>
          <p className="text-sm font-bold text-slate-700">{formatCurrency(ing.averageCostPerUnit)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-3 border border-slate-100 rounded-2xl text-slate-400 hover:text-primary active:scale-95 transition-all"
            title="Edit Bahan"
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={onPackaging}
            className="p-3 border border-slate-100 rounded-2xl text-slate-400 hover:text-primary active:scale-95 transition-all"
            title="Kelola Kemasan"
          >
            <Box className="w-5 h-5" />
          </button>
          <button
            onClick={onRestock}
            className="px-5 py-3 bg-primary text-white rounded-2xl text-xs font-black shadow-md shadow-primary/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> BELANJA
          </button>
        </div>
      </div>
    </div>
  );
}

interface DesktopRowProps {
  ing: Ingredient;
  isEditingMinStock: boolean;
  editMinStockValue: number;
  onSaveMinStock: (val: number) => void;
  onCancelEdit: () => void;
  minStockError: string | null;
  setEditMinStockValue: (val: number) => void;
  onRestock: () => void;
  onPackaging: () => void;
  onEditStart: () => void;
  onEdit: () => void;
}

export function DesktopInventoryRow({
  ing,
  isEditingMinStock,
  editMinStockValue,
  onSaveMinStock,
  onCancelEdit,
  minStockError,
  setEditMinStockValue,
  onRestock,
  onPackaging,
  onEditStart,
  onEdit,
}: DesktopRowProps) {
  const status = getStockStatus(ing.stock, ing.minStock ?? 0);
  const isLow = status === "MENIPIS";
  const isOut = status === "HABIS";

  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-6 py-4">
        <div className="font-bold text-slate-700">{ing.name}</div>
        <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
          Satuan: {ing.unit} | {ing.packagings?.length || 0} Kemasan
        </div>
      </td>
      <td className="px-6 py-4 font-black text-slate-800">
        {ing.stock.toLocaleString()} {ing.unit}
      </td>
      <td className="px-6 py-4">
        {isEditingMinStock ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={editMinStockValue}
                onChange={(e) => setEditMinStockValue(Number(e.target.value))}
                className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold border-b-2"
                autoFocus
              />
              <button onClick={() => onSaveMinStock(editMinStockValue)} className="p-1 text-emerald-500"><CheckCircle2 className="w-4 h-4" /></button>
              <button onClick={onCancelEdit} className="p-1 text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            {minStockError && <p className="text-[10px] text-red-500 font-bold">{minStockError}</p>}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 text-xs">{(ing.minStock ?? 0).toLocaleString()} {ing.unit}</span>
            <button onClick={onEditStart} className="p-1 text-slate-300 hover:text-primary transition-colors"><Pencil className="w-3 h-3" /></button>
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="text-xs font-bold text-slate-700">{formatCurrency(ing.averageCostPerUnit)}</div>
        <div className="text-[10px] text-slate-400 font-medium">per {ing.unit}</div>
      </td>
      <td className="px-6 py-4">
        {ing.lastPurchasePrice ? (
          <>
            <div className="text-xs font-bold text-slate-700">{formatCurrency(ing.lastPurchasePrice)}</div>
            <div className="text-[10px] text-slate-400 font-medium">per {ing.unit}</div>
          </>
        ) : (
          <span className="text-slate-300">-</span>
        )}
      </td>
      <td className="px-6 py-4">
        {isOut ? (
          <span className="px-2 py-1 bg-red-50 text-red-600 rounded text-[10px] font-black uppercase tracking-wider whitespace-nowrap">HABIS</span>
        ) : isLow ? (
          <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded text-[10px] font-black uppercase tracking-wider whitespace-nowrap">MENIPIS</span>
        ) : (
          <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[10px] font-black uppercase tracking-wider whitespace-nowrap">NORMAL</span>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button onClick={onEdit} className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-primary active:scale-95 transition-all" title="Edit Bahan"><Pencil className="w-4 h-4" /></button>
          <button onClick={onPackaging} className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-primary active:scale-95 transition-all" title="Kelola Kemasan"><Box className="w-4 h-4" /></button>
          <button onClick={onRestock} className="px-3 py-1.5 bg-primary text-white rounded-lg text-[10px] font-bold hover:bg-primary-dark active:scale-95 flex items-center gap-1.5 whitespace-nowrap"><Plus className="w-3 h-3" /> BELANJA</button>
        </div>
      </td>
    </tr>
  );
}

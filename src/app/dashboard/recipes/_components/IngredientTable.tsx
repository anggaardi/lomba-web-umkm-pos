import React from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { type Product, type Ingredient, type RecipeItem } from "../types";

interface IngredientTableProps {
  product: Product;
  ingredients: Ingredient[];
}

export function IngredientTable({ product, ingredients }: IngredientTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-[#F8FAFC]/50 border-b border-slate-100">
          <tr>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Bahan Baku</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Takaran per Porsi</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Stok di Gudang</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {product.recipes.map((r: RecipeItem) => {
            const ing = ingredients.find(i => i.id === r.ingredientId);
            const isLow = ing && ing.stock < r.quantity;
            return (
              <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-6">
                  <p className="font-bold text-slate-700 uppercase text-xs tracking-tight">{r.ingredientName}</p>
                </td>
                <td className="px-6 py-6 text-right">
                  <p className="font-bold text-slate-600 font-mono text-xs">{r.quantity.toFixed(2)} {r.unit}</p>
                </td>
                <td className="px-6 py-6 text-right">
                  <p className="font-bold text-slate-600 font-mono text-xs">{ing ? `${ing.stock.toFixed(1)} ${r.unit}` : "-"}</p>
                </td>
                <td className="px-6 py-6">
                  <div className="flex justify-center">
                    {isLow ? (
                      <div className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500" title="Stok Menipis - Mohon isi ulang">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500" title="Stok Mencukupi">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

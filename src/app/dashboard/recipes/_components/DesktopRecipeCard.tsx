import React from "react";
import Image from "next/image";
import { CheckCircle2, AlertTriangle, UtensilsCrossed } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { type Product, type Ingredient, type RecipeItem } from "../types";

interface DesktopRecipeCardProps {
  product: Product;
  ingredients: Ingredient[];
  router: any;
  onDelete: (id: string) => void;
}

export function DesktopRecipeCard({ product, ingredients, router, onDelete }: DesktopRecipeCardProps) {
  let hpp = 0;
  let isComplete = product.recipes.length > 0;
  let outOfStockCount = 0;

  product.recipes.forEach((r: RecipeItem) => {
    const ing = ingredients.find((i: Ingredient) => i.id === r.ingredientId);
    if (ing) {
      hpp += Number(ing.averageCostPerUnit) * r.quantity;
      if (ing.stock < r.quantity) {
        isComplete = false;
        outOfStockCount++;
      }
    } else {
      isComplete = false;
      outOfStockCount++;
    }
  });

  const margin = product.price > 0 ? ((product.price - hpp) / product.price) * 100 : 0;

  return (
    <div
      onClick={() => router.push(`/dashboard/recipes/${product.id}`)}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:border-primary/30 hover:shadow-md transition-all group cursor-pointer relative"
    >
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 relative overflow-hidden">
            {product.image ? (
              <Image src={product.image} alt={product.name} fill className="object-cover" unoptimized />
            ) : (
              <UtensilsCrossed className="w-8 h-8" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="truncate">
                <h3 className="text-lg font-bold text-slate-800 truncate">{product.name}</h3>
                <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">SKU: PRD-{product.id.slice(0, 4).toUpperCase()}</p>
              </div>
              {isComplete ? (
                <span className="shrink-0 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded text-[10px] font-black uppercase tracking-widest h-fit">Lengkap</span>
              ) : (
                <span className="shrink-0 px-2.5 py-1 bg-yellow-50 text-yellow-600 rounded text-[10px] font-black uppercase tracking-widest h-fit">Belum Lengkap</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 bg-slate-50/30 flex-1 flex flex-col">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">BAHAN BAKU & STOK</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {product.recipes.length > 0 ? (
            product.recipes.map((r: RecipeItem) => {
              const ing = ingredients.find((i: Ingredient) => i.id === r.ingredientId);
              const isStockSufficient = ing && ing.stock >= r.quantity;
              return (
                <span key={r.id} className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isStockSufficient ? "bg-emerald-500" : "bg-red-500"}`} />
                  {r.ingredientName}
                </span>
              );
            })
          ) : (
            <span className="text-xs italic text-slate-400">Belum ada bahan baku diatur</span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6 pt-5 border-t border-dashed border-slate-200">
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">HPP</p><p className="text-sm font-bold text-slate-800">{formatCurrency(hpp)}</p></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">HARGA JUAL</p><p className="text-sm font-bold text-slate-800">{formatCurrency(product.price)}</p></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">MARGIN</p><p className={cn("text-sm font-bold", margin > 0 ? "text-emerald-600" : margin < 0 ? "text-red-600" : "text-slate-600")}>{margin.toFixed(1)}%</p></div>
        </div>

        <div className="flex items-center justify-between gap-4 mt-auto pt-5 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold">
            {isComplete ? (
              <><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span className="text-emerald-600">Bahan Lengkap</span></>
            ) : (
              <><AlertTriangle className="w-4 h-4 text-red-500" /><span className="text-red-500">{product.recipes.length === 0 ? "Resep kosong" : `${outOfStockCount} bahan kurang`}</span></>
            )}
          </div>
          <div className="flex items-center gap-2 z-10">
            <button 
              onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/recipes/${product.id}/edit`); }} 
              className="px-4 py-2 border border-blue-200 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold transition-colors"
            >
              Edit
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(product.id); }} 
              className="px-4 py-2 border border-red-200 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

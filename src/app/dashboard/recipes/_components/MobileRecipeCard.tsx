import React from "react";
import Image from "next/image";
import { UtensilsCrossed, Clock, Eye, Edit, Trash2 } from "lucide-react";
import { type Product, type Ingredient, type RecipeItem } from "../types";

interface MobileRecipeCardProps {
  product: Product;
  ingredients: Ingredient[];
  router: any;
}

export function MobileRecipeCard({ product, ingredients, router }: MobileRecipeCardProps) {
  let isComplete = product.recipes.length > 0;
  product.recipes.forEach((r: RecipeItem) => {
    const ing = ingredients.find((i: Ingredient) => i.id === r.ingredientId);
    if (!ing || ing.stock < r.quantity) isComplete = false;
  });

  return (
    <div className="bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all hover:shadow-md group">
      <div className="p-5 flex gap-4">
        <div className="w-24 h-24 rounded-2xl bg-gray-100 shrink-0 relative overflow-hidden shadow-inner">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill className="object-cover" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <UtensilsCrossed className="w-8 h-8" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 py-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-base font-black text-gray-900 truncate tracking-tight">{product.name}</h3>
            {isComplete ? (
              <span className="shrink-0 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-black uppercase tracking-wider border border-emerald-100">LENGKAP</span>
            ) : (
              <span className="shrink-0 px-2 py-0.5 bg-red-50 text-red-500 rounded-md text-[9px] font-black uppercase tracking-wider border border-red-100">STOK HABIS</span>
            )}
          </div>
          <p className="text-[10px] font-bold text-gray-400">SKU: {product.id.slice(0, 8).toUpperCase()}</p>
          <div className="flex items-center gap-4 mt-4 text-[10px] font-bold text-gray-500">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" /> 15 Menit</span>
            <span className="flex items-center gap-1.5"><UtensilsCrossed className="w-3.5 h-3.5 text-gray-400" /> Main Course</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 border-t border-gray-50">
        <button 
          onClick={() => router.push(`/dashboard/recipes/${product.id}`)} 
          className="flex items-center justify-center gap-2 py-4 text-xs font-bold text-primary border-r border-gray-50 focus:bg-primary-light transition-colors"
        >
          <Eye className="w-4 h-4" /> Detail
        </button>
        <button 
          onClick={() => router.push(`/dashboard/recipes/${product.id}/edit`)} 
          className="flex items-center justify-center gap-2 py-4 text-xs font-bold text-gray-700 border-r border-gray-50 transition-colors"
        >
          <Edit className="w-3.5 h-3.5" /> Edit
        </button>
        <button className="flex items-center justify-center gap-2 py-4 text-xs font-bold text-red-500 transition-colors">
          <Trash2 className="w-3.5 h-3.5" /> Hapus
        </button>
      </div>
    </div>
  );
}

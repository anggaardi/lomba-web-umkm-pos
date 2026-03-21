"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  ScrollText,
  UtensilsCrossed,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type RecipeItem = {
  id: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  recipes: RecipeItem[];
};

type Ingredient = {
  id: string;
  name: string;
  stock: number;
  unit: string;
  averageCostPerUnit: number;
};

interface RecipesClientProps {
  initialProducts: Product[];
  initialIngredients: Ingredient[];
}

export default function RecipesClient({
  initialProducts,
  initialIngredients,
}: RecipesClientProps) {
  const [products] = useState<Product[]>(initialProducts);
  const [ingredients] = useState<Ingredient[]>(initialIngredients);
  const router = useRouter();

  const recipeStats = useMemo(() => {
    const total = products.length;
    let complete = 0;
    let incomplete = 0;
    products.forEach((p) => {
      if (p.recipes.length === 0) {
        incomplete++;
        return;
      }
      let isComplete = true;
      p.recipes.forEach((r) => {
        const ing = ingredients.find((i) => i.id === r.ingredientId);
        if (!ing || ing.stock < r.quantity) {
          isComplete = false;
        }
      });
      if (isComplete) complete++;
      else incomplete++;
    });
    return { total, complete, incomplete };
  }, [products, ingredients]);

  return (
    <div className="space-y-6 pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Resep Produk</h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola resep produk untuk otomatisasi pengurangan stok bahan baku
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/recipes/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF724C] hover:bg-[#E56543] text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Tambah Resep Baru
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <ScrollText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
              TOTAL RESEP
            </p>
            <p className="text-2xl font-bold text-slate-800">
              {recipeStats.total}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
              RESEP LENGKAP
            </p>
            <p className="text-2xl font-bold text-slate-800">
              {recipeStats.complete}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
              BELUM LENGKAP
            </p>
            <p className="text-2xl font-bold text-slate-800">
              {recipeStats.incomplete}
            </p>
          </div>
        </div>
      </div>

      {/* Recipe Cards */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
          <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-bold">
            Belum ada resep produk.
          </p>
          <Link
            href="/dashboard/recipes/new"
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF724C] hover:bg-[#E56543] text-white rounded-xl text-sm font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Tambah Resep Pertama
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((p) => {
            let hpp = 0;
            let isComplete = p.recipes.length > 0;
            let outOfStockCount = 0;

            p.recipes.forEach((r) => {
              const ing = ingredients.find((i) => i.id === r.ingredientId);
              if (ing) {
                hpp += ing.averageCostPerUnit * r.quantity;
                if (ing.stock < r.quantity) {
                  isComplete = false;
                  outOfStockCount++;
                }
              } else {
                isComplete = false;
                outOfStockCount++;
              }
            });

            const margin = p.price > 0 ? ((p.price - hpp) / p.price) * 100 : 0;
            const sku = `PRD-${p.id.slice(0, 4).toUpperCase()}`;
            const defaultTime = "15 Menit";
            const defaultCategory = "Main Course";

            return (
              <div
                key={p.id}
                onClick={() => router.push(`/dashboard/recipes/${p.id}`)}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:border-[#FF724C]/30 hover:shadow-md transition-all group cursor-pointer relative"
              >
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 relative overflow-hidden">
                      {p.image ? (
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <UtensilsCrossed className="w-8 h-8" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="truncate">
                          <h3 className="text-lg font-bold text-slate-800 truncate">
                            {p.name}
                          </h3>
                          <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
                            SKU: {sku}
                          </p>
                          <div className="flex items-center gap-3 mt-3 text-xs font-bold text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-slate-400" />{" "}
                              {defaultTime}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <UtensilsCrossed className="w-4 h-4 text-slate-400" />{" "}
                              {defaultCategory}
                            </span>
                          </div>
                        </div>
                        {isComplete ? (
                          <span className="shrink-0 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded text-[10px] font-black uppercase tracking-widest flex items-center h-fit">
                            Lengkap
                          </span>
                        ) : (
                          <span className="shrink-0 px-2.5 py-1 bg-yellow-50 text-yellow-600 rounded text-[10px] font-black uppercase tracking-widest flex items-center h-fit">
                            Belum Lengkap
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-5 bg-slate-50/30 flex-1 flex flex-col">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    BAHAN BAKU & STOK
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {p.recipes.length > 0 ? (
                      p.recipes.map((r) => {
                        const ing = ingredients.find(
                          (i) => i.id === r.ingredientId
                        );
                        const isStockSufficient =
                          ing && ing.stock >= r.quantity;
                        return (
                          <span
                            key={r.id}
                            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-2"
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                isStockSufficient
                                  ? "bg-emerald-500"
                                  : "bg-red-500"
                              }`}
                            />
                            {r.ingredientName}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs italic text-slate-400">
                        Belum ada bahan baku diatur
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6 pt-5 border-t border-dashed border-slate-200">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                        HPP
                      </p>
                      <p className="text-sm font-bold text-slate-800">
                        Rp{" "}
                        {hpp.toLocaleString("id-ID", {
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                        HARGA JUAL
                      </p>
                      <p className="text-sm font-bold text-slate-800">
                        Rp{" "}
                        {p.price.toLocaleString("id-ID", {
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                        MARGIN
                      </p>
                      <p
                        className={`text-sm font-bold ${
                          margin > 0
                            ? "text-emerald-600"
                            : margin < 0
                            ? "text-red-600"
                            : "text-slate-600"
                        }`}
                      >
                        {margin.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto pt-5 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      {isComplete ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="text-emerald-600">
                            Bahan Lengkap
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-red-500">
                            {p.recipes.length === 0
                              ? "Resep kosong"
                              : `${outOfStockCount} bahan stok habis / kurang`}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/recipes/${p.id}/edit`);
                        }}
                        className="px-4 py-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-all relative z-10"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="px-4 py-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-all opacity-50 cursor-not-allowed relative z-10"
                        title="Fungsi hapus belum tersedia"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

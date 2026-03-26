"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  ScrollText,
  UtensilsCrossed,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  ChevronRight,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useMobileSearch } from "@/hooks/useMobileSearch";

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
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Connect to mobile header search
  useMobileSearch(useCallback((q) => setSearchQuery(q), []));

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

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
    <div className="space-y-6 pb-24 lg:pb-10">
      {/* Mobile-only header and search are now handled by MobileHeader component */}


      {/* --- DESKTOP HEADER (Desktop Only) --- */}
      <div className="hidden lg:flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Resep Produk</h1>
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

      {/* --- STATS CARDS (RESPONSIVE) --- */}
      {/* Mobile Stats Scroll */}
      <div className="lg:hidden flex overflow-x-auto gap-4 pb-2 -mx-4 px-4 no-scrollbar">
        <div className="min-w-[140px] flex-1 bg-white p-5 rounded-3xl shadow-sm border border-slate-50 flex flex-col">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 italic">TOTAL RESEP</p>
          <div className="flex items-end gap-1">
            <p className="text-3xl font-black text-[#FF724C]">{recipeStats.total}</p>
            <span className="text-xs font-bold text-slate-400 pb-1">Item</span>
          </div>
        </div>
        <div className="min-w-[140px] flex-1 bg-[#E7FDF2] p-5 rounded-3xl shadow-sm border border-emerald-50 flex flex-col">
          <p className="text-[10px] font-black text-emerald-800/60 uppercase tracking-widest mb-4 italic">LENGKAP</p>
          <div className="flex items-end gap-1">
            <p className="text-3xl font-black text-emerald-600">{recipeStats.complete}</p>
            <span className="text-xs font-bold text-emerald-800/60 pb-1">Menu</span>
          </div>
        </div>
        <div className="min-w-[140px] flex-1 bg-[#FFEFEB] p-5 rounded-3xl shadow-sm border border-red-50 flex flex-col">
          <p className="text-[10px] font-black text-red-800/60 uppercase tracking-widest mb-4 italic">BELUM LENGKAP</p>
          <div className="flex items-end gap-1">
            <p className="text-3xl font-black text-red-500">{recipeStats.incomplete}</p>
            <span className="text-xs font-bold text-red-800/60 pb-1">Draf</span>
          </div>
        </div>
      </div>

      {/* Desktop Stats Grid */}
      <div className="hidden lg:grid grid-cols-1 md:grid-cols-3 gap-6">
        <DesktopStatCard icon={ScrollText} label="TOTAL RESEP" value={recipeStats.total} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <DesktopStatCard icon={CheckCircle2} label="RESEP LENGKAP" value={recipeStats.complete} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <DesktopStatCard icon={AlertTriangle} label="BELUM LENGKAP" value={recipeStats.incomplete} iconBg="bg-yellow-50" iconColor="text-yellow-600" />
      </div>

      {/* --- PRODUCT LIST --- */}
      <div className="flex items-center justify-between lg:hidden pt-2">
        <h2 className="text-lg font-black text-gray-900 tracking-tight">Daftar Resep</h2>
        <button className="text-sm font-bold text-[#FF724C]">Lihat Semua</button>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
          <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-bold">Belum ada resep produk.</p>
        </div>
      ) : (
        <>
          {/* Mobile Recipe Cards (Layout from Image) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:hidden">
            {filteredProducts.map((p) => (
              <MobileRecipeCard 
                key={p.id} 
                p={p} 
                ingredients={ingredients} 
                router={router} 
              />
            ))}
          </div>

          {/* Desktop Recipe Cards (Original Layout) */}
          <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <DesktopRecipeCard 
                key={p.id} 
                p={p} 
                ingredients={ingredients} 
                router={router} 
              />
            ))}
          </div>
        </>
      )}

      {/* Floating Action Button (Mobile Only) */}
      <Link
        href="/dashboard/recipes/new"
        className="fixed bottom-24 right-6 w-14 h-14 bg-[#FF724C] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#FF724C]/40 lg:hidden z-30 active:scale-95 transition-transform"
      >
        <Plus className="w-8 h-8 font-black" />
      </Link>
    </div>
  );
}

// Sub-components to keep code clean and maintain different layouts
function DesktopStatCard({ icon: Icon, label, value, iconBg, iconColor }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconBg, iconColor)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function MobileRecipeCard({ p, ingredients, router }: any) {
  let isComplete = p.recipes.length > 0;
  p.recipes.forEach((r: any) => {
    const ing = ingredients.find((i: any) => i.id === r.ingredientId);
    if (!ing || ing.stock < r.quantity) isComplete = false;
  });

  return (
    <div className="bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all hover:shadow-md group">
      <div className="p-5 flex gap-4">
        <div className="w-24 h-24 rounded-2xl bg-gray-100 shrink-0 relative overflow-hidden shadow-inner">
          {p.image ? (
            <Image src={p.image} alt={p.name} fill className="object-cover" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <UtensilsCrossed className="w-8 h-8" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 py-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-base font-black text-gray-900 truncate tracking-tight">{p.name}</h3>
            {isComplete ? (
              <span className="shrink-0 px-2 py-0.5 bg-[#E7FDF2] text-emerald-600 rounded-md text-[9px] font-black uppercase tracking-wider border border-emerald-100">LENGKAP</span>
            ) : (
              <span className="shrink-0 px-2 py-0.5 bg-red-50 text-red-500 rounded-md text-[9px] font-black uppercase tracking-wider border border-red-100">STOK HABIS</span>
            )}
          </div>
          <p className="text-[10px] font-bold text-gray-400">SKU: {p.id.slice(0, 8).toUpperCase()}</p>
          <div className="flex items-center gap-4 mt-4 text-[10px] font-bold text-gray-500">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" /> 15 Menit</span>
            <span className="flex items-center gap-1.5"><UtensilsCrossed className="w-3.5 h-3.5 text-gray-400" /> Main Course</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 border-t border-gray-50">
        <button onClick={() => router.push(`/dashboard/recipes/${p.id}`)} className="flex items-center justify-center gap-2 py-4 text-xs font-bold text-[#FF724C] border-r border-gray-50 focus:bg-[#FFEFEB] transition-colors"><Eye className="w-4 h-4" /> Detail</button>
        <button onClick={() => router.push(`/dashboard/recipes/${p.id}/edit`)} className="flex items-center justify-center gap-2 py-4 text-xs font-bold text-gray-700 border-r border-gray-50 transition-colors"><Edit className="w-3.5 h-3.5" /> Edit</button>
        <button className="flex items-center justify-center gap-2 py-4 text-xs font-bold text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /> Hapus</button>
      </div>
    </div>
  );
}

function DesktopRecipeCard({ p, ingredients, router }: any) {
  let hpp = 0;
  let isComplete = p.recipes.length > 0;
  let outOfStockCount = 0;

  p.recipes.forEach((r: any) => {
    const ing = ingredients.find((i: any) => i.id === r.ingredientId);
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

  return (
    <div
      onClick={() => router.push(`/dashboard/recipes/${p.id}`)}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:border-[#FF724C]/30 hover:shadow-md transition-all group cursor-pointer relative"
    >
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 relative overflow-hidden">
            {p.image ? (
              <Image src={p.image} alt={p.name} fill className="object-cover" unoptimized />
            ) : (
              <UtensilsCrossed className="w-8 h-8" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="truncate">
                <h3 className="text-lg font-bold text-slate-800 truncate">{p.name}</h3>
                <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">SKU: PRD-{p.id.slice(0, 4).toUpperCase()}</p>
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
          {p.recipes.length > 0 ? (
            p.recipes.map((r: any) => {
              const ing = ingredients.find((i: any) => i.id === r.ingredientId);
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
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">HPP</p><p className="text-sm font-bold text-slate-800">Rp {hpp.toLocaleString("id-ID")}</p></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">HARGA JUAL</p><p className="text-sm font-bold text-slate-800">Rp {p.price.toLocaleString("id-ID")}</p></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">MARGIN</p><p className={cn("text-sm font-bold", margin > 0 ? "text-emerald-600" : margin < 0 ? "text-red-600" : "text-slate-600")}>{margin.toFixed(1)}%</p></div>
        </div>

        <div className="flex items-center justify-between gap-4 mt-auto pt-5 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold">
            {isComplete ? (
              <><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span className="text-emerald-600">Bahan Lengkap</span></>
            ) : (
              <><AlertTriangle className="w-4 h-4 text-red-500" /><span className="text-red-500">{p.recipes.length === 0 ? "Resep kosong" : `${outOfStockCount} bahan kurang`}</span></>
            )}
          </div>
          <div className="flex items-center gap-2 z-10">
            <button onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/recipes/${p.id}/edit`); }} className="px-4 py-2 border border-blue-200 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold transition-colors">Edit</button>
            <button onClick={(e) => { e.stopPropagation(); }} className="px-4 py-2 border border-red-200 bg-red-50 text-red-600 rounded-lg text-xs font-bold opacity-50 cursor-not-allowed">Hapus</button>
          </div>
        </div>
      </div>
    </div>
  );
}

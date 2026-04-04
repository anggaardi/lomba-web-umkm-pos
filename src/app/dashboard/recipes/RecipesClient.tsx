"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  ScrollText,
  UtensilsCrossed,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useMobileSearch } from "@/hooks/useMobileSearch";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { type Product, type Ingredient } from "./types";
import { RecipeStatCard } from "./_components/RecipeStatCard";
import { MobileRecipeCard } from "./_components/MobileRecipeCard";
import { DesktopRecipeCard } from "./_components/DesktopRecipeCard";

interface RecipesClientProps {
  initialProducts: Product[];
  initialIngredients: Ingredient[];
}

export default function RecipesClient({
  initialProducts,
  initialIngredients,
}: RecipesClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [ingredients] = useState<Ingredient[]>(initialIngredients);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // Connect to mobile header search
  useMobileSearch(useCallback((q) => setSearchQuery(q), []));

  const initiateDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/inventory/recipes/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus resep");
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      toast.success("Resep berhasil dihapus");
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat menghapus resep");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteId]);

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
      <ToastContainer />
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
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95"
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
            <p className="text-3xl font-black text-primary">{recipeStats.total}</p>
            <span className="text-xs font-bold text-slate-400 pb-1">Item</span>
          </div>
        </div>
        <div className="min-w-[140px] flex-1 bg-emerald-50 p-5 rounded-3xl shadow-sm border border-emerald-100 flex flex-col">
          <p className="text-[10px] font-black text-emerald-800/60 uppercase tracking-widest mb-4 italic">LENGKAP</p>
          <div className="flex items-end gap-1">
            <p className="text-3xl font-black text-emerald-600">{recipeStats.complete}</p>
            <span className="text-xs font-bold text-emerald-800/60 pb-1">Menu</span>
          </div>
        </div>
        <div className="min-w-[140px] flex-1 bg-primary-light p-5 rounded-3xl shadow-sm border border-red-50 flex flex-col">
          <p className="text-[10px] font-black text-red-800/60 uppercase tracking-widest mb-4 italic">BELUM LENGKAP</p>
          <div className="flex items-end gap-1">
            <p className="text-3xl font-black text-red-500">{recipeStats.incomplete}</p>
            <span className="text-xs font-bold text-red-800/60 pb-1">Draf</span>
          </div>
        </div>
      </div>

      {/* Desktop Stats Grid */}
      <div className="hidden lg:grid grid-cols-1 md:grid-cols-3 gap-6">
        <RecipeStatCard icon={ScrollText} label="TOTAL RESEP" value={recipeStats.total} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <RecipeStatCard icon={CheckCircle2} label="RESEP LENGKAP" value={recipeStats.complete} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <RecipeStatCard icon={AlertTriangle} label="BELUM LENGKAP" value={recipeStats.incomplete} iconBg="bg-yellow-50" iconColor="text-yellow-600" />
      </div>

      {/* --- PRODUCT LIST --- */}
      <div className="flex items-center justify-between lg:hidden pt-2">
        <h2 className="text-lg font-black text-gray-900 tracking-tight">Daftar Resep</h2>
        <button className="text-sm font-bold text-primary">Lihat Semua</button>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
          <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-bold">Belum ada resep produk.</p>
        </div>
      ) : (
        <>
          {/* Mobile Recipe Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:hidden">
            {filteredProducts.map((p) => (
              <MobileRecipeCard 
                key={p.id} 
                product={p} 
                ingredients={ingredients} 
                router={router}
                onDelete={initiateDelete}
              />
            ))}
          </div>

          {/* Desktop Recipe Cards */}
          <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <DesktopRecipeCard 
                key={p.id} 
                product={p} 
                ingredients={ingredients} 
                router={router}
                onDelete={initiateDelete}
              />
            ))}
          </div>
        </>
      )}

      {/* Floating Action Button (Mobile Only) */}
      <Link
        href="/dashboard/recipes/new"
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/40 lg:hidden z-30 active:scale-95 transition-transform"
      >
        <Plus className="w-8 h-8 font-black" />
      </Link>

      {/* Custom Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Hapus Resep?</h3>
            <p className="text-sm text-slate-500 mb-6 px-2">
              Tindakan ini tidak bisa dibatalkan, namun histori transaksi terkait resep ini akan tetap aman.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center"
              >
                {isDeleting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Ya, Hapus"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

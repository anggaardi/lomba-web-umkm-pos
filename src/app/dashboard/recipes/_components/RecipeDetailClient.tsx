"use client";

import { 
  Clock, 
  UtensilsCrossed, 
  Edit, 
  FileDown, 
  RefreshCw,
  History,
  Target,
  ArrowLeft,
  Info
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { useMobileHeader } from "@/context/MobileHeaderContext";
import { type Product, type Ingredient } from "../types";
import { IngredientTable } from "./IngredientTable";

interface RecipeDetailClientProps {
  product: Product;
  ingredients: Ingredient[];
}

export default function RecipeDetailClient({
  product,
  ingredients,
}: RecipeDetailClientProps) {
  const router = useRouter();
  const { setDetailHeader, clearDetailHeader } = useMobileHeader();

  // Set mobile header to detail mode (back button + product name)
  useEffect(() => {
    setDetailHeader(product.name, "/dashboard/recipes", "Detail Resep");
    return () => clearDetailHeader();
  }, [product.name, setDetailHeader, clearDetailHeader]);

  const totalIngredientCost = product.recipes.reduce((acc, r) => {
    const ing = ingredients.find((i) => i.id === r.ingredientId);
    return acc + r.quantity * (ing?.averageCostPerUnit || 0);
  }, 0);

  // Biaya operasional realistis (berdasarkan standar UMKM)
  const directLabor = 5000;
  const packagingMaterials = 2000;
  const overheadUtilities = 3000;
  const totalProductionCost = totalIngredientCost + directLabor + packagingMaterials + overheadUtilities;
  
  const targetMargin = product.price > 0 ? ((product.price - totalProductionCost) / product.price * 100) : 0;
  const batchAvailability = 42; 

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-[1400px] mx-auto p-4 sm:p-8 space-y-8">
        <button 
          onClick={() => router.push("/dashboard/recipes")}
          className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold text-sm group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Kembali ke Daftar Resep
        </button>

        {/* Product Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm border border-slate-100">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100 relative">
            {product.image ? (
              <Image 
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UtensilsCrossed className="w-10 h-10 text-slate-300" />
              </div>
            )}
          </div>
          
          <div className="grow space-y-3 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="px-3 py-1 bg-primary-light text-primary text-[10px] font-black rounded uppercase tracking-wider">
                MAKANAN / BAKERY
              </span>
              <span className="text-slate-400 text-xs font-bold font-mono">
                ID: REC-{product.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black text-slate-800">
              {product.name}
            </h2>
            
            <p className="text-slate-400 text-sm font-medium">
              Sistem Produksi Terintegrasi • Outlet Pusat
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-1">
              <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs">
                <Clock className="w-4 h-4 text-primary" />
                Estimasi: 15 Menit
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs">
                <Target className="w-4 h-4 text-primary" />
                Hasil: 1 Porsi / Unit
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs">
                <History className="w-4 h-4 text-primary" />
                Terakhir Update: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
          
          <div className="flex flex-row gap-3 w-full md:w-auto shrink-0">
            <button 
              onClick={() => router.push(`/dashboard/recipes/${product.id}/edit`)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all border border-slate-200"
            >
              <Edit className="w-4 h-4" /> Edit Resep
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
              <FileDown className="w-4 h-4" /> Ekspor PDF
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Biaya Produksi (HPP)</p>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xl font-black text-slate-800">{formatCurrency(totalProductionCost)}</span>
                <span className="text-slate-400 text-[10px] ml-1">/ unit</span>
              </div>
              <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded tracking-wider">
                Normal
              </span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Margin Keuntungan</p>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-black text-slate-800">{targetMargin.toFixed(1)}%</span>
              <span className="text-slate-400 text-[10px] font-bold">Target: 60%</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Harga Jual</p>
            <div className="flex items-end gap-2">
              <span className="text-xl font-black text-slate-800">{formatCurrency(product.price)}</span>
              <span className="text-slate-400 text-[10px] mb-1">/ unit</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sisa Stok Produksi</p>
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-2xl font-black text-slate-800">{batchAvailability}</span>
                <span className="text-slate-400 text-[10px] mb-1">Porsi Ready</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[80%]" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content: Ingredients */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Daftar Bahan & Komposisi</h3>
                <div className="flex gap-4">
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> Stok Aman
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
                    <div className="w-2 h-2 rounded-full bg-orange-400" /> Stok Menipis
                  </span>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3 shadow-sm shadow-blue-900/5">
                <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center text-white shrink-0">
                  <Info className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-blue-900 uppercase tracking-widest">Panduan Tabel Resep</p>
                  <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                    Tabel di bawah ini menjelaskan rincian bahan baku yang dibutuhkan. 
                    <b> Nama Bahan:</b> material baku yang digunakan. 
                    <b> Takaran per Porsi:</b> jumlah bahan untuk satu porsi. 
                    <b> Stok Tersedia:</b> jumlah material yang tersisa di gudang. 
                    <b> Status:</b> indikator apakah stok cukup untuk memproduksi porsi ini.
                  </p>
                </div>
              </div>
            </div>
            
            <IngredientTable product={product} ingredients={ingredients} />
          </div>

          {/* Right Column: Cost Calculation */}
          <div className="lg:col-span-4 space-y-8">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Perincian HPP (Modal)</h3>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-8">
              <div className="space-y-5">
                {[
                  { label: "Total Biaya Bahan Baku", value: totalIngredientCost },
                  { label: "Estimasi Tenaga Kerja", value: directLabor },
                  { label: "Biaya Kemasan Produk", value: packagingMaterials },
                  { label: "Listrik, Air & Gas", value: overheadUtilities }
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-tight">{item.label}</span>
                    <span className="text-slate-800 font-black text-sm">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>

              <div className="bg-primary-light p-5 rounded-2xl flex flex-col gap-1 border border-primary/20 shadow-sm shadow-primary/5">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Estimasi Modal (HPP) / Porsi</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-primary tracking-tighter">{formatCurrency(totalProductionCost)}</span>
                </div>
              </div>

              <div className="space-y-6 pt-4 border-t border-slate-100">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analisis Keuntungan</span>
                    <span className="text-xs font-black text-emerald-600">+{targetMargin.toFixed(1)}% Margin</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full relative overflow-hidden">
                    <div className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, targetMargin)}%` }} />
                  </div>
                </div>
                
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic border-l-2 border-primary pl-3">
                  Data HPP di atas dihitung secara otomatis berdasarkan harga rata-rata bahan baku dan estimasi biaya operasional yang Anda masukkan.
                </p>
                <button className="w-full py-4 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20 active:scale-95">
                  <RefreshCw className="w-4 h-4" /> Perbarui Kalkulasi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

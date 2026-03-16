"use client";

import { 
  Box, 
  Clock, 
  UtensilsCrossed, 
  Edit, 
  FileDown, 
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  History,
  Target,
  ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
  recipes: RecipeItem[];
};

type Ingredient = {
  id: string;
  name: string;
  stock: number;
  unit: string;
  averageCostPerUnit: number;
};

interface RecipeDetailClientProps {
  product: Product;
  ingredients: Ingredient[];
}

export default function RecipeDetailClient({
  product,
  ingredients,
}: RecipeDetailClientProps) {
  const router = useRouter();

  const totalIngredientCost = product.recipes.reduce((acc, r) => {
    const ing = ingredients.find((i) => i.id === r.ingredientId);
    return acc + r.quantity * (ing?.averageCostPerUnit || 0);
  }, 0);

  const directLabor = 0.85;
  const packagingMaterials = 0.35;
  const overheadUtilities = 0.55;
  const totalProductionCost = totalIngredientCost + directLabor + packagingMaterials + overheadUtilities;
  
  const targetMargin = 68;
  const retailPrice = product.price;
  const batchAvailability = 42;

  return (
    <div className="min-h-screen bg-[#F1F5F9]/50 pb-16">
      <div className="max-w-[1400px] mx-auto p-4 sm:p-8 space-y-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-[#FF724C] transition-colors font-bold text-sm group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Kembali ke Inventaris
        </button>

        {/* Product Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm border border-slate-100">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
            <img 
              src="https://images.unsplash.com/photo-1585478259715-876a6a81fc08?q=80&w=1000&auto=format&fit=crop" 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="grow space-y-3 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="px-3 py-1 bg-[#FFF0EB] text-[#FF724C] text-[10px] font-black rounded uppercase tracking-wider">
                BAKERY
              </span>
              <span className="text-slate-400 text-xs font-bold font-mono">
                ID: REC-SOUR-001
              </span>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black text-slate-800">
              {product.name}
            </h2>
            
            <p className="text-slate-400 text-sm font-medium">
              Produksi Industrial Jalur A • Pabrik Utara
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-1">
              <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs">
                <Clock className="w-4 h-4 text-[#FF724C]" />
                18j 30m
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs">
                <Target className="w-4 h-4 text-[#FF724C]" />
                Hasil: 12 Unit
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs">
                <History className="w-4 h-4 text-[#FF724C]" />
                Diperbarui 24 Okt 2023
              </div>
            </div>
          </div>
          
          <div className="flex flex-row gap-3 w-full md:w-auto shrink-0">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all border border-slate-200">
              <Edit className="w-4 h-4" /> Edit Resep
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#FF724C] text-white rounded-xl text-sm font-bold hover:bg-[#E65A33] transition-all shadow-lg shadow-[#FF724C]/20">
              <FileDown className="w-4 h-4" /> Ekspor PDF
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Biaya Produksi</p>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-2xl font-black text-slate-800">${totalProductionCost.toFixed(2)}</span>
                <span className="text-slate-400 text-xs ml-2">/ unit</span>
              </div>
              <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded tracking-wider">
                +2.1%
              </span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Margin Target</p>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-black text-slate-800">{targetMargin}%</span>
              <span className="text-slate-400 text-[10px] font-bold">Target: 65%</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Harga Jual</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-black text-slate-800">${product.price.toFixed(2)}</span>
              <span className="text-slate-400 text-xs mb-1">/ unit</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ketersediaan Batch</p>
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-2xl font-black text-slate-800">{batchAvailability}</span>
                <span className="text-slate-400 text-xs mb-1">Batch</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#FF724C] h-full w-[80%]" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content: Ingredients */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Daftar Bahan</h3>
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" /> Tersedia
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
                  <div className="w-2 h-2 rounded-full bg-orange-400" /> Stok Menipis
                </span>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#F8FAFC]/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bahan</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Qty / Batch</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Level Stok</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {product.recipes.map((r, idx) => {
                    const ing = ingredients.find(i => i.id === r.ingredientId);
                    const isLow = idx === 2; // Mimicking the mockup's third item being low
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-6">
                          <p className="font-bold text-slate-700">{r.ingredientName}</p>
                        </td>
                        <td className="px-6 py-6 text-right">
                          <p className="font-bold text-slate-600 font-mono">{(r.quantity * 12).toFixed(2)} {r.unit}</p>
                        </td>
                        <td className="px-6 py-6 text-right">
                          <p className="font-bold text-slate-600 font-mono">{idx === 1 ? "Tanpa Batas" : `${(ing?.stock || 0).toFixed(1)} ${r.unit}`}</p>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex justify-center">
                            {isLow ? (
                              <div className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                                <AlertTriangle className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Cost Calculation */}
          <div className="lg:col-span-4 space-y-8">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Perhitungan Biaya</h3>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-8">
              <div className="space-y-5">
                {[
                  { label: "Bahan Baku", value: totalIngredientCost },
                  { label: "Tenaga Kerja (1.5j)", value: directLabor },
                  { label: "Bahan Kemasan", value: packagingMaterials },
                  { label: "Overhead & Utilitas", value: overheadUtilities }
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold text-sm">{item.label}</span>
                    <span className="text-slate-800 font-black text-sm">${item.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="bg-[#FFF0EB] p-4 rounded-xl flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Biaya Per Unit</span>
                <span className="text-2xl font-black text-[#FF724C]">${totalProductionCost.toFixed(2)}</span>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Penyesuaian Hasil</span>
                    <span className="text-xs font-black text-slate-800">12 Unit</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full relative">
                    <div className="absolute left-0 top-0 h-full w-1/2 bg-[#FF724C] rounded-full" />
                    <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-[3px] border-[#FF724C] rounded-full cursor-pointer shadow-md" />
                  </div>
                </div>
                
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  Total biaya produksi batch diperkirakan sebesar ${ (totalProductionCost * 12).toFixed(2) } berdasarkan tingkat hasil industri standar untuk peralatan Pabrik Utara.
                </p>
                <button className="w-full py-4 bg-[#FF724C] text-white rounded-xl font-bold text-sm hover:bg-[#E65A33] transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#FF724C]/20">
                  <RefreshCw className="w-4 h-4" /> Hitung Ulang Batch
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

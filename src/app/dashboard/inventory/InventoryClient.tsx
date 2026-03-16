"use client";

import { useState, useMemo } from "react";
import { 
  Box, 
  Plus, 
  Search, 
  RefreshCw,
  Edit,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  X,
  ScrollText,
  UtensilsCrossed,
  Clock,
  FileDown,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Packaging = {
  id: string;
  name: string;
  conversionValue: number;
};

type Ingredient = {
  id: string;
  name: string;
  stock: number;
  unit: string;
  averageCostPerUnit: number;
  lastPurchasePrice: number | null;
  updatedAt: string;
  packagings: Packaging[];
};

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

interface InventoryClientProps {
  initialIngredients: Ingredient[];
  initialProducts: Product[];
}

export default function InventoryClient({
  initialIngredients,
  initialProducts,
}: InventoryClientProps) {
  const [activeMainTab, setActiveMainTab] = useState<"ingredients" | "recipes">(
    "ingredients"
  );
  const [ingredients, setIngredients] =
    useState<Ingredient[]>(initialIngredients);
  const [products] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isPackagingModalOpen, setIsPackagingModalOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Purchase form state
  const [purchasePackagingId, setPurchasePackagingId] = useState<string>("");
  const [purchaseQty, setPurchaseQty] = useState<number>(0);
  const [purchaseTotalPrice, setPurchaseTotalPrice] = useState<number>(0);
  const [purchaseCustomValue, setPurchaseCustomValue] = useState<number>(0);
  const [showPriceWarning, setShowPriceWarning] = useState(false);

  // Recipe form state
  const [recipeIngredients, setRecipeIngredients] = useState<
    { ingredientId: string; quantity: number }[]
  >([]);

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/inventory/ingredients");

      if (!res.ok) {
        const text = await res.text();
        console.error("API Error Response:", text);
        try {
          const err = JSON.parse(text);
          throw new Error(err.error || "Gagal mengambil data");
        } catch {
          throw new Error(`Server Error: ${res.status}`);
        }
      }

      const data = await res.json();
      if (data.ingredients) {
        setIngredients(data.ingredients);
      }
    } catch (err: unknown) {
      console.error("Failed to refresh ingredients:", err);
      setError(err instanceof Error ? err.message : "Gagal memuat ulang data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ing) => {
      const matchesSearch = ing.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const isLowStock = ing.stock <= 10;
      const isOutOfStock = ing.stock <= 0;

      if (statusFilter === "Low Stock")
        return matchesSearch && isLowStock && !isOutOfStock;
      if (statusFilter === "Out of Stock") return matchesSearch && isOutOfStock;
      return matchesSearch;
    });
  }, [ingredients, search, statusFilter]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const stats = useMemo(() => {
    const total = ingredients.length;
    const lowStock = ingredients.filter(
      (i) => i.stock > 0 && i.stock <= 10
    ).length;
    const outOfStock = ingredients.filter((i) => i.stock <= 0).length;
    return { total, lowStock, outOfStock };
  }, [ingredients]);

  const openRecipeModal = (product: Product) => {
    setSelectedProduct(product);
    setRecipeIngredients(
      product.recipes.map((r) => ({
        ingredientId: r.ingredientId,
        quantity: r.quantity,
      }))
    );
    setIsRecipeModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Inventory & Recipe
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola stok bahan baku dan resep produk untuk otomatisasi
            pengurangan stok
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeMainTab === "ingredients" && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FF724C] hover:bg-[#E56543] text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Tambah Bahan
            </button>
          )}
          {activeMainTab === "recipes" && (
            <Link
              href="/dashboard/inventory/recipes/new"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FF724C] hover:bg-[#E56543] text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Tambah Resep Baru
            </Link>
          )}
        </div>
      </div>

      {error &&
        !isRecipeModalOpen &&
        !isAddModalOpen &&
        !isRestockModalOpen && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="text-sm font-bold text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto p-1 hover:bg-red-100 rounded-full"
            >
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>
        )}

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveMainTab("ingredients")}
          className={cn(
            "px-6 py-3 text-sm font-bold transition-all relative",
            activeMainTab === "ingredients"
              ? "text-[#FF724C]"
              : "text-slate-400 hover:text-slate-600"
          )}
        >
          Bahan Baku
          {activeMainTab === "ingredients" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF724C]" />
          )}
        </button>
        <button
          onClick={() => setActiveMainTab("recipes")}
          className={cn(
            "px-6 py-3 text-sm font-bold transition-all relative",
            activeMainTab === "recipes"
              ? "text-[#FF724C]"
              : "text-slate-400 hover:text-slate-600"
          )}
        >
          Resep Produk
          {activeMainTab === "recipes" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF724C]" />
          )}
        </button>
      </div>

      {activeMainTab === "ingredients" ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF724C]">
                <Box className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Bahan Baku
                </p>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.total}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Stok Menipis
                </p>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.lowStock}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                <X className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Habis</p>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.outOfStock}
                </p>
              </div>
            </div>
          </div>

          {/* Ingredients Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Cari bahan baku..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-11 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF724C]/20 focus:border-[#FF724C] transition-all"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                  {["All", "Low Stock", "Out of Stock"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setStatusFilter(filter)}
                      className={cn(
                        "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                        statusFilter === filter
                          ? "bg-white text-[#FF724C] shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw
                  className={cn("w-4 h-4", isRefreshing && "animate-spin")}
                />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 text-[10px] uppercase text-slate-500 font-black tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Nama Bahan</th>
                    <th className="px-6 py-4">Stok Saat Ini</th>
                    <th className="px-6 py-4">HPP (Rata-rata)</th>
                    <th className="px-6 py-4">Harga Terakhir</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIngredients.map((ing) => {
                    const isLow = ing.stock > 0 && ing.stock <= 10;
                    const isOut = ing.stock <= 0;
                    return (
                      <tr
                        key={ing.id}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-700">
                            {ing.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            Satuan: {ing.unit} | {ing.packagings?.length || 0} Kemasan
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                          {ing.stock.toLocaleString()} {ing.unit}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-bold text-slate-700">
                            Rp {ing.averageCostPerUnit.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            per {ing.unit}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {ing.lastPurchasePrice ? (
                            <>
                              <div className="text-xs font-bold text-slate-700">
                                Rp {ing.lastPurchasePrice.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium">
                                per {ing.unit}
                              </div>
                            </>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isOut ? (
                            <span className="px-2 py-1 bg-red-50 text-red-600 rounded text-[10px] font-black uppercase tracking-wider">
                              HABIS
                            </span>
                          ) : isLow ? (
                            <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded text-[10px] font-black uppercase tracking-wider">
                              MENIPIS
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[10px] font-black uppercase tracking-wider">
                              NORMAL
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedIngredient(ing);
                                setIsPackagingModalOpen(true);
                              }}
                              className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-[#FF724C] hover:border-[#FF724C]/20 transition-all active:scale-95"
                              title="Kelola Kemasan"
                            >
                              <Box className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedIngredient(ing);
                                setIsRestockModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-[#FF724C] text-white rounded-lg text-[10px] font-bold hover:bg-[#E56543] transition-all active:scale-95 flex items-center gap-1.5"
                            >
                              <Plus className="w-3 h-3" />
                              BELANJA
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Recipes Content */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProducts.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/inventory/recipes/${p.id}`}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-[#FF724C]/30 transition-all group cursor-pointer block"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FFF0EB] flex items-center justify-center text-[#FF724C]">
                    <UtensilsCrossed className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{p.name}</h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      IDR {p.price.toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openRecipeModal(p);
                  }}
                  className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-[#FF724C] hover:border-[#FF724C]/20 transition-all active:scale-90"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  <ScrollText className="w-3 h-3" />
                  Komposisi Bahan
                </div>
                {p.recipes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {p.recipes.map((r) => (
                      <div
                        key={r.id}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-2"
                      >
                        <span className="text-xs font-bold text-slate-700">
                          {r.ingredientName}
                        </span>
                        <span className="text-[10px] font-black text-[#FF724C] bg-[#FFF0EB] px-1.5 py-0.5 rounded">
                          {r.quantity} {r.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic text-slate-400">
                    Belum ada resep yang diatur.
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Recipe Management Modal */}
      {isRecipeModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#FF724C] p-6 flex items-center justify-between text-white">
              <div>
                <h2 className="text-xl font-black">Atur Resep Produk</h2>
                <p className="text-orange-50 text-xs font-bold mt-0.5 uppercase tracking-widest">
                  {selectedProduct.name}
                </p>
              </div>
              <button
                onClick={() => setIsRecipeModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                    Daftar Bahan
                  </h3>
                  <button
                    onClick={() =>
                      setRecipeIngredients([
                        ...recipeIngredients,
                        { ingredientId: "", quantity: 0 },
                      ])
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF724C] text-white rounded-lg text-[10px] font-bold hover:bg-[#E56543] transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    TAMBAH BARIS
                  </button>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                  {recipeIngredients.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group"
                    >
                      <div className="flex-1">
                        <select
                          value={item.ingredientId}
                          onChange={(e) => {
                            const newItems = [...recipeIngredients];
                            newItems[idx].ingredientId = e.target.value;
                            setRecipeIngredients(newItems);
                          }}
                          className="w-full bg-white border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#FF724C]/20"
                        >
                          <option value="">Pilih Bahan Baku</option>
                          {ingredients.map((ing) => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name} ({ing.unit})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24 relative">
                        <input
                          type="number"
                          step="0.01"
                          value={item.quantity || ""}
                          onChange={(e) => {
                            const newItems = [...recipeIngredients];
                            newItems[idx].quantity = Number(e.target.value);
                            setRecipeIngredients(newItems);
                          }}
                          placeholder="Qty"
                          className="w-full bg-white border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#FF724C]/20"
                        />
                      </div>
                      <button
                        onClick={() =>
                          setRecipeIngredients(
                            recipeIngredients.filter((_, i) => i !== idx)
                          )
                        }
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {recipeIngredients.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
                      <p className="text-sm text-slate-400 font-medium italic">
                        Klik tombol &quot;Tambah Baris&quot; untuk mulai
                        mengatur resep.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsRecipeModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
                >
                  BATAL
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={async () => {
                    setIsSubmitting(true);
                    setError(null);
                    try {
                      const res = await fetch("/api/inventory/recipes", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          productId: selectedProduct.id,
                          ingredients: recipeIngredients.filter(
                            (i) => i.ingredientId && i.quantity > 0
                          ),
                        }),
                      });

                      if (!res.ok) {
                        const text = await res.text();
                        try {
                          const err = JSON.parse(text);
                          throw new Error(err.error || "Gagal menyimpan resep");
                        } catch {
                          throw new Error(`Server Error: ${res.status}`);
                        }
                      }

                      setIsRecipeModalOpen(false);
                      window.location.reload(); // Refresh to see changes
                    } catch (err: unknown) {
                      setError(
                        err instanceof Error
                          ? err.message
                          : "Gagal menyimpan resep"
                      );
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="flex-2 py-3 bg-[#FF724C] hover:bg-[#E56543] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#FF724C]/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" /> SIMPAN RESEP
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Ingredient Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#FF724C] p-6 flex items-center justify-between text-white">
              <h2 className="text-xl font-black">Tambah Bahan Baku</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form
              className="p-6 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                setError(null);
                const formData = new FormData(e.currentTarget);
                const data = {
                  name: formData.get("name"),
                  unit: formData.get("unit"),
                  initialStock: Number(formData.get("initialStock")),
                  initialPrice: Number(formData.get("initialPrice")),
                };

                try {
                  const res = await fetch("/api/inventory/ingredients", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                  });

                  if (!res.ok) {
                    const text = await res.text();
                    try {
                      const err = JSON.parse(text);
                      throw new Error(err.error || "Gagal menambah bahan");
                    } catch {
                      throw new Error(`Server Error: ${res.status}`);
                    }
                  }

                  setIsAddModalOpen(false);
                  refreshData();
                } catch (err: unknown) {
                  setError(err instanceof Error ? err.message : String(err));
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">
                  Nama Bahan
                </label>
                <input
                  name="name"
                  required
                  placeholder="Contoh: Kopi Arabica"
                  className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#FF724C]/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">
                    Satuan
                  </label>
                  <input
                    name="unit"
                    required
                    placeholder="gr, ml, pcs"
                    className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#FF724C]/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">
                    Stok Awal
                  </label>
                  <input
                    name="initialStock"
                    type="number"
                    defaultValue="0"
                    className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#FF724C]/20"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">
                  Nilai Stok Awal (Total Harga)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    Rp
                  </span>
                  <input
                    name="initialPrice"
                    type="number"
                    defaultValue="0"
                    placeholder="0"
                    className="w-full bg-slate-50 border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#FF724C]/20"
                  />
                </div>
                <p className="text-[10px] text-slate-400 italic ml-1">
                  *Digunakan untuk menghitung HPP awal
                </p>
              </div>

              {error && (
                <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100">
                  {error}
                </p>
              )}

              <button
                disabled={isSubmitting}
                className="w-full py-4 bg-[#FF724C] hover:bg-[#E56543] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#FF724C]/20 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" /> SIMPAN BAHAN
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Purchase / Restock Modal */}
      {isRestockModalOpen && selectedIngredient && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#FF724C] p-6 flex items-center justify-between text-white">
              <div>
                <h2 className="text-xl font-black">
                  Input Stok Masuk (Belanja)
                </h2>
                <p className="text-orange-50 text-xs font-bold mt-0.5 uppercase tracking-widest">
                  {selectedIngredient.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsRestockModalOpen(false);
                  setPurchasePackagingId("");
                  setPurchaseQty(0);
                  setPurchaseTotalPrice(0);
                  setPurchaseCustomValue(0);
                  setShowPriceWarning(false);
                }}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form
              className="p-6 space-y-6"
              onSubmit={async (e) => {
                e.preventDefault();

                // Price Surge Check
                const selectedPkg = (selectedIngredient.packagings || []).find(
                  (p) => p.id === purchasePackagingId
                );
                const conversion = selectedPkg
                  ? selectedPkg.conversionValue
                  : purchaseCustomValue;
                const totalBaseQty = purchaseQty * conversion;
                const newCostPerUnit = purchaseTotalPrice / totalBaseQty;

                if (selectedIngredient.lastPurchasePrice && !showPriceWarning) {
                  const threshold = 1.5; // 50% increase
                  if (
                    newCostPerUnit >
                    selectedIngredient.lastPurchasePrice * threshold
                  ) {
                    setShowPriceWarning(true);
                    return;
                  }
                }

                setIsSubmitting(true);
                setError(null);

                try {
                  const res = await fetch(
                    "/api/inventory/ingredients/purchase",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        ingredientId: selectedIngredient.id,
                        packagingId: purchasePackagingId || undefined,
                        customConversionValue: purchasePackagingId
                          ? undefined
                          : purchaseCustomValue,
                        purchaseQty: purchaseQty,
                        totalPrice: purchaseTotalPrice,
                        notes: `Pembelian ${purchaseQty} ${
                          selectedPkg?.name || "Custom"
                        }`,
                      }),
                    }
                  );

                  if (!res.ok) throw new Error("Gagal memproses pembelian");

                  setIsRestockModalOpen(false);
                  refreshData();
                  // Reset form
                  setPurchasePackagingId("");
                  setPurchaseQty(0);
                  setPurchaseTotalPrice(0);
                  setPurchaseCustomValue(0);
                  setShowPriceWarning(false);
                } catch (err: unknown) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : "Gagal memproses pembelian"
                  );
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {showPriceWarning && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-orange-800">
                      Peringatan: Kenaikan Harga Drastis!
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
                      Harga per {selectedIngredient.unit} baru adalah{" "}
                      <strong>
                        Rp{" "}
                        {Math.round(
                          purchaseTotalPrice /
                            (purchaseQty *
                              ((selectedIngredient.packagings || []).find(
                                (p) => p.id === purchasePackagingId
                              )?.conversionValue || purchaseCustomValue))
                        ).toLocaleString()}
                      </strong>
                      . Ini naik signifikan dari harga terakhir (Rp{" "}
                      {selectedIngredient.lastPurchasePrice?.toLocaleString()}).
                      Apakah data sudah benar?
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowPriceWarning(false)}
                      className="mt-3 text-[10px] font-black uppercase text-orange-600 hover:text-orange-800"
                    >
                      Periksa Kembali
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">
                    Tipe Kemasan
                  </label>
                  <select
                    value={purchasePackagingId}
                    onChange={(e) => setPurchasePackagingId(e.target.value)}
                    className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  >
                    <option value="">Custom / Manual</option>
                    {(selectedIngredient.packagings || []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.conversionValue} {selectedIngredient.unit})
                      </option>
                    ))}
                  </select>
                </div>
                {!purchasePackagingId && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">
                      Isi per Pcs ({selectedIngredient.unit})
                    </label>
                    <input
                      type="number"
                      value={purchaseCustomValue || ""}
                      onChange={(e) =>
                        setPurchaseCustomValue(Number(e.target.value))
                      }
                      placeholder="Contoh: 100"
                      className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">
                    Jumlah Beli (Pcs)
                  </label>
                  <input
                    type="number"
                    value={purchaseQty || ""}
                    onChange={(e) => setPurchaseQty(Number(e.target.value))}
                    placeholder="Contoh: 5"
                    className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">
                    Total Bayar (Rp)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={purchaseTotalPrice || ""}
                      onChange={(e) =>
                        setPurchaseTotalPrice(Number(e.target.value))
                      }
                      placeholder="0"
                      className="w-full bg-slate-50 border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Hasil Kalkulasi Otomatis</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Total Stok Masuk:
                    </p>
                    <p className="text-lg font-black text-slate-800">
                      {purchaseQty *
                        ((selectedIngredient.packagings || []).find(
                          (p) => p.id === purchasePackagingId
                        )?.conversionValue || purchaseCustomValue)}{" "}
                      {selectedIngredient.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-500">
                      Harga Satuan:
                    </p>
                    <p className="text-lg font-black text-slate-800">
                      Rp{" "}
                      {Math.round(
                        purchaseTotalPrice /
                          (purchaseQty *
                            ((selectedIngredient.packagings || []).find(
                              (p) => p.id === purchasePackagingId
                            )?.conversionValue || purchaseCustomValue)) || 0
                      ).toLocaleString()}{" "}
                      <span className="text-[10px] font-bold text-slate-400">
                        / {selectedIngredient.unit}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100">
                  {error}
                </p>
              )}

              <button
                disabled={
                  isSubmitting ||
                  !purchaseQty ||
                  !purchaseTotalPrice ||
                  (!purchasePackagingId && !purchaseCustomValue)
                }
                className="w-full py-4 bg-[#FF724C] hover:bg-[#E56543] text-white rounded-xl font-bold text-sm shadow-xl shadow-orange-100 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    {showPriceWarning
                      ? "SAYA MENGERTI, TETAP SIMPAN"
                      : "KONFIRMASI PEMBELIAN"}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Packaging Management Modal */}
      {isPackagingModalOpen && selectedIngredient && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#FF724C] p-6 flex items-center justify-between text-white">
              <div>
                <h2 className="text-xl font-black">Kelola Kemasan</h2>
                <p className="text-orange-50 text-xs font-bold mt-0.5 uppercase tracking-widest">
                  {selectedIngredient.name}
                </p>
              </div>
              <button
                onClick={() => setIsPackagingModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  Daftar Kemasan Tersedia
                </h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin">
                  {(selectedIngredient.packagings?.length || 0) > 0 ? (
                    (selectedIngredient.packagings || []).map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Konversi: {p.conversionValue}{" "}
                            {selectedIngredient.unit}
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            if (!confirm("Hapus kemasan ini?")) return;
                            // Implement delete packaging if needed
                          }}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl">
                      <p className="text-xs text-slate-400 italic">
                        Belum ada kemasan terdaftar.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                {error && (
                  <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100 mb-4">
                    {error}
                  </p>
                )}
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">
                  Tambah Kemasan Baru
                </h3>
                <form
                  className="space-y-3"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSubmitting(true);
                    setError(null);
                    const formData = new FormData(e.currentTarget);
                    const data = {
                      name: formData.get("name"),
                      conversionValue: Number(formData.get("conversionValue")),
                      ingredientId: selectedIngredient.id,
                    };

                    try {
                      const res = await fetch(
                        "/api/inventory/ingredients/packagings",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(data),
                        }
                      );

                      if (!res.ok) throw new Error("Gagal menambah kemasan");

                      setIsPackagingModalOpen(false);
                      refreshData();
                    } catch (err: unknown) {
                      setError(
                        err instanceof Error
                          ? err.message
                          : "Gagal menambah kemasan"
                      );
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                        Nama (ex: Botol)
                      </label>
                      <input
                        name="name"
                        required
                        placeholder="Botol"
                        className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                        Isi ({selectedIngredient.unit})
                      </label>
                      <input
                        name="conversionValue"
                        type="number"
                        required
                        placeholder="100"
                        className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm font-bold"
                      />
                    </div>
                  </div>
                  <button
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#FF724C] hover:bg-[#E56543] text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4" /> TAMBAH KEMASAN
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    );
}
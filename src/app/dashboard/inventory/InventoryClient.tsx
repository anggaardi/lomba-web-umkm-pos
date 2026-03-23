"use client";

import { useState, useMemo } from "react";
import { 
  Box, 
  Plus, 
  Search, 
  RefreshCw,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  X,
  Trash2,
  Pencil,
  Calendar,
  Save,
  Sigma,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getStockStatus, StockStatus } from "@/lib/inventory-utils";

type Packaging = {
  id: string;
  name: string;
  conversionValue: number;
};

type Ingredient = {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  unit: string;
  averageCostPerUnit: number;
  lastPurchasePrice: number | null;
  updatedAt: string;
  packagings: Packaging[];
};

interface InventoryClientProps {
  initialIngredients: Ingredient[];
}

export default function InventoryClient({
  initialIngredients,
}: InventoryClientProps) {
  const [ingredients, setIngredients] =
    useState<Ingredient[]>(initialIngredients);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isPackagingModalOpen, setIsPackagingModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);

  // Purchase form state
  const [purchasePackagingId, setPurchasePackagingId] = useState<string>("");
  const [purchaseQty, setPurchaseQty] = useState<number>(0);
  const [purchaseTotalPrice, setPurchaseTotalPrice] = useState<number>(0);
  const [purchaseCustomValue, setPurchaseCustomValue] = useState<number>(0);
  const [showPriceWarning, setShowPriceWarning] = useState(false);

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add form state
  const [addInitialStock, setAddInitialStock] = useState<number>(0);
  const [addMinStock, setAddMinStock] = useState<number>(0);

  // Inline edit states
  const [editingMinStock, setEditingMinStock] = useState<string | null>(null);
  const [editMinStockValue, setEditMinStockValue] = useState<number>(0);
  const [minStockError, setMinStockError] = useState<string | null>(null);

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
      const isLowStock = getStockStatus(ing.stock, ing.minStock ?? 0) === "MENIPIS";
      const isOutOfStock = getStockStatus(ing.stock, ing.minStock ?? 0) === "HABIS";

      if (statusFilter === "Low Stock")
        return matchesSearch && isLowStock && !isOutOfStock;
      if (statusFilter === "Out of Stock") return matchesSearch && isOutOfStock;
      return matchesSearch;
    });
  }, [ingredients, search, statusFilter]);

  const stats = useMemo(() => {
    const total = ingredients.length;
    const lowStock = ingredients.filter(
      (i) => getStockStatus(i.stock, i.minStock ?? 0) === "MENIPIS"
    ).length;
    const outOfStock = ingredients.filter(
      (i) => getStockStatus(i.stock, i.minStock ?? 0) === "HABIS"
    ).length;
    return { total, lowStock, outOfStock };
  }, [ingredients]);

  const handleSaveMinStock = async (ingredientId: string, value: number) => {
    if (value < 0) {
      setMinStockError("Min stok tidak boleh negatif");
      return;
    }
    try {
      const res = await fetch(`/api/inventory/ingredients/${ingredientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minStock: value }),
      });
      if (!res.ok) {
        const err = await res.json();
        setMinStockError(err.error || "Gagal menyimpan");
        return;
      }
      setIngredients((prev) =>
        prev.map((i) => (i.id === ingredientId ? { ...i, minStock: value } : i))
      );
      setEditingMinStock(null);
      setMinStockError(null);
    } catch {
      setMinStockError("Gagal menyimpan perubahan");
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Inventory Bahan Baku
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola stok bahan baku untuk otomatisasi pengurangan stok saat transaksi
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF724C] hover:bg-[#E56543] text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Tambah Bahan
          </button>
        </div>
      </div>

      {error &&
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
                    <th className="px-6 py-4">Min Stok</th>
                    <th className="px-6 py-4">HPP (Rata-rata)</th>
                    <th className="px-6 py-4">Harga Terakhir</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIngredients.map((ing) => {
                    const status = getStockStatus(ing.stock, ing.minStock ?? 0);
                    const isLow = status === "MENIPIS";
                    const isOut = status === "HABIS";
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
                          {editingMinStock !== ing.id ? (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-700 text-xs">
                                {(() => { const v = ing.minStock ?? 0; return Number.isInteger(v) ? v.toString() : v.toFixed(2); })()} {ing.unit}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingMinStock(ing.id);
                                  setEditMinStockValue(ing.minStock ?? 0);
                                  setMinStockError(null);
                                }}
                                className="p-1 text-slate-300 hover:text-[#FF724C] transition-colors"
                                title="Edit min stok"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={editMinStockValue}
                                  min="0"
                                  onChange={(e) => setEditMinStockValue(Number(e.target.value))}
                                  className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold focus:ring-2 focus:ring-[#FF724C]/20"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSaveMinStock(ing.id, editMinStockValue)}
                                  className="p-1 text-emerald-500 hover:text-emerald-700 transition-colors"
                                  title="Simpan"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => { setEditingMinStock(null); setMinStockError(null); }}
                                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                  title="Batal"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              {minStockError && editingMinStock === ing.id && (
                                <p className="text-[10px] text-red-500 font-bold">{minStockError}</p>
                              )}
                            </div>
                          )}
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


      {/* Add Ingredient Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#FF724C] p-6 flex items-center justify-between text-white">
              <h2 className="text-xl font-black">Tambah Bahan Baku</h2>
              <button
                onClick={() => { setIsAddModalOpen(false); setAddInitialStock(0); setAddMinStock(0); }}
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
                  initialStock: addInitialStock,
                  initialPrice: Number(formData.get("initialPrice")),
                  minStock: addMinStock,
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
                  setAddInitialStock(0);
                  setAddMinStock(0);
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
                    value={addInitialStock}
                    min="0"
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setAddInitialStock(val);
                      setAddMinStock(Math.round(val * 0.1));
                    }}
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
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">
                  Min Stok
                  <span className="ml-2 text-[10px] font-medium text-slate-400 normal-case tracking-normal">
                    (otomatis 10% dari stok awal)
                  </span>
                </label>
                <input
                  type="number"
                  value={addMinStock}
                  min="0"
                  onChange={(e) => setAddMinStock(Number(e.target.value) || 0)}
                  className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#FF724C]/20"
                />
                <p className="text-[10px] text-slate-400 italic ml-1">
                  *Bisa diubah manual sesuai kebutuhan
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[4px] p-4 transition-all duration-300">
          <div className="bg-white rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] w-full max-w-[500px] overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="px-8 pt-8 pb-4 flex items-start justify-between">
              <div>
                <h2 className="text-[28px] font-black text-slate-900 leading-tight">
                  Tambah Stok Masuk
                </h2>
                <p className="text-slate-400 text-[13px] font-bold mt-1 uppercase tracking-wide">
                  Catat penerimaan bahan baku
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
                className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              className="px-8 pb-10 space-y-6"
              onSubmit={async (e) => {
                e.preventDefault();

                // Price Surge Check
                const selectedPkg = (selectedIngredient.packagings || []).find(
                  (p) => p.id === purchasePackagingId
                );
                const conversion = selectedPkg
                  ? selectedPkg.conversionValue
                  : purchaseCustomValue || 1;
                const totalBaseQty = purchaseQty * conversion;
                
                const newCostPerUnit = purchaseTotalPrice / (totalBaseQty || 1);

                if (selectedIngredient.lastPurchasePrice && !showPriceWarning && purchaseTotalPrice > 0) {
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
                          : purchaseCustomValue || 1,
                        purchaseQty: purchaseQty,
                        totalPrice: purchaseTotalPrice,
                        notes: `Stok Masuk: ${purchaseQty} ${
                          selectedPkg?.name || selectedIngredient.unit
                        }`,
                      }),
                    }
                  );

                  if (!res.ok) throw new Error("Gagal memproses stok masuk");

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
                      : "Gagal memproses stok masuk"
                  );
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {/* Bahan Dipilih Card */}
              <div className="bg-[#FFF5F2] border border-[#FFEBE4] rounded-[24px] p-6 space-y-1">
                <p className="text-[11px] font-black text-[#FF724C] uppercase tracking-widest">
                  BAHAN DIPILIH
                </p>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-800">
                    {selectedIngredient.name}
                  </h3>
                  <p className="text-slate-500 text-sm font-bold">
                    Stok saat ini: <span className="text-slate-800">{selectedIngredient.stock.toLocaleString()} {selectedIngredient.unit}</span>
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-5">
                {/* Bahan Baku Select (Styled as readonly in image) */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    BAHAN BAKU
                  </label>
                  <div className="w-full bg-white border border-slate-100 rounded-[20px] px-6 py-4 text-sm font-bold text-slate-800 shadow-sm border-b-2">
                    {selectedIngredient.name} — {selectedIngredient.stock.toLocaleString()} {selectedIngredient.unit}
                  </div>
                </div>

                {/* Jumlah & Tanggal Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      JUMLAH MASUK
                    </label>
                    <div className="relative group">
                      <input
                        type="number"
                        value={purchaseQty || ""}
                        onChange={(e) => {
                           setPurchaseQty(Number(e.target.value));
                           if (!purchasePackagingId) setPurchaseCustomValue(1);
                        }}
                        placeholder="0"
                        className="w-full bg-white border border-slate-100 rounded-[20px] pl-6 pr-12 py-4 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#FF724C]/10 focus:border-[#FF724C] transition-all shadow-sm border-b-2"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-black text-[#FF724C]">
                        {selectedIngredient.unit}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      TANGGAL
                    </label>
                    <div className="relative group">
                      <input
                        type="date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="w-full bg-white border border-slate-100 rounded-[20px] px-6 py-4 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 transition-all shadow-sm border-b-2"
                      />
                      <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Packaging Select (Integrated into design) */}
                <div className="space-y-2">
                   <div className="flex items-center justify-between ml-1">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        PILIH KEMASAN (OPSIONAL)
                      </label>
                      <button 
                        type="button"
                        onClick={() => setIsPackagingModalOpen(true)}
                        className="text-[10px] font-black text-[#FF724C] hover:underline"
                      >
                        + KEMASAN BARU
                      </button>
                   </div>
                   <select 
                      value={purchasePackagingId}
                      onChange={(e) => setPurchasePackagingId(e.target.value)}
                      className="w-full bg-white border border-slate-100 rounded-[20px] px-6 py-4 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#FF724C]/10 focus:border-[#FF724C] transition-all shadow-sm border-b-2 appearance-none"
                   >
                      <option value="">Gunakan Satuan Dasar ({selectedIngredient.unit})</option>
                      {(selectedIngredient.packagings || []).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {p.conversionValue} {selectedIngredient.unit}
                        </option>
                      ))}
                   </select>
                </div>
              </div>

              {/* Prediksi Stok Akhir */}
              <div className="border-2 border-dashed border-[#FED7AA] rounded-[24px] p-6 relative overflow-hidden bg-orange-50/20">
                <div className="flex items-start justify-between relative z-10">
                   <div className="flex gap-4">
                      <div className="w-10 h-10 bg-white shadow-sm border border-orange-100 rounded-full flex items-center justify-center text-[#FF724C]">
                        <Sigma className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                          PREDIKSI STOK AKHIR
                        </p>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">
                          {selectedIngredient.stock.toLocaleString()} {selectedIngredient.unit} (awal) + {(() => {
                            const selectedPkg = (selectedIngredient.packagings || []).find(p => p.id === purchasePackagingId);
                            const conv = selectedPkg ? selectedPkg.conversionValue : (purchaseCustomValue || 1);
                            return (purchaseQty * conv).toLocaleString();
                          })()} {selectedIngredient.unit} (masuk)
                        </p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-[#FF724C] uppercase tracking-widest">
                         TOTAL STOK BARU
                      </p>
                      <p className="text-2xl font-black text-slate-900 leading-none mt-1">
                         {(() => {
                            const selectedPkg = (selectedIngredient.packagings || []).find(p => p.id === purchasePackagingId);
                            const conv = selectedPkg ? selectedPkg.conversionValue : (purchaseCustomValue || 1);
                            return (selectedIngredient.stock + (purchaseQty * conv)).toLocaleString();
                          })()} {selectedIngredient.unit}
                      </p>
                   </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <p className="text-sm font-bold text-red-700">{error}</p>
                </div>
              )}

              {showPriceWarning && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-start gap-3 animate-in slide-in-from-bottom-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-orange-800">Kenaikan Harga Drastis!</p>
                    <p className="text-xs text-orange-700 mt-0.5">
                      Apakah data harga sudah benar?
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowPriceWarning(false)}
                      className="mt-2 text-[11px] font-black uppercase text-orange-600 hover:text-orange-900 flex items-center gap-1"
                    >
                      PERIKSA KEMBALI
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsRestockModalOpen(false)}
                  className="w-full py-4 bg-white border border-slate-200 rounded-[20px] font-black text-slate-500 text-sm hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 transition-all shadow-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !purchaseQty}
                  className="w-full py-4 bg-[#FF724C] hover:bg-[#E56543] text-white rounded-[20px] font-black text-sm shadow-[0_8px_30px_rgb(255,114,76,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5 p-0.5" />
                      {showPriceWarning ? "Tetap Simpan" : "Simpan Stok Masuk"}
                    </>
                  )}
                </button>
              </div>
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
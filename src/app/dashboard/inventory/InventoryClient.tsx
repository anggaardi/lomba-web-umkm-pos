"use client";

import { useState, useMemo, useCallback } from "react"; // useMemo still used for filteredIngredients
import { 
  Box, 
  Plus, 
  Search, 
  RefreshCw,
  AlertTriangle,
  Loader2,
  X,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getStockStatus } from "@/lib/inventory-utils";
import { useMobileSearch } from "@/hooks/useMobileSearch";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Types
import { type Ingredient, type Packaging } from "./types";

// Sub-components
import { InventoryStatCards } from "./_components/InventoryStatCards";
import { MobileInventoryCard, DesktopInventoryRow } from "./_components/InventoryItems";
import { RegisterIngredientModal } from "./_components/RegisterIngredientModal";
import { RestockModal } from "./_components/RestockModal";
import { PackagingModal } from "./_components/PackagingModal";
import { EditIngredientModal } from "./_components/EditIngredientModal";

interface InventoryClientProps {
  initialIngredients: Ingredient[];
  initialPagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  initialStats: {
    total: number;
    lowStock: number;
    outOfStock: number;
  };
}

export default function InventoryClient({
  initialIngredients,
  initialPagination,
  initialStats,
}: InventoryClientProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const [pagination, setPagination] = useState(initialPagination);
  const [globalStats, setGlobalStats] = useState(initialStats);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Connect to mobile header search
  useMobileSearch(useCallback((q) => setSearch(q), []));

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isPackagingModalOpen, setIsPackagingModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

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

  const fetchPage = async (page: number) => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/inventory/ingredients?page=${page}&limit=${pagination.limit}`);
      if (!res.ok) throw new Error("Gagal mengambil data");
      const data = await res.json();
      if (data.ingredients) {
        setIngredients(data.ingredients);
        setPagination(data.pagination);
        if (data.globalStats) setGlobalStats(data.globalStats);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const refreshData = async () => {
    fetchPage(pagination.currentPage);
  };

  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ing) => {
      const matchesSearch = ing.name.toLowerCase().includes(search.toLowerCase());
      const status = getStockStatus(ing.stock, ing.minStock ?? 0);
      if (statusFilter === "Low Stock") return matchesSearch && status === "MENIPIS";
      if (statusFilter === "Out of Stock") return matchesSearch && status === "HABIS";
      return matchesSearch;
    });
  }, [ingredients, search, statusFilter]);

  // Stats always come from the server-side global counts, not the current page slice
  const stats = globalStats;

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
      if (!res.ok) throw new Error("Gagal menyimpan");
      setIngredients(prev => prev.map(i => i.id === ingredientId ? { ...i, minStock: value } : i));
      setEditingMinStock(null);
      setMinStockError(null);
    } catch {
      setMinStockError("Gagal menyimpan perubahan");
    }
  };

  const handleAddIngredient = async (e: React.FormEvent<HTMLFormElement>) => {
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
      if (!res.ok) throw new Error("Gagal menambah bahan");
      const name = String(data.name);
      toast.success(`Bahan "${name}" berhasil ditambahkan!`);
      setIsAddModalOpen(false);
      setAddInitialStock(0);
      setAddMinStock(0);
      refreshData();
    } catch (err: any) {
      toast.error(err.message || "Gagal menambah bahan baku");
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditIngredient = async (id: string, data: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/inventory/ingredients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal memperbarui bahan");
      toast.success("Bahan berhasil diperbarui");
      setIsEditModalOpen(false);
      refreshData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteIngredient = async (id: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/inventory/ingredients/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus bahan");
      toast.success("Bahan berhasil dihapus");
      setIsEditModalOpen(false);
      refreshData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestockSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedIngredient) return;

    const selectedPkg = (selectedIngredient.packagings || []).find(p => p.id === purchasePackagingId);
    const conversion = selectedPkg ? selectedPkg.conversionValue : purchaseCustomValue || 1;
    const totalBaseQty = purchaseQty * conversion;
    const newCostPerUnit = purchaseTotalPrice / (totalBaseQty || 1);

    if (selectedIngredient.lastPurchasePrice && !showPriceWarning && purchaseTotalPrice > 0) {
      if (newCostPerUnit > selectedIngredient.lastPurchasePrice * 1.5) {
        setShowPriceWarning(true);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/inventory/ingredients/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredientId: selectedIngredient.id,
          packagingId: purchasePackagingId || undefined,
          customConversionValue: purchasePackagingId ? undefined : purchaseCustomValue || 1,
          purchaseQty: purchaseQty,
          totalPrice: purchaseTotalPrice,
        }),
      });
      if (!res.ok) throw new Error("Gagal memproses stok masuk");
      toast.success(`Berhasil menambah stok: ${selectedIngredient.name}`);
      setIsRestockModalOpen(false);
      setPurchasePackagingId("");
      setPurchaseQty(0);
      setPurchaseTotalPrice(0);
      setPurchaseCustomValue(0);
      setShowPriceWarning(false);
      refreshData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPackaging = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedIngredient) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/inventory/ingredients/${selectedIngredient.id}/packaging`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          conversionValue: Number(formData.get("conversionValue")),
        }),
      });
      if (!res.ok) throw new Error("Gagal menambah kemasan");
      const data = await res.json();
      setIngredients(prev => prev.map(ing => 
        ing.id === selectedIngredient.id ? { ...ing, packagings: [...(ing.packagings || []), data] } : ing
      ));
      setSelectedIngredient(prev => prev ? { ...prev, packagings: [...(prev.packagings || []), data] } : null);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePackaging = async (packagingId: string) => {
    if (!selectedIngredient) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/inventory/ingredients/${selectedIngredient.id}/packaging?packagingId=${packagingId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus kemasan");
      setIngredients(prev => prev.map(ing => 
        ing.id === selectedIngredient.id ? { ...ing, packagings: ing.packagings.filter(p => p.id !== packagingId) } : ing
      ));
      setSelectedIngredient(prev => prev ? { ...prev, packagings: prev.packagings.filter(p => p.id !== packagingId) } : null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-10">
      <ToastContainer />

      <div className="hidden lg:flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Inventory Bahan Baku</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola stok bahan baku untuk otomatisasi stok saat transaksi</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <PlusCircle className="w-5 h-5" /> Tambah Bahan Baru
        </button>
      </div>

      <InventoryStatCards stats={stats} />

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 mx-1 lg:mx-0">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm font-bold text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-100 rounded-full"><X className="w-4 h-4 text-red-400" /></button>
        </div>
      )}

      <div className="flex flex-col lg:bg-white lg:rounded-2xl lg:shadow-sm lg:border lg:border-slate-200 lg:overflow-hidden">
        <div className="flex flex-col lg:p-4 lg:border-b lg:border-slate-100 gap-4">
          <div className="flex items-center justify-between lg:hidden pt-2">
            <h2 className="text-lg font-black text-gray-900 tracking-tight">Variasi Bahan</h2>
            <button onClick={refreshData} disabled={isRefreshing} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 active:scale-95 disabled:opacity-50 transition-all">
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            </button>
          </div>

          <div className="flex items-center p-1 bg-gray-100 rounded-2xl w-full lg:max-w-fit mb-2 lg:mb-0">
            {["All", "Low Stock", "Out of Stock"].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={cn(
                  "flex-1 lg:flex-none px-4 lg:px-6 py-2.5 lg:py-1.5 text-xs font-black rounded-xl transition-all",
                  statusFilter === filter ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {filter === "All" ? "Semua" : filter === "Low Stock" ? "Menipis" : "Habis"}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Cari bahan baku..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* List Views */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden pt-2">
          {filteredIngredients.map((ing) => (
            <MobileInventoryCard 
              key={ing.id} 
              ing={ing} 
              onRestock={() => { setSelectedIngredient(ing); setIsRestockModalOpen(true); setError(null); }}
              onPackaging={() => { setSelectedIngredient(ing); setIsPackagingModalOpen(true); setError(null); }}
              onEditMinStock={() => { setEditingMinStock(ing.id); setEditMinStockValue(ing.minStock ?? 0); setMinStockError(null); }}
              isEditingMinStock={editingMinStock === ing.id}
              editMinStockValue={editMinStockValue}
              onSaveMinStock={(val) => handleSaveMinStock(ing.id, val)}
              onCancelEdit={() => setEditingMinStock(null)}
              minStockError={minStockError}
              setEditMinStockValue={setEditMinStockValue}
              onEdit={() => { setSelectedIngredient(ing); setIsEditModalOpen(true); }}
            />
          ))}
        </div>

        <div className="hidden lg:block overflow-x-auto">
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
              {filteredIngredients.map((ing) => (
                <DesktopInventoryRow 
                  key={ing.id} 
                  ing={ing} 
                  isEditingMinStock={editingMinStock === ing.id}
                  editMinStockValue={editMinStockValue}
                  onSaveMinStock={(val) => handleSaveMinStock(ing.id, val)}
                  onCancelEdit={() => setEditingMinStock(null)}
                  minStockError={minStockError}
                  setEditMinStockValue={setEditMinStockValue}
                  onRestock={() => { setSelectedIngredient(ing); setIsRestockModalOpen(true); setError(null); }}
                  onPackaging={() => { setSelectedIngredient(ing); setIsPackagingModalOpen(true); setError(null); }}
                  onEditStart={() => { setEditingMinStock(ing.id); setEditMinStockValue(ing.minStock ?? 0); setMinStockError(null); }}
                  onEdit={() => { setSelectedIngredient(ing); setIsEditModalOpen(true); }}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 bg-white border-t border-slate-100">
          <p className="text-xs font-bold text-slate-400">
            Menampilkan <span className="text-slate-700 font-black">{ingredients.length}</span> dari <span className="text-slate-700 font-black">{pagination.totalItems}</span> bahan baku
          </p>

          {/* Pagination Controls - styled like the reference image */}
          <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl p-1.5 gap-1">
            {/* First page */}
            <button
              onClick={() => fetchPage(1)}
              disabled={pagination.currentPage <= 1 || isRefreshing}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all active:scale-90 text-xs font-black"
              title="Halaman pertama"
            >
              &#171;
            </button>
            {/* Previous page */}
            <button
              onClick={() => fetchPage(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1 || isRefreshing}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all active:scale-90 text-xs font-black"
              title="Halaman sebelumnya"
            >
              &#8249;
            </button>

            {/* Page number buttons */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(p => Math.abs(p - pagination.currentPage) <= 1 || p === 1 || p === pagination.totalPages)
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === "..." ? (
                  <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-slate-300 text-xs font-black">
                    ···
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => fetchPage(item as number)}
                    disabled={isRefreshing}
                    className={cn(
                      "w-9 h-9 flex items-center justify-center rounded-xl text-xs font-black transition-all active:scale-90",
                      pagination.currentPage === item
                        ? "bg-primary text-white shadow-md shadow-primary/30"
                        : "text-slate-400 hover:text-slate-700 hover:bg-white hover:shadow-sm"
                    )}
                  >
                    {item}
                  </button>
                )
              )
            }

            {/* Next page */}
            <button
              onClick={() => fetchPage(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages || isRefreshing}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all active:scale-90 text-xs font-black"
              title="Halaman berikutnya"
            >
              &#8250;
            </button>
            {/* Last page */}
            <button
              onClick={() => fetchPage(pagination.totalPages)}
              disabled={pagination.currentPage >= pagination.totalPages || isRefreshing}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all active:scale-90 text-xs font-black"
              title="Halaman terakhir"
            >
              &#187;
            </button>
          </div>
        </div>

      </div>

      <button onClick={() => setIsAddModalOpen(true)} className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/40 lg:hidden z-30 active:scale-95 transition-transform">
        <Plus className="w-8 h-8 font-black" />
      </button>

      <RegisterIngredientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddIngredient}
        isSubmitting={isSubmitting}
        error={error}
        addInitialStock={addInitialStock}
        setAddInitialStock={setAddInitialStock}
        addMinStock={addMinStock}
        setAddMinStock={setAddMinStock}
      />

      <EditIngredientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditIngredient}
        onDelete={handleDeleteIngredient}
        isSubmitting={isSubmitting}
        ingredient={selectedIngredient}
      />

      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        selectedIngredient={selectedIngredient}
        onSubmit={handleRestockSubmit}
        isSubmitting={isSubmitting}
        error={error}
        purchasePackagingId={purchasePackagingId}
        setPurchasePackagingId={setPurchasePackagingId}
        purchaseQty={purchaseQty}
        setPurchaseQty={setPurchaseQty}
        purchaseTotalPrice={purchaseTotalPrice}
        setPurchaseTotalPrice={setPurchaseTotalPrice}
        purchaseCustomValue={purchaseCustomValue}
        setPurchaseCustomValue={setPurchaseCustomValue}
        showPriceWarning={showPriceWarning}
      />

      <PackagingModal
        isOpen={isPackagingModalOpen}
        onClose={() => setIsPackagingModalOpen(false)}
        selectedIngredient={selectedIngredient}
        onAddPackaging={handleAddPackaging}
        onDeletePackaging={handleDeletePackaging}
        isSubmitting={isSubmitting}
        error={error}
      />
    </div>
  );
}
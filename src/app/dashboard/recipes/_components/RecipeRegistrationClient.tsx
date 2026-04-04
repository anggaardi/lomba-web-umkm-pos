"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  ChefHat,
  ChevronLeft,
  Loader2,
  Package,
  Image as ImageIcon,
  X,
  Info,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMobileHeader } from "@/context/MobileHeaderContext";

// Types
import { 
  type Ingredient, 
  type Category, 
  type RecipeIngredient, 
  type InitialRecipeData 
} from "../types";

// Sub-components
import { CostAnalysisCard } from "./CostAnalysisCard";
import { CategoryManagementModal } from "./CategoryManagementModal";
import { AddIngredientModal } from "./AddIngredientModal";
import { ProductInformationForm } from "./ProductInformationForm";
import { IngredientsListForm } from "./IngredientsListForm";
import { PreparationMethodForm } from "./PreparationMethodForm";

interface RecipeRegistrationClientProps {
  ingredients: Ingredient[];
  categories: Category[];
  initialData?: InitialRecipeData;
}

export default function RecipeRegistrationClient({
  ingredients,
  categories,
  initialData,
}: RecipeRegistrationClientProps) {
  const router = useRouter();
  const { setDetailHeader, clearDetailHeader } = useMobileHeader();
  
  // Form State
  const [name, setName] = useState(initialData?.name || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [basePrice, setBasePrice] = useState<number>(initialData?.basePrice || 0);
  const [basePriceDisplay, setBasePriceDisplay] = useState<string>(
    initialData?.basePrice ? initialData.basePrice.toLocaleString("id-ID") : ""
  );
  const [image, setImage] = useState<string | null>(initialData?.image || null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [preparationMethod, setPreparationMethod] = useState(initialData?.preparationMethod || "");
  const [recipeItems, setRecipeItems] = useState<RecipeIngredient[]>(
    initialData?.recipeItems?.length ? [...initialData.recipeItems] : []
  );
  const [laborEstimate, setLaborEstimate] = useState<number>(5000);

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [isAddIngredientModalOpen, setIsAddIngredientModalOpen] = useState(false);
  const [ingredientSearchQuery, setIngredientSearchQuery] = useState("");
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>([]);
  const [localCategories, setLocalCategories] = useState(categories);

  // Mobile Header Sync
  useEffect(() => {
    const title = name || (initialData ? "Tanpa Nama" : "Resep Baru");
    const subTitle = initialData ? "Edit Resep" : "Tambah Resep";
    setDetailHeader(title, "/dashboard/recipes", subTitle);
    return () => clearDetailHeader();
  }, [name, initialData, setDetailHeader, clearDetailHeader]);

  // Calculations
  const ingredientCost = useMemo(() => {
    return recipeItems.reduce((acc, item) => acc + (item.cost || 0), 0);
  }, [recipeItems]);

  const totalProductionCost = useMemo(() => {
    return ingredientCost + laborEstimate;
  }, [ingredientCost, laborEstimate]);

  // Handlers
  const handlePriceChange = (val: string) => {
    const raw = val.replace(/[^0-9]/g, "");
    const numeric = Number(raw);
    setBasePrice(numeric);
    setBasePriceDisplay(raw ? numeric.toLocaleString("id-ID") : "");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Ukuran gambar maksimal 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateIngredient = (index: number, id: string) => {
    const selectedIng = ingredients.find((ing) => ing.id === id);
    const newItems = [...recipeItems];
    newItems[index] = {
      ...newItems[index],
      ingredientId: id,
      unit: selectedIng?.unit || "",
      cost: (selectedIng?.averageCostPerUnit || 0) * (newItems[index].quantity || 0),
    };
    setRecipeItems(newItems);
  };

  const updateQuantity = (index: number, quantity: number) => {
    const newItems = [...recipeItems];
    const selectedIng = ingredients.find((ing) => ing.id === newItems[index].ingredientId);
    newItems[index] = {
      ...newItems[index],
      quantity,
      cost: (selectedIng?.averageCostPerUnit || 0) * quantity,
    };
    setRecipeItems(newItems);
  };

  const removeIngredientRow = (index: number) => {
    setRecipeItems(recipeItems.filter((_, i) => i !== index));
  };

  const handleToggleIngredientId = (id: string) => {
    setSelectedIngredientIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleAddSelectedIngredients = () => {
    const currentIds = recipeItems.map(item => item.ingredientId);
    const uniqueNewIds = selectedIngredientIds.filter(id => !currentIds.includes(id));
    
    const newItems = uniqueNewIds.map((id) => {
      const selectedIng = ingredients.find((ing) => ing.id === id);
      return {
        ingredientId: id,
        quantity: 1, // Default quantity 1 for new items
        unit: selectedIng?.unit || "",
        cost: selectedIng?.averageCostPerUnit || 0,
      };
    });

    setRecipeItems([...recipeItems, ...newItems]);
    setIsAddIngredientModalOpen(false);
    setSelectedIngredientIds([]);
  };

  // Category API handlers
  const handleAddCategory = async (name: string, catImage: string | null) => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/inventory/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image: catImage }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menambah kategori");
      }
      const data = await res.json();
      setLocalCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setCategoryId(data.id);
      setSuccessMessage("Category Created Successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async (id: string, name: string, catImage: string | null) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/inventory/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image: catImage }),
      });
      if (!res.ok) throw new Error("Gagal memperbarui kategori");
      const data = await res.json();
      setLocalCategories(prev => prev.map(cat => cat.id === id ? data : cat).sort((a, b) => a.name.localeCompare(b.name)));
      setSuccessMessage("Category Updated Successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Hapus kategori ini? Produk mungkin menjadi tidak teratur.")) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/inventory/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus kategori");
      setLocalCategories(prev => prev.filter(cat => cat.id !== id));
      if (categoryId === id) setCategoryId("");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveRecipe = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (!name || !categoryId || basePrice <= 0) {
        throw new Error("Mohon lengkapi Nama, Kategori, dan Harga Produk");
      }
      const validItems = recipeItems.filter(item => item.ingredientId && item.quantity > 0);
      if (validItems.length === 0) {
        throw new Error("Mohon tambahkan setidaknya satu bahan ke dalam resep");
      }

      const endpoint = initialData ? `/api/inventory/recipes/${initialData.id}` : "/api/inventory/recipes/register";
      const method = initialData ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          categoryId,
          price: basePrice,
          image,
          preparationMethod,
          ingredients: validItems,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan resep");
      }

      router.push("/dashboard/recipes");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900">
            {initialData ? "Edit Recipe" : "Create Recipe"}
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            {initialData ? "Update product information and ingredient composition." : "Create a new recipe by providing product and ingredient information."}
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <button onClick={() => router.back()} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSaveRecipe}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-primary hover:bg-primary-dark disabled:bg-slate-300 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/10 transition-all flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Recipe"}
          </button>
        </div>
      </div>

      <div className="space-y-8">

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-4">
            <Info className="w-5 h-5" />
            <p className="text-sm font-bold">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto p-1.5 hover:bg-red-100 rounded-full"><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="flex flex-col xl:flex-row gap-8 items-start w-full">
          <div className="w-full xl:w-[68%] space-y-8 flex flex-col">
            <ProductInformationForm
              name={name}
              setName={setName}
              categoryId={categoryId}
              setCategoryId={setCategoryId}
              categories={localCategories}
              basePriceDisplay={basePriceDisplay}
              onPriceChange={handlePriceChange}
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
              onManageCategories={() => setIsManageCategoriesOpen(true)}
            />

            <IngredientsListForm
              recipeItems={recipeItems}
              ingredients={ingredients}
              onUpdateIngredient={updateIngredient}
              onUpdateQuantity={updateQuantity}
              onRemoveRow={removeIngredientRow}
              onOpenModal={() => setIsAddIngredientModalOpen(true)}
            />

            <PreparationMethodForm
              preparationMethod={preparationMethod}
              setPreparationMethod={setPreparationMethod}
            />
          </div>

          {/* Sidebar (Desktop) */}
          <div className="hidden xl:flex w-full xl:w-[32%] flex-col gap-8 sticky top-8">
            <div className="bg-white rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[13px]">Recipe Image</h3>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} id="recipe-image-upload-desktop" />
              <label htmlFor="recipe-image-upload-desktop" className="h-[240px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors group cursor-pointer overflow-hidden relative">
                {imagePreview ? (
                  <>
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-bold text-sm">Ganti Gambar</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform"><ImageIcon className="w-6 h-6" /></div>
                    <p className="mt-4 text-sm font-bold text-slate-900 text-center">Click to upload or drag and drop</p>
                    <p className="mt-1 text-xs font-medium text-slate-400 uppercase tracking-wider">PNG, JPG up to 5MB</p>
                  </>
                )}
              </label>
            </div>

            <CostAnalysisCard
              ingredientCost={ingredientCost}
              laborEstimate={laborEstimate}
              setLaborEstimate={setLaborEstimate}
              totalProductionCost={totalProductionCost}
            />
          </div>

          {/* Tablet/Mobile Cost Analysis */}
          <div className="xl:hidden w-full">
            <CostAnalysisCard
              ingredientCost={ingredientCost}
              laborEstimate={laborEstimate}
              setLaborEstimate={setLaborEstimate}
              totalProductionCost={totalProductionCost}
            />
          </div>
        </div>
      </div>

      <CategoryManagementModal
        isOpen={isManageCategoriesOpen}
        onClose={() => setIsManageCategoriesOpen(false)}
        categories={localCategories}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        isSubmitting={isSubmitting}
        error={error}
        successMessage={successMessage}
        setError={setError}
        setSuccessMessage={setSuccessMessage}
      />

      <AddIngredientModal
        isOpen={isAddIngredientModalOpen}
        onClose={() => setIsAddIngredientModalOpen(false)}
        ingredients={ingredients}
        categories={localCategories}
        searchQuery={ingredientSearchQuery}
        setSearchQuery={setIngredientSearchQuery}
        selectedIds={selectedIngredientIds}
        onToggleId={handleToggleIngredientId}
        onClearSelection={() => setSelectedIngredientIds([])}
        onAddSelected={handleAddSelectedIngredients}
      />
    </div>
  );
}

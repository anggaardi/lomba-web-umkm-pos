"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  ChevronLeft,
  Upload,
  Info,
  ChefHat,
  ClipboardList,
  DollarSign,
  Loader2,
  CheckCircle2,
  X,
  Package,
  BookOpen,
  Image as ImageIcon,
  Search,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  averageCostPerUnit: number;
}

interface Category {
  id: string;
  name: string;
  image?: string | null;
}

interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
  unit: string;
  cost: number;
}

export interface InitialRecipeData {
  id: string;
  name: string;
  categoryId: string;
  basePrice: number;
  image: string | null;
  preparationMethod: string;
  recipeItems: RecipeIngredient[];
}

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState(initialData?.name || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [basePrice, setBasePrice] = useState<number>(initialData?.basePrice || 0);
  const [image, setImage] = useState<string | null>(initialData?.image || null);
  const [preparationMethod, setPreparationMethod] = useState(initialData?.preparationMethod || "");
  const [recipeItems, setRecipeItems] = useState<RecipeIngredient[]>(
    initialData?.recipeItems?.length ? initialData.recipeItems : [{ ingredientId: "", quantity: 0, unit: "", cost: 0 }]
  );
  const [laborEstimate, setLaborEstimate] = useState<number>(5000);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [basePriceDisplay, setBasePriceDisplay] = useState<string>(
    initialData?.basePrice ? initialData.basePrice.toLocaleString("id-ID") : ""
  );
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [localCategories, setLocalCategories] = useState(categories);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catImagePreview, setCatImagePreview] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isAddIngredientModalOpen, setIsAddIngredientModalOpen] =
    useState(false);
  const [ingredientSearchQuery, setIngredientSearchQuery] = useState("");
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>(
    []
  );

  const filteredIngredients = useMemo(() => {
    if (!ingredientSearchQuery) return ingredients;
    const q = ingredientSearchQuery.toLowerCase();
    return ingredients.filter((ing) => ing.name.toLowerCase().includes(q));
  }, [ingredients, ingredientSearchQuery]);

  const handleAddSelectedIngredients = () => {
    const newItems = selectedIngredientIds.map((id) => {
      const selectedIng = ingredients.find((ing) => ing.id === id);
      return {
        ingredientId: id,
        quantity: 0,
        unit: selectedIng?.unit || "",
        cost: 0,
      };
    });

    let currentItems = [...recipeItems];
    if (currentItems.length === 1 && currentItems[0].ingredientId === "") {
      currentItems = [];
    }

    setRecipeItems([...currentItems, ...newItems]);
    setIsAddIngredientModalOpen(false);
    setSelectedIngredientIds([]);
    setIngredientSearchQuery("");
  };

  // Calculations
  const ingredientCost = useMemo(() => {
    return recipeItems.reduce((acc, item) => acc + (item.cost || 0), 0);
  }, [recipeItems]);

  const totalProductionCost = useMemo(() => {
    return ingredientCost + laborEstimate;
  }, [ingredientCost, laborEstimate]);

  const removeIngredientRow = (index: number) => {
    setRecipeItems(recipeItems.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, ingredientId: string) => {
    const selectedIng = ingredients.find((ing) => ing.id === ingredientId);
    const newItems = [...recipeItems];
    newItems[index] = {
      ...newItems[index],
      ingredientId,
      unit: selectedIng?.unit || "",
      cost:
        (selectedIng?.averageCostPerUnit || 0) *
        (newItems[index].quantity || 0),
    };
    setRecipeItems(newItems);
  };

  const updateQuantity = (index: number, quantity: number) => {
    const newItems = [...recipeItems];
    const selectedIng = ingredients.find(
      (ing) => ing.id === newItems[index].ingredientId
    );
    newItems[index] = {
      ...newItems[index],
      quantity,
      cost: (selectedIng?.averageCostPerUnit || 0) * quantity,
    };
    setRecipeItems(newItems);
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
        setImage(base64String); // For now storing base64, usually you'd upload to S3/Cloudinary
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/inventory/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName, image: catImagePreview }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal menambah kategori");
      }
      const data = await res.json();

      setLocalCategories((prev) =>
        [...prev, data].sort((a, b) => a.name.localeCompare(b.name))
      );
      setCategoryId(data.id);
      setIsAddingCategory(false);
      setNewCategoryName("");
      setCatImagePreview(null);
      setSuccessMessage("Category Created Successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menambah kategori");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async (
    id: string,
    name: string,
    image?: string | null
  ) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/inventory/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image }),
      });
      if (!res.ok) throw new Error("Gagal memperbarui kategori");
      const data = await res.json();

      setLocalCategories((prev) =>
        prev
          .map((cat) => (cat.id === id ? data : cat))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingCategory(null);
      setCatImagePreview(null);
      setSuccessMessage("Category Updated Successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal memperbarui kategori"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this category? Products in this category may become unorganized."
      )
    )
      return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/inventory/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus kategori");

      setLocalCategories((prev) => prev.filter((cat) => cat.id !== id));
      if (categoryId === id) setCategoryId("");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menghapus kategori");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCatImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCatImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate
      if (!name || !categoryId || basePrice <= 0) {
        throw new Error(
          "Mohon lengkapi informasi produk (Nama, Kategori, Harga)"
        );
      }

      const validItems = recipeItems.filter(
        (item) => item.ingredientId && item.quantity > 0
      );
      if (validItems.length === 0) {
        throw new Error("Mohon tambahkan setidaknya satu bahan ke dalam resep");
      }

      const endpoint = initialData 
        ? `/api/inventory/recipes/${initialData.id}` 
        : "/api/inventory/recipes/register";
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan resep");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8">
      {/* Header with Back Button and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/recipes"
            className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF724C]">
              <ChefHat className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              {initialData ? "Edit Recipe" : "Add New Recipe"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-[#FF724C] hover:bg-[#F45D33] disabled:bg-slate-300 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-900/10 transition-all flex items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Save Recipe"
            )}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Title Section */}
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-slate-900">Create Recipes</h2>
          <p className="text-slate-500 font-medium">
            {initialData 
              ? "Update product information and ingredient composition for this recipe."
              : "Create a new recipe by providing product information and ingredient composition."}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-4">
            <Info className="w-5 h-5" />
            <p className="text-sm font-bold">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto p-1.5 hover:bg-red-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Two-Column Desktop Layout Wrapper */}
        <div className="flex flex-col xl:flex-row gap-8 items-start w-full">
          {/* Left Column (Main Content) */}
          <div className="w-full xl:w-[68%] space-y-8 flex flex-col">
            {/* Product Information Card */}
        <div className="bg-white rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#FF724C]">
              <Package className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[13px]">
              Product Information
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-10 xl:gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Recipe Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Signature Chocolate Fondant"
                  className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none font-medium text-base"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-bold text-slate-700">
                    Category
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsManageCategoriesOpen(true)}
                    className="text-[10px] font-black text-[#FF724C] hover:text-orange-700 uppercase tracking-wider"
                  >
                    Manage Category
                  </button>
                </div>
                {isAddingCategory ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Kategori baru..."
                      className="flex-1 bg-slate-50 border-slate-100 rounded-2xl px-4 py-3 text-sm font-medium outline-none border focus:border-orange-500"
                      autoFocus
                    />
                    <button
                      onClick={handleAddCategory}
                      className="p-3 bg-[#FF724C] text-white rounded-xl hover:bg-orange-600 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsAddingCategory(false)}
                      className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none font-medium text-base appearance-none cursor-pointer"
                    >
                      <option value="">Select Category</option>
                      {localCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Plus className="w-4 h-4 rotate-45" />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Base Price (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={basePriceDisplay}
                    onChange={(e) => {
                      // Strip all non-digit characters
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      const numeric = Number(raw);
                      setBasePrice(numeric);
                      // Format with thousand separator (id-ID uses '.' as separator)
                      setBasePriceDisplay(raw ? numeric.toLocaleString("id-ID") : "");
                    }}
                    placeholder="0"
                    className="w-full bg-slate-50 border-slate-100 rounded-2xl pl-12 pr-5 py-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none font-medium text-base"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 xl:hidden">
              <label className="text-sm font-bold text-slate-700 ml-1">
                Recipe Image
              </label>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
                id="recipe-image-upload"
              />
              <label
                htmlFor="recipe-image-upload"
                className="h-[240px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors group cursor-pointer overflow-hidden relative"
              >
                {imagePreview ? (
                  <>
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-bold text-sm">
                        Ganti Gambar
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <p className="mt-4 text-sm font-bold text-slate-900">
                      Click to upload or drag and drop
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-400 uppercase tracking-wider">
                      PNG, JPG up to 5MB
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Ingredients List Card */}
        <div className="bg-white rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#FF724C]">
                <ClipboardList className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[13px]">
                Ingredients List
              </h3>
            </div>
            <button
              onClick={() => setIsAddIngredientModalOpen(true)}
              className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-[#FF724C] rounded-xl text-xs font-black transition-all flex items-center gap-2 uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" /> Add Ingredient
            </button>
          </div>

          <div className="space-y-0">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <div className="col-span-6">Ingredient Name</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-center">Unit</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            {/* Rows */}
            <div className="space-y-3">
              {recipeItems.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-4 items-center bg-slate-50/50 hover:bg-slate-50 border border-transparent hover:border-slate-100 p-3 rounded-2xl transition-all group"
                >
                  <div className="col-span-6">
                    <select
                      value={item.ingredientId}
                      onChange={(e) => updateIngredient(idx, e.target.value)}
                      className="w-full bg-white border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select Ingredient</option>
                      {ingredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.quantity || ""}
                      onChange={(e) =>
                        updateQuantity(idx, Number(e.target.value))
                      }
                      placeholder="0"
                      className="w-full text-center bg-white border-slate-100 rounded-xl px-2 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="w-full text-center bg-slate-100/50 rounded-xl px-2 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                      {item.unit || "-"}
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <button
                      onClick={() => removeIngredientRow(idx)}
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              {recipeItems.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl">
                  <p className="text-sm font-medium text-slate-400 italic">
                    Click &quot;Add Ingredient&quot; to start building your
                    recipe.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preparation Method and Tablet Cost Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Preparation Method */}
          <div className="lg:col-span-8 xl:col-span-12 bg-white rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-8 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#FF724C]">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[13px]">
                Preparation Method
              </h3>
            </div>
            <textarea
              value={preparationMethod}
              onChange={(e) => setPreparationMethod(e.target.value)}
              placeholder="Describe the steps to prepare this recipe..."
              className="w-full min-h-[160px] bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none font-medium text-base resize-none"
            />
          </div>

          {/* Tablet Cost Analysis */}
          <div className="lg:col-span-4 xl:hidden bg-[#0F172A] rounded-3xl p-8 text-white shadow-2xl shadow-slate-900/20 h-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                <DollarSign className="w-4 h-4" />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-[13px] opacity-80">
                Cost Analysis
              </h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-sm font-medium text-slate-400">
                  Ingredient Cost
                </span>
                <span className="text-base font-bold text-white">
                  Rp {ingredientCost.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-sm font-medium text-slate-400">
                  Labor Estimate
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Rp</span>
                  <input
                    type="number"
                    value={laborEstimate}
                    onChange={(e) => setLaborEstimate(Number(e.target.value))}
                    className="w-24 bg-transparent border-none p-0 text-right text-base font-bold text-white focus:ring-0 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-black uppercase tracking-wider text-slate-400">
                    Total Production Cost
                  </span>
                  <span className="text-2xl font-black text-white">
                    Rp {totalProductionCost.toLocaleString()}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium italic">
                  Total cost is automatically calculated based on ingredient
                  composition and labor estimate.
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
        {/* End Left Column */}

        {/* Right Column (Desktop Only) */}
        <div className="hidden xl:flex w-full xl:w-[32%] flex-col gap-8 sticky top-8">
          
          {/* Desktop Recipe Image Card */}
          <div className="bg-white rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#FF724C]">
                <ImageIcon className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[13px]">
                Recipe Image
              </h3>
            </div>
            
            <div className="space-y-2">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
                id="recipe-image-upload-desktop"
              />
              <label
                htmlFor="recipe-image-upload-desktop"
                className="h-[240px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors group cursor-pointer overflow-hidden relative"
              >
                {imagePreview ? (
                  <>
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-bold text-sm">
                        Ganti Gambar
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <p className="mt-4 text-sm font-bold text-slate-900">
                      Click to upload or drag and drop
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-400 uppercase tracking-wider">
                      PNG, JPG up to 5MB
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Desktop Cost Analysis Card */}
          <div className="bg-[#0F172A] rounded-3xl p-8 text-white shadow-2xl shadow-slate-900/20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                <DollarSign className="w-4 h-4" />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-[13px] opacity-80">
                Cost Analysis
              </h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-sm font-medium text-slate-400">
                  Ingredient Cost
                </span>
                <span className="text-base font-bold text-white">
                  Rp {ingredientCost.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-sm font-medium text-slate-400">
                  Labor Estimate
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Rp</span>
                  <input
                    type="number"
                    value={laborEstimate}
                    onChange={(e) => setLaborEstimate(Number(e.target.value))}
                    className="w-24 bg-transparent border-none p-0 text-right text-base font-bold text-white focus:ring-0 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-black uppercase tracking-wider text-slate-400">
                    Total Production Cost
                  </span>
                  <span className="text-2xl font-black text-white">
                    Rp {totalProductionCost.toLocaleString()}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium italic">
                  Total cost is automatically calculated based on ingredient
                  composition and labor estimate.
                </p>
              </div>
            </div>
          </div>

        </div>
        {/* End Two-Column Layout Wrapper */}
        </div>
      </div>

      {/* Category Management Modal */}
      {isManageCategoriesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-4xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#FF724C] p-8 flex items-center justify-between text-white">
              <div>
                <h2 className="text-xl font-bold">Manage Categories</h2>
                <p className="text-orange-50 text-xs font-bold mt-1 uppercase tracking-widest">
                  Add, Edit or Delete Product Categories
                </p>
              </div>
              <button
                onClick={() => {
                  setIsManageCategoriesOpen(false);
                  setIsAddingCategory(false);
                  setEditingCategory(null);
                  setCatImagePreview(null);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-thin">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 font-bold text-xs animate-in fade-in slide-in-from-top-2">
                  <Info className="w-4 h-4" />
                  <p>{error}</p>
                </div>
              )}
              {successMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700 font-bold text-xs animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <p>{successMessage}</p>
                </div>
              )}
              {/* Add/Edit Form */}
              {isAddingCategory || editingCategory ? (
                <div className="bg-slate-50 p-6 rounded-4xl border border-slate-100 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-[3px] h-4 bg-[#FF724C] rounded-full"></div>
                    <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">
                      {isAddingCategory ? "Add New Category" : "Edit Category"}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 ml-1">
                          Category Name
                        </label>
                        <input
                          type="text"
                          value={
                            isAddingCategory
                              ? newCategoryName
                              : editingCategory?.name
                          }
                          onChange={(e) =>
                            isAddingCategory
                              ? setNewCategoryName(e.target.value)
                              : setEditingCategory({
                                  ...editingCategory!,
                                  name: e.target.value,
                                })
                          }
                          placeholder="e.g. Dessert, Main Course"
                          className="w-full bg-white border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            isAddingCategory
                              ? handleAddCategory()
                              : handleUpdateCategory(
                                  editingCategory!.id,
                                  editingCategory!.name,
                                  catImagePreview || editingCategory?.image
                                )
                          }
                          disabled={isSubmitting}
                          className="flex-1 py-3.5 bg-[#FF724C] text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 hover:bg-[#E56543] transition-all flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" /> Save
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setIsAddingCategory(false);
                            setEditingCategory(null);
                            setCatImagePreview(null);
                          }}
                          className="px-6 py-3.5 bg-white border border-slate-200 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 ml-1">
                          Category Image (POS)
                        </label>
                        <input
                          type="file"
                          className="hidden"
                          id="cat-image-upload"
                          accept="image/*"
                          onChange={handleCatImageChange}
                        />
                        <label
                          htmlFor="cat-image-upload"
                          className="block h-[120px] border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden cursor-pointer hover:bg-white transition-all relative group"
                        >
                          {catImagePreview || editingCategory?.image ? (
                            <Image
                              src={
                                catImagePreview || editingCategory?.image || ""
                              }
                              fill
                              className="object-cover"
                              alt="Category preview"
                              unoptimized
                            />
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                              <Upload className="w-5 h-5 mb-1" />
                              <span className="text-[10px] font-bold">
                                UPLOAD IMAGE
                              </span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-[10px] font-black uppercase">
                              Change Image
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingCategory(true)}
                  className="w-full py-4 border-2 border-dashed border-slate-200 rounded-4xl text-slate-400 hover:text-[#FF724C] hover:border-orange-500 hover:bg-orange-50/30 transition-all font-bold flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" /> Add New Category
                </button>
              )}

              {/* Category List */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-[3px] h-4 bg-[#FF724C] rounded-full"></div>
                  <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">
                    Existing Categories
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {localCategories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center gap-4 bg-slate-50 hover:bg-white p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 overflow-hidden shadow-sm shrink-0 relative">
                        {cat.image ? (
                          <Image
                            src={cat.image}
                            fill
                            className="object-cover"
                            alt={cat.name}
                            unoptimized
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center text-slate-200">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate">
                          {cat.name}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider tabular-nums">
                          ID: {cat.id.slice(-6)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setCatImagePreview(null);
                          }}
                          className="p-2 text-slate-400 hover:text-[#FF724C] hover:bg-orange-50 rounded-lg transition-all"
                          title="Edit Category Name & Image"
                        >
                          <BookOpen className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Manage your product categories for better POS organization
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Ingredient Slide-over Modal */}
      {isAddIngredientModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-slate-100 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-slate-900">
                  Add Ingredients
                </h2>
                <button
                  onClick={() => setIsAddIngredientModalOpen(false)}
                  className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                Select raw materials from the inventory to include in this
                production batch.
              </p>

              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={ingredientSearchQuery}
                  onChange={(e) => setIngredientSearchQuery(e.target.value)}
                  placeholder="Search materials (e.g. Arabica)..."
                  className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl pl-10 pr-4 py-3 text-sm font-medium outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button className="px-4 py-1.5 bg-[#FF724C] text-white text-xs font-bold rounded-full whitespace-nowrap">
                  All Items
                </button>
                <button className="px-4 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-full whitespace-nowrap transition-colors">
                  Coffee Beans
                </button>
                <button className="px-4 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-full whitespace-nowrap transition-colors">
                  Dairy & Alternatives
                </button>
                <button className="px-4 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-full whitespace-nowrap transition-colors">
                  Sweeteners
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">
                  AVAILABLE MATERIALS
                </h3>
                <div className="space-y-3">
                  {filteredIngredients.map((ing) => {
                    const isSelected = selectedIngredientIds.includes(ing.id);
                    return (
                      <label
                        key={ing.id}
                        className={cn(
                          "flex flex-col p-4 rounded-2xl border cursor-pointer transition-all",
                          isSelected
                            ? "border-[#FF724C] bg-orange-50/50"
                            : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div className="relative flex items-center justify-center w-5 h-5 mt-0.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked)
                                  setSelectedIngredientIds([
                                    ...selectedIngredientIds,
                                    ing.id,
                                  ]);
                                else
                                  setSelectedIngredientIds(
                                    selectedIngredientIds.filter(
                                      (id) => id !== ing.id
                                    )
                                  );
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-5 h-5 border-2 border-slate-200 rounded peer-checked:bg-[#FF724C] bg-white peer-checked:border-[#FF724C] text-transparent peer-checked:text-white flex items-center justify-center transition-all">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 flex justify-between">
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {ing.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                                  Stock: Active
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">
                                  Unit: {ing.unit}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-300">
                              #{ing.id.slice(0, 4)}
                            </span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                  {filteredIngredients.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-500">
                        No ingredients found.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-white shrink-0">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-500">
                  {selectedIngredientIds.length} item
                  {selectedIngredientIds.length !== 1 && "s"} selected
                </span>
                {selectedIngredientIds.length > 0 && (
                  <button
                    onClick={() => setSelectedIngredientIds([])}
                    className="text-xs font-bold text-[#FF724C] hover:text-orange-600 transition-colors"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsAddIngredientModalOpen(false)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSelectedIngredients}
                  disabled={selectedIngredientIds.length === 0}
                  className="flex-1 py-3.5 bg-[#FF724C] text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 hover:bg-[#E56543] disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  Add to Recipe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

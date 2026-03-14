"use client";

import { useState, useMemo, useEffect } from "react";
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
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  costPerUnit: number;
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

interface RecipeRegistrationClientProps {
  ingredients: Ingredient[];
  categories: Category[];
}

export default function RecipeRegistrationClient({ ingredients, categories }: RecipeRegistrationClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [sku, setSku] = useState("REC-001");
  const [categoryId, setCategoryId] = useState("");
  const [basePrice, setBasePrice] = useState<number>(0);
  const [image, setImage] = useState<string | null>(null);
  const [preparationMethod, setPreparationMethod] = useState("");
  const [recipeItems, setRecipeItems] = useState<RecipeIngredient[]>([
    { ingredientId: "", quantity: 0, unit: "", cost: 0 }
  ]);
  const [laborEstimate, setLaborEstimate] = useState<number>(5000); 
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [localCategories, setLocalCategories] = useState(categories);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catImagePreview, setCatImagePreview] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useMemo(() => ({ current: null as HTMLInputElement | null }), []);
  const catFileInputRef = useMemo(() => ({ current: null as HTMLInputElement | null }), []);

  // Calculations
  const ingredientCost = useMemo(() => {
    return recipeItems.reduce((acc, item) => acc + (item.cost || 0), 0);
  }, [recipeItems]);

  const totalProductionCost = useMemo(() => {
    return ingredientCost + laborEstimate;
  }, [ingredientCost, laborEstimate]);

  const addIngredientRow = () => {
    setRecipeItems([...recipeItems, { ingredientId: "", quantity: 0, unit: "", cost: 0 }]);
  };

  const removeIngredientRow = (index: number) => {
    setRecipeItems(recipeItems.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, ingredientId: string) => {
    const selectedIng = ingredients.find(ing => ing.id === ingredientId);
    const newItems = [...recipeItems];
    newItems[index] = {
      ...newItems[index],
      ingredientId,
      unit: selectedIng?.unit || "",
      cost: (selectedIng?.costPerUnit || 0) * (newItems[index].quantity || 0)
    };
    setRecipeItems(newItems);
  };

  const updateQuantity = (index: number, quantity: number) => {
    const newItems = [...recipeItems];
    const selectedIng = ingredients.find(ing => ing.id === newItems[index].ingredientId);
    newItems[index] = {
      ...newItems[index],
      quantity,
      cost: (selectedIng?.costPerUnit || 0) * quantity
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
    try {
      const res = await fetch("/api/inventory/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName, image: catImagePreview }),
      });
      if (!res.ok) throw new Error("Gagal menambah kategori");
      const data = await res.json();
      
      setLocalCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setCategoryId(data.id);
      setIsAddingCategory(false);
      setNewCategoryName("");
      setCatImagePreview(null);
      setSuccessMessage("Category Created Successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async (id: string, name: string, image?: string | null) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/inventory/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image }),
      });
      if (!res.ok) throw new Error("Gagal memperbarui kategori");
      const data = await res.json();
      
      setLocalCategories(prev => prev.map(cat => cat.id === id ? data : cat).sort((a, b) => a.name.localeCompare(b.name)));
      setEditingCategory(null);
      setCatImagePreview(null);
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
    if (!confirm("Are you sure you want to delete this category? Products in this category may become unorganized.")) return;
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
        throw new Error("Mohon lengkapi informasi produk (Nama, Kategori, Harga)");
      }

      const validItems = recipeItems.filter(item => item.ingredientId && item.quantity > 0);
      if (validItems.length === 0) {
        throw new Error("Mohon tambahkan setidaknya satu bahan ke dalam resep");
      }

      const res = await fetch("/api/inventory/recipes/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          sku,
          categoryId,
          price: basePrice,
          image,
          preparationMethod,
          ingredients: validItems
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan resep");
      }

      router.push("/dashboard/inventory");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header with Back Button and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/inventory"
            className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF724C]">
              <ChefHat className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Add New Recipe</h1>
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
            className="px-6 py-2.5 bg-[#1E3A8A] hover:bg-[#1E40AF] disabled:bg-slate-300 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/10 transition-all flex items-center gap-2"
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
          <h2 className="text-3xl font-bold text-slate-900">Recipe Details</h2>
          <p className="text-slate-500 font-medium">Create a new recipe by providing product information and ingredient composition.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-4">
            <Info className="w-5 h-5" />
            <p className="text-sm font-bold">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto p-1.5 hover:bg-red-100 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Product Information Card */}
        <div className="bg-white rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Package className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[13px]">Product Information</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Recipe Name</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Signature Chocolate Fondant"
                  className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">SKU</label>
                  <input 
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-base"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-sm font-bold text-slate-700">Category</label>
                    <button 
                      type="button"
                      onClick={() => setIsManageCategoriesOpen(true)}
                      className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-wider"
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
                        className="flex-1 bg-slate-50 border-slate-100 rounded-2xl px-4 py-3 text-sm font-medium outline-none border focus:border-blue-500"
                        autoFocus
                      />
                      <button 
                        onClick={handleAddCategory}
                        className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
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
                        className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-base appearance-none cursor-pointer"
                      >
                        <option value="">Select Category</option>
                        {localCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Plus className="w-4 h-4 rotate-45" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Base Price (Rp)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span>
                  <input 
                    type="number"
                    value={basePrice || ""}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-slate-50 border-slate-100 rounded-2xl pl-12 pr-5 py-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-base"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Recipe Image</label>
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
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-bold text-sm">Ganti Gambar</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <p className="mt-4 text-sm font-bold text-slate-900">Click to upload or drag and drop</p>
                    <p className="mt-1 text-xs font-medium text-slate-400 uppercase tracking-wider">PNG, JPG up to 5MB</p>
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
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <ClipboardList className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[13px]">Ingredients List</h3>
            </div>
            <button 
              onClick={addIngredientRow}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-black transition-all flex items-center gap-2 uppercase tracking-wider"
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
                <div key={idx} className="grid grid-cols-12 gap-4 items-center bg-slate-50/50 hover:bg-slate-50 border border-transparent hover:border-slate-100 p-3 rounded-2xl transition-all group">
                  <div className="col-span-6">
                    <select 
                      value={item.ingredientId}
                      onChange={(e) => updateIngredient(idx, e.target.value)}
                      className="w-full bg-white border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select Ingredient</option>
                      {ingredients.map(ing => (
                        <option key={ing.id} value={ing.id}>{ing.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input 
                      type="number"
                      value={item.quantity || ""}
                      onChange={(e) => updateQuantity(idx, Number(e.target.value))}
                      placeholder="0"
                      className="w-full text-center bg-white border-slate-100 rounded-xl px-2 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
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
                  <p className="text-sm font-medium text-slate-400 italic">Click &quot;Add Ingredient&quot; to start building your recipe.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preparation Method and Cost Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Preparation Method */}
          <div className="lg:col-span-8 bg-white rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-8 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[13px]">Preparation Method</h3>
            </div>
            <textarea 
              value={preparationMethod}
              onChange={(e) => setPreparationMethod(e.target.value)}
              placeholder="Describe the steps to prepare this recipe..."
              className="w-full min-h-[160px] bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none font-medium text-base resize-none"
            />
          </div>

          {/* Cost Analysis */}
          <div className="lg:col-span-4 bg-[#0F172A] rounded-3xl p-8 text-white shadow-2xl shadow-slate-900/20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                <DollarSign className="w-4 h-4" />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-[13px] opacity-80">Cost Analysis</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-sm font-medium text-slate-400">Ingredient Cost</span>
                <span className="text-base font-bold text-white">Rp {ingredientCost.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-sm font-medium text-slate-400">Labor Estimate</span>
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
                  <span className="text-sm font-black uppercase tracking-wider text-slate-400">Total Production Cost</span>
                  <span className="text-2xl font-black text-white">Rp {totalProductionCost.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium italic">Total cost is automatically calculated based on ingredient composition and labor estimate.</p>
              </div>
            </div>
          </div>
      </div>
    </div>

    {/* Category Management Modal */}
      {isManageCategoriesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-4xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 p-8 flex items-center justify-between text-white">
              <div>
                <h2 className="text-xl font-bold">Manage Categories</h2>
                <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Add, Edit or Delete Product Categories</p>
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
              {(isAddingCategory || editingCategory) ? (
                <div className="bg-slate-50 p-6 rounded-4xl border border-slate-100 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-[3px] h-4 bg-blue-600 rounded-full"></div>
                    <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">
                      {isAddingCategory ? "Add New Category" : "Edit Category"}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 ml-1">Category Name</label>
                        <input 
                          type="text"
                          value={isAddingCategory ? newCategoryName : editingCategory?.name}
                          onChange={(e) => isAddingCategory ? setNewCategoryName(e.target.value) : setEditingCategory({ ...editingCategory!, name: e.target.value })}
                          placeholder="e.g. Dessert, Main Course"
                          className="w-full bg-white border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => isAddingCategory ? handleAddCategory() : handleUpdateCategory(editingCategory!.id, editingCategory!.name, catImagePreview || editingCategory?.image)}
                          disabled={isSubmitting}
                          className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Save</>}
                        </button>
                        <button 
                          onClick={() => { setIsAddingCategory(false); setEditingCategory(null); setCatImagePreview(null); }}
                          className="px-6 py-3.5 bg-white border border-slate-200 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 ml-1">Category Image (POS)</label>
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
                          {(catImagePreview || (editingCategory as any)?.image) ? (
                            <img src={catImagePreview || (editingCategory as any)?.image} className="w-full h-full object-cover" alt="Category preview" />
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                              <Upload className="w-5 h-5 mb-1" />
                              <span className="text-[10px] font-bold">UPLOAD IMAGE</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-[10px] font-black uppercase">Change Image</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAddingCategory(true)}
                  className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50/30 transition-all font-bold flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" /> Add New Category
                </button>
              )}

              {/* Category List */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-[3px] h-4 bg-orange-500 rounded-full"></div>
                  <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Existing Categories</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {localCategories.map((cat: any) => (
                    <div key={cat.id} className="flex items-center gap-4 bg-slate-50 hover:bg-white p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all group">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 overflow-hidden shadow-sm shrink-0">
                        {cat.image ? (
                          <img src={cat.image} className="w-full h-full object-cover" alt={cat.name} />
                        ) : (
                          <div className="h-full flex items-center justify-center text-slate-200">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate">{cat.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider tabular-nums">ID: {cat.id.slice(-6)}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingCategory(cat); setCatImagePreview(null); }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
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
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Manage your product categories for better POS organization</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

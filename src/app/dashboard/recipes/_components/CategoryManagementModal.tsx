import React, { useState } from "react";
import { X, Info, CheckCircle2, Plus, Loader2, Upload, ImageIcon, BookOpen, Trash2 } from "lucide-react";
import Image from "next/image";
import { type Category } from "../types";

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (name: string, image: string | null) => Promise<void>;
  onUpdateCategory: (id: string, name: string, image: string | null) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;
  setError: (err: string | null) => void;
  setSuccessMessage: (msg: string | null) => void;
}

export function CategoryManagementModal({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  isSubmitting,
  error,
  successMessage,
  setError,
  setSuccessMessage,
}: CategoryManagementModalProps) {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [catImagePreview, setCatImagePreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCatImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCatImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setIsAddingCategory(false);
    setEditingCategory(null);
    setCatImagePreview(null);
    setNewCategoryName("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] w-full max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="px-8 pt-8 pb-6 flex items-start justify-between bg-white border-b border-slate-50 relative z-10">
          <div>
            <h2 className="text-[28px] font-black text-slate-900 leading-tight">
              Manage Categories
            </h2>
            <p className="text-slate-400 text-[13px] font-bold mt-1 uppercase tracking-wide">
              Add, Edit or Delete Product Categories
            </p>
          </div>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all active:scale-90"
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
                <div className="w-[3px] h-4 bg-primary rounded-full"></div>
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
                      value={isAddingCategory ? newCategoryName : editingCategory?.name || ""}
                      onChange={(e) =>
                        isAddingCategory
                          ? setNewCategoryName(e.target.value)
                          : setEditingCategory({
                              ...editingCategory!,
                              name: e.target.value,
                            })
                      }
                      placeholder="e.g. Dessert, Main Course"
                      className="w-full bg-white border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all border"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        if (isAddingCategory) {
                          await onAddCategory(newCategoryName, catImagePreview);
                          if (!error) resetForm();
                        } else if (editingCategory) {
                          await onUpdateCategory(
                            editingCategory.id,
                            editingCategory.name,
                            catImagePreview || editingCategory.image || null
                          );
                          if (!error) resetForm();
                        }
                      }}
                      disabled={isSubmitting}
                      className="flex-1 py-3.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
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
                      onClick={resetForm}
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
                          src={catImagePreview || editingCategory?.image || ""}
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
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-4xl text-slate-400 hover:text-primary hover:border-primary/50 hover:bg-primary-light/30 transition-all font-bold flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add New Category
            </button>
          )}

          {/* Category List */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-[3px] h-4 bg-primary rounded-full"></div>
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">
                Existing Categories
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((cat) => (
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
                      className="p-2 text-slate-400 hover:text-primary hover:bg-primary-light rounded-lg transition-all"
                      title="Edit Category Name & Image"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteCategory(cat.id)}
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
  );
}

import React from "react";
import { Package, Plus, ImageIcon } from "lucide-react";
import Image from "next/image";
import { type Category } from "../types";

interface ProductInformationFormProps {
  name: string;
  setName: (val: string) => void;
  categoryId: string;
  setCategoryId: (val: string) => void;
  categories: Category[];
  basePriceDisplay: string;
  onPriceChange: (val: string) => void;
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onManageCategories: () => void;
}

export function ProductInformationForm({
  name,
  setName,
  categoryId,
  setCategoryId,
  categories,
  basePriceDisplay,
  onPriceChange,
  imagePreview,
  onImageChange,
  onManageCategories,
}: ProductInformationFormProps) {
  return (
    <div className="bg-white rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary">
          <Package className="w-4 h-4" />
        </div>
        <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[13px]">
          Product Information
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-10 xl:gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Recipe Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Signature Chocolate Fondant"
              className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium text-base border"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-sm font-bold text-slate-700">Category</label>
              <button
                type="button"
                onClick={onManageCategories}
                className="text-[10px] font-black text-primary hover:text-primary-dark uppercase tracking-wider"
              >
                Manage Category
              </button>
            </div>
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium text-base appearance-none cursor-pointer border"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Plus className="w-4 h-4 rotate-45" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Base Price (Rp)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={basePriceDisplay}
                onChange={(e) => onPriceChange(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-50 border-slate-100 rounded-2xl pl-12 pr-5 py-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium text-base border"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 xl:hidden">
          <label className="text-sm font-bold text-slate-700 ml-1">Recipe Image</label>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={onImageChange}
            id="recipe-image-upload"
          />
          <label
            htmlFor="recipe-image-upload"
            className="h-[240px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors group cursor-pointer overflow-hidden relative"
          >
            {imagePreview ? (
              <>
                <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized />
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
  );
}

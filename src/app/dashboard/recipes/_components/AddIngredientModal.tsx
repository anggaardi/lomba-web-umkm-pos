import React from "react";
import { X, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Ingredient } from "../types";

interface AddIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredients: Ingredient[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedIds: string[];
  onToggleId: (id: string) => void;
  onClearSelection: () => void;
  onAddSelected: () => void;
}

export function AddIngredientModal({
  isOpen,
  onClose,
  ingredients,
  searchQuery,
  setSearchQuery,
  selectedIds,
  onToggleId,
  onClearSelection,
  onAddSelected,
}: AddIngredientModalProps) {
  if (!isOpen) return null;

  const filteredIngredients = !searchQuery
    ? ingredients
    : ingredients.filter((ing) => ing.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        <div className="p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-slate-900">Add Ingredients</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Select raw materials from the inventory to include in this production batch.
          </p>

          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search materials (e.g. Arabica)..."
              className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl pl-10 pr-4 py-3 text-sm font-medium outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-full whitespace-nowrap">
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

        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          <div>
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">
              AVAILABLE MATERIALS
            </h3>
            <div className="space-y-3">
              {filteredIngredients.map((ing) => {
                const isSelected = selectedIds.includes(ing.id);
                return (
                  <label
                    key={ing.id}
                    className={cn(
                      "flex flex-col p-4 rounded-2xl border cursor-pointer transition-all",
                      isSelected
                        ? "border-primary bg-primary-light/50"
                        : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative flex items-center justify-center w-5 h-5 mt-0.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleId(ing.id)}
                          className="sr-only peer"
                        />
                        <div className="w-5 h-5 border-2 border-slate-200 rounded peer-checked:bg-primary bg-white peer-checked:border-primary text-transparent peer-checked:text-white flex items-center justify-center transition-all">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 flex justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{ing.name}</p>
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
                  <p className="text-sm text-slate-500">No ingredients found.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-white shrink-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500">
              {selectedIds.length} item{selectedIds.length !== 1 && "s"} selected
            </span>
            {selectedIds.length > 0 && (
              <button
                onClick={onClearSelection}
                className="text-xs font-bold text-primary hover:text-primary-dark transition-colors"
              >
                Clear Selection
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onAddSelected}
              disabled={selectedIds.length === 0}
              className="flex-1 py-3.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark disabled:opacity-50 disabled:shadow-none transition-all"
            >
              Add to Recipe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

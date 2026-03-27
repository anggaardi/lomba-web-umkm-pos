import React from "react";
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { type Ingredient, type RecipeIngredient } from "../types";

interface IngredientsListFormProps {
  recipeItems: RecipeIngredient[];
  ingredients: Ingredient[];
  onUpdateIngredient: (idx: number, id: string) => void;
  onUpdateQuantity: (idx: number, qty: number) => void;
  onRemoveRow: (idx: number) => void;
  onOpenModal: () => void;
}

export function IngredientsListForm({
  recipeItems,
  ingredients,
  onUpdateIngredient,
  onUpdateQuantity,
  onRemoveRow,
  onOpenModal,
}: IngredientsListFormProps) {
  return (
    <div className="bg-white rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary">
            <ClipboardList className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[13px]">
            Ingredients List
          </h3>
        </div>
        <button
          onClick={onOpenModal}
          className="px-4 py-2 bg-primary-light hover:bg-primary/10 text-primary rounded-xl text-xs font-black transition-all flex items-center gap-2 uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" /> Add Ingredient
        </button>
      </div>

      <div className="space-y-0">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
          <div className="col-span-6">Ingredient Name</div>
          <div className="col-span-2 text-center">Quantity</div>
          <div className="col-span-2 text-center">Unit</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        <div className="space-y-3">
          {recipeItems.map((item, idx) => (
            <div
              key={`${item.ingredientId}-${idx}`}
              className="grid grid-cols-12 gap-4 items-center bg-slate-50/50 hover:bg-slate-50 border border-transparent hover:border-slate-100 p-3 rounded-2xl transition-all group"
            >
              <div className="col-span-6">
                <select
                  value={item.ingredientId}
                  onChange={(e) => onUpdateIngredient(idx, e.target.value)}
                  className="w-full bg-white border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all appearance-none cursor-pointer border"
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
                  onChange={(e) => onUpdateQuantity(idx, Number(e.target.value))}
                  placeholder="0"
                  className="w-full text-center bg-white border-slate-100 rounded-xl px-2 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all border"
                />
              </div>
              <div className="col-span-2">
                <div className="w-full text-center bg-slate-100/50 rounded-xl px-2 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest border">
                  {item.unit || "-"}
                </div>
              </div>
              <div className="col-span-2 text-right">
                <button
                  onClick={() => onRemoveRow(idx)}
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
                Click &quot;Add Ingredient&quot; to start building your recipe.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

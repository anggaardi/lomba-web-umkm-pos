import { ChevronRight } from "lucide-react";
import type { PosCategory } from "@/types/pos";

const categoryImages: Record<string, string> = {
  FOOD: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=200&auto=format&fit=crop",
  DRINK: "https://images.unsplash.com/photo-1544145945-f904253d0c7b?q=80&w=200&auto=format&fit=crop",
  PASTA: "https://images.unsplash.com/photo-1473093226795-af9932fe5855?q=80&w=200&auto=format&fit=crop",
  DESSERT: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=200&auto=format&fit=crop",
  SOUP: "https://images.unsplash.com/photo-1547592110-803993f2851d?q=80&w=200&auto=format&fit=crop",
};

export function CategoryFilter({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: {
  categories: PosCategory[];
  selectedCategoryId: string | "all";
  onSelectCategory: (id: string | "all") => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Categories of</h2>
        <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-orange-500 transition-colors group">
          View All
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white transition-transform group-hover:translate-x-1">
            <ChevronRight className="h-3 w-3" />
          </div>
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => onSelectCategory("all")}
          className={`shrink-0 relative w-32 h-20 rounded-xl overflow-hidden group transition-all ${
            selectedCategoryId === "all" ? "ring-2 ring-orange-500" : ""
          }`}
        >
          <div className="absolute inset-0 bg-gray-800 transition-opacity group-hover:opacity-80"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-black text-sm tracking-widest uppercase">
              ALL
            </span>
          </div>
        </button>
        {categories.map((cat: PosCategory) => {
          const imageUrl =
            cat.image ||
            categoryImages[cat.name.toUpperCase()] ||
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=200&auto=format&fit=crop";
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 relative w-32 h-20 rounded-xl overflow-hidden group transition-all ${
                selectedCategoryId === cat.id ? "ring-2 ring-orange-500" : ""
              }`}
            >
              <img
                src={imageUrl}
                className="absolute inset-0 w-full h-full object-cover"
                alt={cat.name}
              />
              <div className="absolute inset-0 bg-black/40 transition-opacity group-hover:opacity-60"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-black text-sm tracking-widest uppercase">
                  {cat.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

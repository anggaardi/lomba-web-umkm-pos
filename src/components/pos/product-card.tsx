import { memo } from "react";
import type { PosProduct } from "@/types/pos";

export const ProductCard = memo(
  ({
    product,
    availablePortions,
    onAddToCart,
  }: {
    product: PosProduct;
    availablePortions: number;
    onAddToCart: (product: PosProduct) => void;
  }) => {
    const isOutOfStock = availablePortions <= 0;

    return (
      <button
        disabled={isOutOfStock}
        onClick={() => onAddToCart(product)}
        className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md hover:-translate-y-1 text-left w-full flex flex-col ${
          isOutOfStock
            ? "opacity-60 grayscale cursor-not-allowed"
            : "cursor-pointer active:scale-95"
        }`}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden p-2">
          <img
            src={
              product.image ||
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&auto=format&fit=crop"
            }
            alt={product.name}
            className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-3 pt-1 space-y-1 flex-1 flex flex-col">
          <h4 className="text-sm font-bold text-gray-800 line-clamp-1 leading-tight group-hover:text-orange-600 transition-colors">
            {product.name}
          </h4>
          <p className="text-[10px] font-bold text-emerald-500">
            {availablePortions} Tersedia
          </p>
          <div className="pt-1">
            <p className="text-sm font-black text-orange-500">
              IDR {product.price.toLocaleString()}
            </p>
          </div>
        </div>
      </button>
    );
  }
);

ProductCard.displayName = "ProductCard";

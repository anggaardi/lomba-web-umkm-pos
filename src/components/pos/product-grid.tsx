import { useWindowVirtualizer } from "@tanstack/react-virtual";
import type { PosProduct } from "@/types/pos";

const COLUMN_COUNT = 5;
const ITEM_HEIGHT = 220;
export function ProductGrid({
  products,
  productAvailability,
  onAddToCart,
}: {
  products: PosProduct[];
  productAvailability: Map<string, number>;
  onAddToCart: (product: PosProduct) => void;
}) {
  const rowVirtualizer = useWindowVirtualizer({
    count: Math.ceil(products.length / COLUMN_COUNT),
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5,
  });

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200">
        <p className="text-gray-400 font-medium italic">
          Belum ada produk tersedia.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * COLUMN_COUNT;
          const rowProducts = products.slice(
            startIndex,
            startIndex + COLUMN_COUNT
          );

          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-4">
                {rowProducts.map((product) => {
                  const availablePortions =
                    productAvailability.get(product.id) || 0;
                  const isOutOfStock = availablePortions <= 0;

                  return (
                    <button
                      key={product.id}
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
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

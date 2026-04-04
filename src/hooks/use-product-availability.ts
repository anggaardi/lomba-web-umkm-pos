import { useMemo } from "react";
import type { PosProduct, PosIngredient, CartItem } from "@/types/pos";

export function useProductAvailability(
  initialProducts: PosProduct[],
  ingredients: PosIngredient[],
  cart: CartItem[]
) {
  const virtualIngredientStock = useMemo(() => {
    const stockMap = new Map(ingredients.map((ing) => [ing.id, ing.stock]));
    cart.forEach((item) => {
      item.product.recipes.forEach((recipe) => {
        const currentStock = stockMap.get(recipe.ingredientId) || 0;
        stockMap.set(
          recipe.ingredientId,
          currentStock - recipe.quantity * item.quantity
        );
      });
    });
    return stockMap;
  }, [ingredients, cart]);

  const productAvailability = useMemo(() => {
    const availabilityMap = new Map<string, number>();
    initialProducts.forEach((product) => {
      if (product.recipes.length === 0) {
        availabilityMap.set(product.id, 999);
        return;
      }
      let maxPortions = Infinity;
      product.recipes.forEach((recipe) => {
        const remainingStock =
          virtualIngredientStock.get(recipe.ingredientId) || 0;
        const possiblePortions = Math.floor(remainingStock / recipe.quantity);
        maxPortions = Math.min(maxPortions, possiblePortions);
      });
      availabilityMap.set(product.id, maxPortions < 0 ? 0 : maxPortions);
    });
    return availabilityMap;
  }, [initialProducts, virtualIngredientStock]);

  return { virtualIngredientStock, productAvailability };
}

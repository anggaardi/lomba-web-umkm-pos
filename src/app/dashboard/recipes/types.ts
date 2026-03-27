export type Ingredient = {
  id: string;
  name: string;
  stock: number;
  unit: string;
  averageCostPerUnit: number;
};

export type Category = {
  id: string;
  name: string;
  image?: string | null;
};

export type RecipeIngredient = {
  ingredientId: string;
  quantity: number;
  unit: string;
  cost: number;
};

export interface InitialRecipeData {
  id: string;
  name: string;
  categoryId: string;
  basePrice: number;
  image: string | null;
  preparationMethod: string;
  recipeItems: RecipeIngredient[];
}

export type RecipeItem = {
  id: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  recipes: RecipeItem[];
};

export type Packaging = {
  id: string;
  name: string;
  conversionValue: number;
};

export type Ingredient = {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  unit: string;
  averageCostPerUnit: number;
  lastPurchasePrice: number | null;
  updatedAt: string;
  packagings: Packaging[];
};

export type StockStatus = "NORMAL" | "MENIPIS" | "HABIS";

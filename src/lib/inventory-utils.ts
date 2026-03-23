export type StockStatus = "HABIS" | "MENIPIS" | "NORMAL";

export function getStockStatus(stock: number, minStock: number): StockStatus {
  if (stock <= 0) return "HABIS";
  if (minStock > 0 && stock <= minStock) return "MENIPIS";
  return "NORMAL";
}

import { z } from "zod";
import { StockMovementType, StockMovementSource } from "@prisma/client";

// Ingredient Schemas
export const ingredientCreateSchema = z.object({
  name: z.string().min(1, "Nama bahan baku wajib diisi").max(100),
  unit: z.string().min(1, "Satuan wajib diisi").max(20),
  costPerUnit: z.coerce.number().positive("Harga per satuan harus positif"),
  initialStock: z.coerce.number().nonnegative("Stok awal tidak boleh negatif").optional(),
});

export const ingredientUpdateStockSchema = z.object({
  quantity: z.coerce.number().positive("Jumlah harus positif"),
  type: z.nativeEnum(StockMovementType),
  source: z.nativeEnum(StockMovementSource),
  notes: z.string().max(255).optional(),
});

// Recipe Schemas
export const recipeItemSchema = z.object({
  ingredientId: z.string().cuid2().or(z.string().cuid()), // Support both cuid and cuid2
  quantity: z.coerce.number().positive("Jumlah bahan harus positif"),
});

export const recipeUpdateSchema = z.object({
  productId: z.string().min(1, "Product ID wajib diisi"),
  ingredients: z.array(recipeItemSchema).min(1, "Minimal satu bahan baku untuk resep"),
});

// POS Transaction Schemas
export const posItemInputSchema = z.object({
  productId: z.string().min(1, "Product ID wajib diisi"),
  quantity: z.coerce.number().int().positive("Quantity harus minimal 1"),
});

export const createPosRequestSchema = z.object({
  items: z.array(posItemInputSchema).min(1, "Daftar item tidak boleh kosong"),
  paymentMethod: z.string().min(1, "Payment method wajib diisi"),
  branchId: z.string().nullable().optional(),
  applyTax: z.boolean().optional(),
  applyServiceCharge: z.boolean().optional(),
});

export const voidTransactionSchema = z.object({
  action: z.literal("VOID"),
});

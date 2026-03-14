import { prisma } from "./prisma";
import { StockMovementSource, StockMovementType, Prisma } from "@prisma/client";

export type TransactionClient = Omit<
  Prisma.TransactionClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

interface MovementParams {
  ingredientId: string;
  tenantId: string;
  quantity: number;
  type: StockMovementType;
  source: StockMovementSource;
  referenceId?: string;
  notes?: string;
}

/**
 * Record a stock movement and update the current stock level of an ingredient.
 * Uses atomic update to prevent race conditions.
 */
export async function recordStockMovement(
  params: MovementParams,
  tx?: TransactionClient
) {
  const execute = async (p: TransactionClient) => {
    const stockChange = params.type === "OUT" ? -params.quantity : params.quantity;

    // Atomic update — WHERE clause prevents negative stock in one DB operation
    let updatedIngredient;
    try {
      updatedIngredient = await p.ingredient.update({
        where: {
          id: params.ingredientId,
          tenantId: params.tenantId,
          ...(params.type === "OUT" ? { stock: { gte: params.quantity } } : {}),
        },
        data: {
          stock: { increment: stockChange },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        // P2025 = record not found → stok tidak mencukupi atau bahan tidak ada
        const ingredient = await p.ingredient.findFirst({
          where: { id: params.ingredientId, tenantId: params.tenantId },
          select: { name: true, stock: true },
        });

        if (!ingredient) {
          throw new Error("Bahan baku tidak ditemukan.");
        }

        throw new Error(
          `Stok tidak mencukupi untuk "${ingredient.name}". ` +
          `Tersedia: ${ingredient.stock}, dibutuhkan: ${params.quantity}.`
        );
      }
      throw error;
    }

    // Create audit trail movement record
    const movement = await p.stockMovement.create({
      data: {
        ingredientId: params.ingredientId,
        tenantId: params.tenantId,
        quantity: params.quantity,
        type: params.type,
        source: params.source,
        referenceId: params.referenceId,
        notes: params.notes,
      },
    });

    return { updatedIngredient, movement };
  };

  if (tx) {
    return execute(tx);
  } else {
    return prisma.$transaction(async (newTx) => {
      return execute(newTx as TransactionClient);
    });
  }
}

/**
 * Deduct stock based on a recipe for a specific product and quantity.
 */
export async function deductStockByRecipe(
  productId: string,
  productQuantity: number,
  tenantId: string,
  referenceId: string,
  tx: TransactionClient
) {
  const recipes = await tx.recipe.findMany({
    where: {
      productId,
      product: { tenantId },
    },
    include: { ingredient: true },
  });

  if (recipes.length === 0) {
    console.warn(`[INVENTORY] Product ${productId} has no recipe. Skipping stock deduction.`);
    return;
  }

  await Promise.all(
    recipes.map((recipe) =>
      recordStockMovement(
        {
          ingredientId: recipe.ingredientId,
          tenantId,
          quantity: recipe.quantity * productQuantity,
          type: "OUT",
          source: "SALE",
          referenceId,
          notes: `Penjualan Produk (x${productQuantity})`,
        },
        tx
      )
    )
  );
}

/**
 * Restore stock for a voided transaction.
 */
export async function restoreStockByTransaction(
  transactionId: string,
  tenantId: string,
  tx: TransactionClient
) {
  const transaction = await tx.transaction.findUnique({
    where: { id: transactionId, tenantId },
    include: {
      items: {
        include: {
          product: {
            include: { recipes: true },
          },
        },
      },
    },
  });

  if (!transaction) throw new Error("Transaksi tidak ditemukan.");

  if (transaction.status !== "COMPLETED") {
    throw new Error(
      `Transaksi dengan status ${transaction.status} tidak dapat di-void.`
    );
  }

  const restorationPromises: Promise<unknown>[] = [];

  for (const item of transaction.items) {
    for (const recipe of item.product.recipes) {
      restorationPromises.push(
        recordStockMovement(
          {
            ingredientId: recipe.ingredientId,
            tenantId,
            quantity: recipe.quantity * item.quantity,
            type: "IN",
            source: "VOID",
            referenceId: transactionId,
            notes: `Void Transaksi ${transactionId}`,
          },
          tx
        )
      );
    }
  }

  await Promise.all(restorationPromises);
}
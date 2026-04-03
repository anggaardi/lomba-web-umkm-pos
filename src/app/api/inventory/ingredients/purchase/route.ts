import { prisma } from "@/lib/prisma";
import { requireTenant, handleAuthError } from "@/lib/auth";
import { NextResponse } from "next/server";
import { ingredientPurchaseSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rateLimit";

const limiter = rateLimit(10, 60000);
// POST /api/inventory/ingredients/purchase
// Handle ingredient purchase with UOM conversion
export async function POST(req: Request) {
  try {
    const { tenant } = await requireTenant();
    const rateLimitResponse = await limiter(req);
    if (rateLimitResponse) return rateLimitResponse;
    const body = await req.json();
    
    const validation = ingredientPurchaseSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.issues.map(i => i.message).join(", ");
      return NextResponse.json(
        { error: errors },
        { status: 400 }
      );
    }

    const { 
      ingredientId, 
      packagingId, 
      customConversionValue, 
      purchaseQty, 
      totalPrice, 
      notes 
    } = validation.data;

    // 1. Get Ingredient and Packaging details
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId, tenantId: tenant.id },
      include: { packagings: true }
    });

    if (!ingredient) {
      return NextResponse.json({ error: "Ingredient not found" }, { status: 404 });
    }

    let conversionValue = 1;
    let packagingName = "Manual";

    if (packagingId) {
      const packaging = ingredient.packagings.find(p => p.id === packagingId);
      if (!packaging) {
        return NextResponse.json({ error: "Packaging not found" }, { status: 400 });
      }
      conversionValue = packaging.conversionValue;
      packagingName = packaging.name;
    } else if (customConversionValue) {
      conversionValue = customConversionValue;
      packagingName = `Custom (${conversionValue} ${ingredient.unit})`;
    }

    // 2. Calculations
    const totalBaseQty = purchaseQty * conversionValue;
    const costPerBaseUnit = totalPrice / totalBaseQty;

    // 3. Update in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update ingredient stock and average cost
      // New Average Cost = (Old Stock * Old Avg Cost + New Total Price) / (Old Stock + New Stock)
      const oldStock = ingredient.stock;
      const oldAvgCost = Number(ingredient.averageCostPerUnit);
      const newStock = oldStock + totalBaseQty;
      const newAvgCost = (oldStock * oldAvgCost + totalPrice) / newStock;

      const updatedIngredient = await tx.ingredient.update({
        where: { id: ingredientId },
        data: {
          stock: newStock,
          averageCostPerUnit: newAvgCost,
          lastPurchasePrice: costPerBaseUnit,
        },
      });

      // Record Stock Movement
      const movement = await tx.stockMovement.create({
        data: {
          ingredientId,
          tenantId: tenant.id,
          quantity: totalBaseQty,
          type: "IN",
          source: "PURCHASE",
          purchaseQty,
          purchaseUnit: packagingName,
          purchasePrice: totalPrice,
          notes: notes || `Pembelian ${purchaseQty} ${packagingName}`,
        },
      });

      return { ingredient: updatedIngredient, movement };
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    return handleAuthError(error);
  }
}

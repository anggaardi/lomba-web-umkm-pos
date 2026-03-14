import { prisma } from "@/lib/prisma";
import { requireTenant, handleAuthError } from "@/lib/auth";
import { NextResponse } from "next/server";
import { ingredientCreateSchema } from "@/lib/validations";

// GET /api/inventory/ingredients
// List all ingredients for the tenant
export async function GET() {
  try {
    const { tenant } = await requireTenant();

    const ingredients = await prisma.ingredient.findMany({
      where: { tenantId: tenant.id },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ ingredients });
  } catch (error: unknown) {
    return handleAuthError(error);
  }
}

// POST /api/inventory/ingredients
// Create a new ingredient
export async function POST(req: Request) {
  try {
    const { tenant } = await requireTenant();
    const body = await req.json();
    
    const validation = ingredientCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, unit, costPerUnit, initialStock } = validation.data;

    const ingredient = await prisma.$transaction(async (tx) => {
      const newIngredient = await tx.ingredient.create({
        data: {
          name,
          unit,
          costPerUnit: costPerUnit.toString(), // Use string for Decimal precision
          stock: initialStock || 0,
          tenantId: tenant.id,
        },
      });

      if (initialStock && initialStock > 0) {
        await tx.stockMovement.create({
          data: {
            ingredientId: newIngredient.id,
            tenantId: tenant.id,
            quantity: initialStock,
            type: "IN",
            source: "PURCHASE",
            notes: "Stok awal saat pembuatan data",
          },
        });
      }

      return newIngredient;
    });

    return NextResponse.json({ ingredient }, { status: 201 });
  } catch (error: unknown) {
    return handleAuthError(error);
  }
}

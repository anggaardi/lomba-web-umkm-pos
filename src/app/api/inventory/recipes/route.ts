import { prisma } from "@/lib/prisma";
import { requireTenant, handleAuthError } from "@/lib/auth";
import { NextResponse } from "next/server";

// POST /api/inventory/recipes
// Set recipes for a product (replaces existing recipes)
export async function POST(req: Request) {
  try {
    const { tenant } = await requireTenant();
    const { productId, ingredients } = await req.json();

    if (!productId || !Array.isArray(ingredients)) {
      return NextResponse.json(
        { error: "Product ID dan daftar ingredients wajib diisi" },
        { status: 400 }
      );
    }

    // 1. Verify product belongs to tenant
    const product = await prisma.product.findUnique({
      where: { id: productId, tenantId: tenant.id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan atau tidak milik tenant ini" },
        { status: 404 }
      );
    }

    // 2. Verify ALL ingredients belong to tenant before starting transaction
    const ingredientIds = ingredients.map((item: { ingredientId: string }) => item.ingredientId);
    const validIngredientsCount = await prisma.ingredient.count({
      where: {
        id: { in: ingredientIds },
        tenantId: tenant.id,
      },
    });

    if (validIngredientsCount !== ingredientIds.length) {
      return NextResponse.json(
        { error: "Beberapa bahan baku tidak ditemukan atau tidak milik tenant ini" },
        { status: 400 }
      );
    }

    // 3. Update recipes in a transaction
    const updatedRecipes = await prisma.$transaction(async (tx) => {
      // Delete existing recipes for this product
      await tx.recipe.deleteMany({
        where: { 
          productId,
          product: { tenantId: tenant.id }
        },
      });

      // Create new recipes
      const createdRecipes = await Promise.all(
        ingredients.map((item: { ingredientId: string; quantity: number }) =>
          tx.recipe.create({
            data: {
              productId,
              ingredientId: item.ingredientId,
              quantity: Number(item.quantity),
            },
          })
        )
      );

      return createdRecipes;
    });

    return NextResponse.json({ message: "Resep berhasil diperbarui", recipes: updatedRecipes });
  } catch (error: unknown) {
    return handleAuthError(error);
  }
}

// GET /api/inventory/recipes?productId=...
// Get recipes for a product
export async function GET(req: Request) {
  try {
    const { tenant } = await requireTenant();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID wajib diisi" },
        { status: 400 }
      );
    }

    // Verify product belongs to tenant
    const product = await prisma.product.findUnique({
      where: { id: productId, tenantId: tenant.id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan atau tidak milik tenant ini" },
        { status: 404 }
      );
    }

    const recipes = await prisma.recipe.findMany({
      where: { 
        productId,
        product: { tenantId: tenant.id }
      },
      include: {
        ingredient: {
          select: {
            id: true,
            name: true,
            unit: true,
          },
        },
      },
    });

    return NextResponse.json({ recipes });
  } catch (error: unknown) {
    return handleAuthError(error);
  }
}


import { prisma } from "@/lib/prisma";
import { requireTenant, handleAuthError } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { tenant } = await requireTenant();
    const { 
      name, 
      categoryId, 
      price, 
      image, 
      preparationMethod, 
      ingredients 
    } = await req.json();

    if (!name || !categoryId || !price || !ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json(
        { error: "Mohon lengkapi semua data recipe yang wajib diisi" },
        { status: 400 }
      );
    }

    // Start transaction to create product and its recipes
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Product
      const product = await tx.product.create({
        data: {
          name,
          description: preparationMethod || "",
          price: Number(price),
          image: image || null,
          categoryId,
          tenantId: tenant.id,
        },
      });

      // 2. Create the Recipes (ingredient mappings)
      const createdRecipes = await Promise.all(
        ingredients.map((item: { ingredientId: string; quantity: number }) =>
          tx.recipe.create({
            data: {
              productId: product.id,
              ingredientId: item.ingredientId,
              quantity: Number(item.quantity),
            },
          })
        )
      );

      return { product, recipes: createdRecipes };
    });

    return NextResponse.json({ 
      message: "Resep baru berhasil didaftarkan", 
      data: result 
    });
  } catch (error: unknown) {
    console.error("Recipe registration error:", error);
    return handleAuthError(error);
  }
}

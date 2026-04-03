import { prisma } from "@/lib/prisma";
import { requireTenant, handleAuthError } from "@/lib/auth";
import { NextResponse } from "next/server";

// Next.js 15: params is now a Promise
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await params;
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

    // Verify product belongs to tenant (use findFirst for compound where)
    const productExists = await prisma.product.findFirst({
      where: { id: productId, tenantId: tenant.id },
    });

    if (!productExists) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    // Start transaction to update product and its recipes
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update the Product
      const product = await tx.product.update({
        where: { id: productId },
        data: {
          name,
          description: preparationMethod || "",
          price: Number(price),
          image: image || null,
          categoryId,
        },
      });

      // 2. Delete existing recipes
      await tx.recipe.deleteMany({
        where: { productId: product.id },
      });

      // 3. Create the new Recipes (ingredient mappings)
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
      message: "Resep berhasil diperbarui", 
      data: result 
    });
  } catch (error: unknown) {
    console.error("Recipe update error:", error);
    return handleAuthError(error);
  }
}

// DELETE /api/inventory/recipes/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await params;
    const { tenant } = await requireTenant();

    // Verify product belongs to this tenant
    const product = await prisma.product.findFirst({
      where: { id: productId, tenantId: tenant.id },
    });

    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    const txItemCount = await prisma.transactionItem.count({
      where: { productId },
    });

    if (txItemCount > 0) {
      await prisma.product.update({
        where: { id: productId },
        data: { isAvailable: false },
      });
    } else {
      await prisma.$transaction(async (tx) => {
        await tx.recipe.deleteMany({ where: { productId } });
        await tx.product.delete({ where: { id: productId } });
      });
    }

    return NextResponse.json({ message: "Resep berhasil dihapus" });
  } catch (error: unknown) {
    console.error("Recipe delete error:", error);
    return handleAuthError(error);
  }
}

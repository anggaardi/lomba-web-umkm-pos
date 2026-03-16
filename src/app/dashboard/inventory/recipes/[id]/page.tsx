import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import RecipeDetailClient from "./RecipeDetailClient";

export const dynamic = "force-dynamic";

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { tenant } = await requireTenant();

    // 1. Fetch Product with Recipes and Ingredients
    const product = await prisma.product.findFirst({
      where: {
        id: id,
        tenantId: tenant.id,
      },
      include: {
        recipes: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    if (!product) {
      notFound();
    }

    // 2. Fetch all ingredients for the tenant (needed for cost analysis and lookup)
    const ingredients = await prisma.ingredient.findMany({
      where: {
        tenantId: tenant.id,
      },
    });

    // Format Product for client
    const formattedProduct = {
      id: product.id,
      name: product.name,
      price: Number(product.price),
      recipes: product.recipes.map((r) => ({
        id: r.id,
        ingredientId: r.ingredientId,
        ingredientName: r.ingredient.name,
        quantity: r.quantity,
        unit: r.ingredient.unit,
      })),
    };

    // Format Ingredients for client
    const formattedIngredients = ingredients.map((ing) => ({
      id: ing.id,
      name: ing.name,
      stock: ing.stock,
      unit: ing.unit,
      averageCostPerUnit: Number(ing.averageCostPerUnit),
    }));

    return (
      <div className="container mx-auto py-6">
        <RecipeDetailClient 
          product={formattedProduct} 
          ingredients={formattedIngredients} 
        />
      </div>
    );
  } catch (error) {
    console.error("Recipe detail page error:", error);
    redirect("/login");
  }
}

import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/auth";
import InventoryClient from "./InventoryClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  let initialData;
  try {
    const { tenant } = await requireTenant();

    // 1. Fetch Ingredients
    const ingredients = await prisma.ingredient.findMany({
      where: {
        tenantId: tenant.id,
      },
      orderBy: {
        name: "asc",
      },
    });

    // 2. Fetch Products with Recipes
    const products = await prisma.product.findMany({
      where: {
        tenantId: tenant.id,
      },
      include: {
        recipes: {
          include: {
            ingredient: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Format Ingredients for client
    const formattedIngredients = ingredients.map((ing) => ({
      id: ing.id,
      name: ing.name,
      stock: ing.stock,
      unit: ing.unit,
      costPerUnit: Number(ing.costPerUnit),
      updatedAt: ing.updatedAt.toISOString(),
    }));

    // Format Products for client
    const formattedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      recipes: p.recipes.map((r) => ({
        id: r.id,
        ingredientId: r.ingredientId,
        ingredientName: r.ingredient.name,
        quantity: r.quantity,
        unit: r.ingredient.unit,
      })),
    }));

    initialData = {
      ingredients: formattedIngredients,
      products: formattedProducts,
    };
  } catch (error) {
    console.error("Inventory page error:", error);
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-6">
      <InventoryClient 
        initialIngredients={initialData.ingredients} 
        initialProducts={initialData.products}
      />
    </div>
  );
}

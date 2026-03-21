import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/auth";
import { redirect } from "next/navigation";
import RecipesClient from "./RecipesClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Resep Produk | Dashboard",
  description: "Kelola resep produk untuk otomatisasi pengurangan stok bahan baku",
};

export default async function RecipesPage() {
  let initialData;
  try {
    const { tenant } = await requireTenant();

    // Fetch Products with Recipes
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

    // Fetch Ingredients for stock info
    const ingredients = await prisma.ingredient.findMany({
      where: {
        tenantId: tenant.id,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Format Products for client
    const formattedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      image: p.image,
      recipes: p.recipes.map((r) => ({
        id: r.id,
        ingredientId: r.ingredientId,
        ingredientName: r.ingredient.name,
        quantity: r.quantity,
        unit: r.ingredient.unit,
      })),
    }));

    // Format Ingredients for client
    const formattedIngredients = ingredients.map((ing) => ({
      id: ing.id,
      name: ing.name,
      stock: ing.stock,
      unit: ing.unit,
      averageCostPerUnit: Number(ing.averageCostPerUnit),
    }));

    initialData = {
      products: formattedProducts,
      ingredients: formattedIngredients,
    };
  } catch (error) {
    console.error("Recipes page error:", error);
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-6">
      <RecipesClient
        initialProducts={initialData.products}
        initialIngredients={initialData.ingredients}
      />
    </div>
  );
}

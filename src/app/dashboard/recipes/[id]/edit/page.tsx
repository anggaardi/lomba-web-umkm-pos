import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/auth";
import { redirect } from "next/navigation";
import RecipeRegistrationClient from "@/app/dashboard/recipes/_components/RecipeRegistrationClient";

export const dynamic = "force-dynamic";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const { tenant } = await requireTenant();

    // 1. Fetch Ingredients for dropdown
    const ingredients = await prisma.ingredient.findMany({
      where: { tenantId: tenant.id },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        stock: true,
        unit: true,
        averageCostPerUnit: true,
        lastPurchasePrice: true,
        updatedAt: true,
      },
    });

    // 2. Fetch Categories for dropdown
    const categories = await prisma.category.findMany({
      where: { tenantId: tenant.id },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        image: true,
      },
    });

    // 3. Fetch Product with Recipes
    const product = await prisma.product.findFirst({
      where: { id, tenantId: tenant.id },
      include: {
        recipes: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    if (!product) {
      redirect("/dashboard/recipes");
    }

    // Format initial data for the form
    const initialData = {
      id: product.id,
      name: product.name,
      categoryId: product.categoryId || "",
      basePrice: Number(product.price),
      image: product.image,
      preparationMethod: product.description || "",
      recipeItems: product.recipes.map((r) => ({
        ingredientId: r.ingredientId,
        quantity: r.quantity,
        unit: r.ingredient.unit,
        cost: r.quantity * Number(r.ingredient.averageCostPerUnit),
      })),
    };

    // Format ingredients for client
    const formattedIngredients = ingredients.map((ing) => ({
      id: ing.id,
      name: ing.name,
      stock: ing.stock,
      unit: ing.unit,
      averageCostPerUnit: Number(ing.averageCostPerUnit),
      lastPurchasePrice: ing.lastPurchasePrice
        ? Number(ing.lastPurchasePrice)
        : null,
      updatedAt: ing.updatedAt.toISOString(),
      packagings: [],
    }));

    return (
      <div className="container mx-auto py-6">
        <RecipeRegistrationClient
          ingredients={formattedIngredients}
          categories={categories}
          initialData={initialData}
        />
      </div>
    );
  } catch (error) {
    console.error("Edit recipe page error:", error);
    redirect("/dashboard/recipes");
  }
}

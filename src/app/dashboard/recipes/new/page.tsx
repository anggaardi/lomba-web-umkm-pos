import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/auth";
import RecipeRegistrationClient from "@/app/dashboard/recipes/_components/RecipeRegistrationClient";

export const dynamic = "force-dynamic";

export default async function NewRecipePage() {
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

  // 2. Fetch Categories
  const categories = await prisma.category.findMany({
    where: {
      tenantId: tenant.id,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Format for client
  const initialData = {
    ingredients: ingredients.map((ing) => ({
      id: ing.id,
      name: ing.name,
      unit: ing.unit,
      averageCostPerUnit: Number(ing.averageCostPerUnit),
      stock: ing.stock, 
    })),
    categories: categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      image: cat.image,
    })),
  };

  return (
    <RecipeRegistrationClient
      ingredients={initialData.ingredients}
      categories={initialData.categories}
    />
  );
}

import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/auth";
import { redirect } from "next/navigation";
import RecipeRegistrationClient from "./RecipeRegistrationClient";

export const dynamic = "force-dynamic";

export default async function NewRecipePage() {
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
    const formattedIngredients = ingredients.map((ing) => ({
      id: ing.id,
      name: ing.name,
      unit: ing.unit,
      costPerUnit: Number(ing.costPerUnit),
    }));

    const formattedCategories = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
    }));

    return (
      <RecipeRegistrationClient 
        ingredients={formattedIngredients}
        categories={formattedCategories}
      />
    );
  } catch (error) {
    console.error("New recipe page error:", error);
    redirect("/dashboard/inventory");
  }
}

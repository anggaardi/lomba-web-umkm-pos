import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/auth";
import InventoryClient from "./InventoryClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  try {
    const { tenant } = await requireTenant();

    // 1. Fetch Ingredients with Packagings
    const ingredients = await prisma.ingredient.findMany({
      where: {
        tenantId: tenant.id,
      },
      include: {
        packagings: true,
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
      minStock: ing.minStock,
      averageCostPerUnit: Number(ing.averageCostPerUnit),
      lastPurchasePrice: ing.lastPurchasePrice ? Number(ing.lastPurchasePrice) : null,
      updatedAt: ing.updatedAt.toISOString(),
      packagings: ing.packagings.map(p => ({
        id: p.id,
        name: p.name,
        conversionValue: p.conversionValue
      })),
    }));

    return (
      <div className="container mx-auto py-6">
        <InventoryClient initialIngredients={formattedIngredients} />
      </div>
    );
  } catch (error) {
    console.error("Inventory page error:", error);
    redirect("/login");
  }
}

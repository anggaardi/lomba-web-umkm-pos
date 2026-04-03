import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/auth";
import InventoryClient from "./InventoryClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  try {
    const { tenant } = await requireTenant();

    const limit = 10;
    const [ingredients, totalItems, outOfStockCount] = await Promise.all([
      prisma.ingredient.findMany({
        where: { tenantId: tenant.id },
        include: { packagings: true },
        orderBy: { name: "asc" },
        take: limit,
        skip: 0,
      }),
      prisma.ingredient.count({ where: { tenantId: tenant.id } }),
      prisma.ingredient.count({ where: { tenantId: tenant.id, stock: { lte: 0 } } }),
    ]);

    // Low stock: stock > 0 AND stock <= minStock (requires raw SQL for column comparison)
    const lowStockResult = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count 
      FROM "Ingredient" 
      WHERE "tenantId" = ${tenant.id} 
        AND stock > 0 
        AND "minStock" > 0 
        AND stock <= "minStock"
    `;
    const lowStockCount = Number(lowStockResult[0]?.count ?? 0);

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
      packagings: (ing.packagings || []).map(p => ({
        id: p.id,
        name: p.name,
        conversionValue: p.conversionValue
      })),
    }));

    const paginationMetadata = {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: 1,
      limit,
    };

    const initialStats = {
      total: totalItems,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
    };

    return (
      <div className="container mx-auto py-6">
        <InventoryClient 
          initialIngredients={formattedIngredients} 
          initialPagination={paginationMetadata}
          initialStats={initialStats}
        />
      </div>
    );
  } catch (error) {
    console.error("Inventory page error:", error);
    redirect("/login");
  }
}

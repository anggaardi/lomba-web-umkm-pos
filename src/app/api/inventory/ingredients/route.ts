import { prisma } from "@/lib/prisma";
import { requireTenant, handleAuthError } from "@/lib/auth";
import { NextResponse } from "next/server";
import { ingredientCreateSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rateLimit";

const limiter = rateLimit(10, 60000); 

// GET /api/inventory/ingredients
// List ingredients for the tenant with pagination support
export async function GET(req: Request) {
  try {
    const { tenant } = await requireTenant();
    
    // Apply rate limit check
    const rateLimitResponse = await limiter(req);
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(req.url);
    
    // Pagination params
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get total count & global stats (across ALL data, not just current page)
    const [totalItems, outOfStockCount] = await Promise.all([
      prisma.ingredient.count({ where: { tenantId: tenant.id } }),
      prisma.ingredient.count({ where: { tenantId: tenant.id, stock: { lte: 0 } } }),
    ]);

    // MENIPIS requires column comparison (stock <= minStock), use raw query
    const lowStockResult = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count 
      FROM "Ingredient" 
      WHERE "tenantId" = ${tenant.id} 
        AND stock > 0 
        AND "minStock" > 0 
        AND stock <= "minStock"
    `;
    const lowStockCount = Number(lowStockResult[0]?.count ?? 0);

    const ingredients = await prisma.ingredient.findMany({
      where: { tenantId: tenant.id },
      orderBy: { name: "asc" },
      skip,
      take: limit,
      include: {
        packagings: true,
      },
    });

    return NextResponse.json({ 
      ingredients,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit,
      },
      globalStats: {
        total: totalItems,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
      },
    });
  } catch (error: unknown) {
    return handleAuthError(error);
  }
}

// POST /api/inventory/ingredients
// Create a new ingredient
export async function POST(req: Request) {
  try {
    const { tenant } = await requireTenant();
    const body = await req.json();
    
    const validation = ingredientCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, unit, initialStock, initialPrice, minStock } = validation.data;

    const ingredient = await prisma.$transaction(async (tx) => {
      const newIngredient = await tx.ingredient.create({
        data: {
          name,
          unit,
          stock: initialStock || 0,
          averageCostPerUnit: initialStock && initialPrice ? (initialPrice / initialStock) : 0,
          lastPurchasePrice: initialStock && initialPrice ? (initialPrice / initialStock) : null,
          tenantId: tenant.id,
          minStock,
        },
      });

      if (initialStock && initialStock > 0) {
        await tx.stockMovement.create({
          data: {
            ingredientId: newIngredient.id,
            tenantId: tenant.id,
            quantity: initialStock,
            purchasePrice: initialPrice || 0,
            type: "IN",
            source: "PURCHASE",
            notes: "Stok awal saat pembuatan data",
          },
        });
      }

      return newIngredient;
    });

    return NextResponse.json({ ingredient }, { status: 201 });
  } catch (error: unknown) {
    return handleAuthError(error);
  }
}

import { prisma } from "@/lib/prisma";
import { requireTenant, handleAuthError } from "@/lib/auth";
import { NextResponse } from "next/server";
import { packagingCreateSchema } from "@/lib/validations";

// POST /api/inventory/ingredients/packagings
// Create a new packaging template
export async function POST(req: Request) {
  try {
    const { tenant } = await requireTenant();
    const body = await req.json();
    
    const validation = packagingCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, conversionValue, ingredientId } = validation.data;

    // Verify ingredient belongs to tenant
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId, tenantId: tenant.id },
    });

    if (!ingredient) {
      return NextResponse.json({ error: "Ingredient not found" }, { status: 404 });
    }

    const packaging = await prisma.ingredientPackaging.create({
      data: {
        name,
        conversionValue,
        ingredientId,
        tenantId: tenant.id,
      },
    });

    return NextResponse.json({ packaging }, { status: 201 });
  } catch (error: unknown) {
    return handleAuthError(error);
  }
}

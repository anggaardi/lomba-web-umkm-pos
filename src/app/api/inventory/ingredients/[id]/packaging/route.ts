import { prisma } from "@/lib/prisma";
import { requireTenant, handleAuthError } from "@/lib/auth";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

const limiter = rateLimit(10, 60000); // 10 requests per minute

// POST /api/inventory/ingredients/[id]/packaging
// Create a new packaging for this ingredient
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { tenant } = await requireTenant();
    
    // Apply rate limit check
    const rateLimitResponse = await limiter(req);
    if (rateLimitResponse) return rateLimitResponse;

    const { id: ingredientId } = await params;
    const body = await req.json();

    const { name, conversionValue } = body;

    if (!name || !conversionValue || Number(conversionValue) <= 0) {
      return NextResponse.json(
        { error: "Nama kemasan dan nilai konversi wajib diisi" },
        { status: 400 }
      );
    }

    // Verify ingredient belongs to tenant
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId, tenantId: tenant.id },
    });

    if (!ingredient) {
      return NextResponse.json({ error: "Bahan baku tidak ditemukan" }, { status: 404 });
    }

    const packaging = await prisma.ingredientPackaging.create({
      data: {
        name,
        conversionValue: Number(conversionValue),
        ingredientId,
        tenantId: tenant.id,
      },
    });

    return NextResponse.json(packaging, { status: 201 });
  } catch (error: unknown) {
    return handleAuthError(error);
  }
}

// DELETE /api/inventory/ingredients/[id]/packaging?packagingId=xxx
// Delete a specific packaging
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { tenant } = await requireTenant();
    const { id: ingredientId } = await params;
    const { searchParams } = new URL(req.url);
    const packagingId = searchParams.get("packagingId");

    if (!packagingId) {
      return NextResponse.json({ error: "packagingId wajib diisi" }, { status: 400 });
    }

    // Verify the packaging belongs to this ingredient and tenant
    const packaging = await prisma.ingredientPackaging.findFirst({
      where: { id: packagingId, ingredientId, tenantId: tenant.id },
    });

    if (!packaging) {
      return NextResponse.json({ error: "Kemasan tidak ditemukan" }, { status: 404 });
    }

    await prisma.ingredientPackaging.delete({ where: { id: packagingId } });

    return NextResponse.json({ message: "Kemasan berhasil dihapus" });
  } catch (error: unknown) {
    return handleAuthError(error);
  }
}

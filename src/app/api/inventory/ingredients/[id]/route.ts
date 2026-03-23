import { prisma } from "@/lib/prisma";
import { requireTenant, handleAuthError } from "@/lib/auth";
import { NextResponse } from "next/server";
import { recordStockMovement } from "@/lib/inventory";
import { ingredientUpdateStockSchema, ingredientMinStockUpdateSchema } from "@/lib/validations";

// PATCH /api/inventory/ingredients/[id]
// Handle manual restock or adjustments
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { tenant } = await requireTenant();
    const { id: ingredientId } = await params;
    const body = await req.json();

    // If body contains 'minStock' but not 'quantity', handle as minStock update
    if ('minStock' in body && !('quantity' in body)) {
      const validation = ingredientMinStockUpdateSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.issues[0].message },
          { status: 400 }
        );
      }

      try {
        const ingredient = await prisma.ingredient.update({
          where: { id: ingredientId, tenantId: tenant.id },
          data: { minStock: validation.data.minStock },
        });
        return NextResponse.json({ ingredient });
      } catch (e: unknown) {
        if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2025') {
          return NextResponse.json({ error: 'Bahan baku tidak ditemukan' }, { status: 404 });
        }
        throw e;
      }
    }

    const validation = ingredientUpdateStockSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { quantity, type, source, notes } = validation.data;

    const result = await recordStockMovement({
      ingredientId,
      tenantId: tenant.id,
      quantity,
      type,
      source,
      notes,
    });

    return NextResponse.json({ message: "Stok berhasil diperbarui", data: result });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "status" in error) return handleAuthError(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal memperbarui stok" },
      { status: 400 }
    );
  }
}

// DELETE /api/inventory/ingredients/[id]
// Delete an ingredient
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { tenant } = await requireTenant();
    const { id } = await params;

    await prisma.ingredient.delete({
      where: { id, tenantId: tenant.id },
    });

    return NextResponse.json({ message: "Bahan baku berhasil dihapus" });
  } catch (error: unknown) {
    return handleAuthError(error);
  }
}
